const core = require('@actions/core')
const github = require('@actions/github')
const AdmZip = require('adm-zip')
const filesize = require('filesize')
const pathname = require('path')
const fs = require('fs')

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const name = core.getInput("name")
        const skipUnpack = core.getInput("skip_unpack")
        let workflowConclusion = core.getInput("workflow_conclusion")
        let pr = core.getInput("pr")
        let commit = core.getInput("commit")
        let branch = core.getInput("branch")
        let event = core.getInput("event")
        let runID = core.getInput("run_id")
        let runNumber = core.getInput("run_number")
        let checkArtifacts = core.getInput("check_artifacts")
        let searchArtifacts = core.getInput("search_artifacts")
        let dryRun = core.getInput("dry_run")

        const client = github.getOctokit(token)

        console.log("==> Artifact name:", name)
        console.log("==> Local path:", path)
        console.log("==> Workflow name:", workflow)
        console.log("==> Repository:", owner + "/" + repo)
        console.log("==> Workflow conclusion:", workflowConclusion)

        if (pr) {
            console.log("==> PR:", pr)
            const pull = await client.pulls.get({
                owner: owner,
                repo: repo,
                pull_number: pr,
            })
            commit = pull.data.head.sha
            //branch = pull.data.head.ref
        }

        if (commit) {
            console.log("==> Commit:", commit)
        }

        if (branch) {
            branch = branch.replace(/^refs\/heads\//, "")
            console.log("==> Branch:", branch)
        }

        if (event) {
            console.log("==> Event:", event)
        }

        if (runNumber) {
            console.log("==> RunNumber:", runNumber)
        }

        if (!runID) {
            // Note that the runs are returned in most recent first order.
            for await (const runs of client.paginate.iterator(client.actions.listWorkflowRuns, {
                owner: owner,
                repo: repo,
                workflow_id: workflow,
                ...(branch ? { branch } : {}),
                ...(event ? { event } : {}),
            }
            )) {
                for (const run of runs.data) {
                    if (commit && run.head_sha != commit) {
                        continue
                    }
                    if (runNumber && run.run_number != runNumber) {
                        continue
                    }
                    if (workflowConclusion && (workflowConclusion != run.conclusion && workflowConclusion != run.status)) {
                        continue
                    }
                    if (checkArtifacts || searchArtifacts) {
                        let artifacts = await client.actions.listWorkflowRunArtifacts({
                            owner: owner,
                            repo: repo,
                            run_id: run.id,
                        })
                        if (artifacts.data.artifacts.length == 0) {
                            continue
                        }
                        if (searchArtifacts) {
                            const artifact = artifacts.data.artifacts.find((artifact) => {
                                return artifact.name == name
                            })
                            if (!artifact) {
                                continue
                            }
                        }
                    }
                    runID = run.id
                    console.log("==> (found) Run ID:", runID)
                    console.log("==> (found) Run date:", run.created_at)
                    break
                }
                if (runID) {
                    break
                }
            }
        }

        if (!runID) {
            throw new Error("no matching workflow run found with any artifacts?")
        }

        let artifacts = await client.paginate(client.actions.listWorkflowRunArtifacts, {
            owner: owner,
            repo: repo,
            run_id: runID,
        })

        // One artifact or all if `name` input is not specified.
        if (name) {
            filtered = artifacts.filter((artifact) => {
                return artifact.name == name
            })
            if (filtered.length == 0) {
                console.log("==> (not found) Artifact:", name)
                console.log("==> Found the following artifacts instead:")
                for (const artifact of artifacts) {
                    console.log("\t==> (found) Artifact:", artifact.name)
                }
            }
            artifacts = filtered
        }

        if (dryRun) {
            if (artifacts.length == 0) {
                core.setOutput("dry_run", false)
                return
            } else {
                core.setOutput("dry_run", true)
                console.log("==> Artifacts Found")
                for (const artifact of artifacts){
                    const size = filesize(artifact.size_in_bytes, { base: 10 })
                    console.log(
                        `\t==> Artifact:`,
                        `\n\t==> ID: ${artifact.id}`,
                        `\n\t==> Name: ${artifact.name}`,
                        `\n\t==> Size: ${size}`
                    )
                }
                return
            }
        }

        if (artifacts.length == 0) {
            throw new Error("no artifacts found")
        }

        for (const artifact of artifacts) {
            console.log("==> Artifact:", artifact.id)

            const size = filesize(artifact.size_in_bytes, { base: 10 })

            console.log(`==> Downloading: ${artifact.name}.zip (${size})`)

            const zip = await client.actions.downloadArtifact({
                owner: owner,
                repo: repo,
                artifact_id: artifact.id,
                archive_format: "zip",
            })

            if (skipUnpack) {
                fs.writeFileSync(`${artifact.name}.zip`, Buffer.from(zip.data), 'binary')
                continue
            }

            const dir = name ? path : pathname.join(path, artifact.name)

            fs.mkdirSync(dir, { recursive: true })

            const adm = new AdmZip(Buffer.from(zip.data))

            adm.getEntries().forEach((entry) => {
                const action = entry.isDirectory ? "creating" : "inflating"
                const filepath = pathname.join(dir, entry.entryName)

                console.log(`  ${action}: ${filepath}`)
            })

            adm.extractAllTo(dir, true)
        }
    } catch (error) {
        core.setOutput("error_message", error.message)
        core.setFailed(error.message)
    }
}

main()

