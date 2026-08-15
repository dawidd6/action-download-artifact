import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import { defaults as githubDefaults } from '@actions/github/lib/utils'
import * as artifact from '@actions/artifact'
import AdmZip from 'adm-zip'
import { filesize } from 'filesize'
import { randomUUID } from 'node:crypto'
import pathname from 'node:path'
import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const name = core.getInput("name")
        const nameIsRegExp = core.getBooleanInput("name_is_regexp")
        const skipUnpack = core.getBooleanInput("skip_unpack")
        const ifNoArtifactFound = core.getInput("if_no_artifact_found")
        const useUnzip = core.getBooleanInput("use_unzip")
        const mergeMultiple = core.getBooleanInput("merge_multiple")
        let workflow = core.getInput("workflow")
        let workflowSearch = core.getBooleanInput("workflow_search")
        let workflowConclusion = core.getInput("workflow_conclusion")
        let pr = core.getInput("pr")
        let commit = core.getInput("commit")
        let branch = core.getInput("branch")
        let ref = core.getInput("ref")
        let event = core.getInput("event")
        let runID = core.getInput("run_id")
        let runNumber = core.getInput("run_number")
        let checkArtifacts = core.getBooleanInput("check_artifacts")
        let searchArtifacts = core.getBooleanInput("search_artifacts")
        const allowForks = core.getBooleanInput("allow_forks")
        let dryRun = core.getInput("dry_run")

        const client = github.getOctokit(token)
        const artifactClient = new artifact.DefaultArtifactClient()
        const hostname = new URL(github.context.serverUrl).hostname.toUpperCase()
        const canStreamArtifacts = hostname === "GITHUB.COM" || hostname.endsWith(".GHE.COM") || hostname.endsWith(".LOCALHOST")

        core.info(`==> Repository: ${owner}/${repo}`)
        core.info(`==> Artifact name: ${name}`)
        core.info(`==> Local path: ${path}`)

        if (!workflow && !workflowSearch) {
            workflow = (await client.rest.actions.getWorkflowRun({
                owner: owner,
                repo: repo,
                run_id: runID || github.context.runId,
            })).data.workflow_id
        }

        if (workflow) {
            core.info(`==> Workflow name: ${workflow}`)
        }
        core.info(`==> Workflow conclusion: ${workflowConclusion}`)

        const uniqueInputSets = [
            {
                "pr": pr,
                "commit": commit,
                "branch": branch,
                "ref": ref,
                "run_id": runID
            }
        ]
        uniqueInputSets.forEach((inputSet) => {
            const inputs = Object.values(inputSet)
            const providedInputs = inputs.filter(input => input !== '')
            if (providedInputs.length > 1) {
                throw new Error(`The following inputs cannot be used together: ${Object.keys(inputSet).join(", ")}`)
            }
        })

        if (pr) {
            core.info(`==> PR: ${pr}`)
            const pull = await client.rest.pulls.get({
                owner: owner,
                repo: repo,
                pull_number: pr,
            })
            commit = pull.data.head.sha
            //branch = pull.data.head.ref
        }

        if (ref) {
            // Try to determine if the ref is a branch or a commit
            core.info(`==> Ref: ${ref}`)
            try {
                await client.rest.repos.getBranch({
                    owner: owner,
                    repo: repo,
                    branch: ref,
                })
                branch = ref
            } catch (error) {
                const response = await client.rest.repos.getCommit({
                    owner: owner,
                    repo: repo,
                    ref: ref,
                })
                commit = response.data.sha
            }
        }

        if (commit) {
            core.info(`==> Commit: ${commit}`)
        }

        if (branch) {
            branch = branch.replace(/^refs\/heads\//, "")
            core.info(`==> Branch: ${branch}`)
        }

        if (event) {
            core.info(`==> Event: ${event}`)
        }

        if (runNumber) {
            core.info(`==> Run number: ${runNumber}`)
        }

        core.info(`==> Allow forks: ${allowForks}`)

        if (!runID) {
            const runGetter = workflow ? client.rest.actions.listWorkflowRuns : client.rest.actions.listWorkflowRunsForRepo
            // Note that the runs are returned in most recent first order.
            for await (const runs of client.paginate.iterator(runGetter, {
                owner: owner,
                repo: repo,
                ...(workflow ? { workflow_id: workflow } : {}),
                ...(branch ? { branch } : {}),
                ...(event ? { event } : {}),
                ...(commit ? { head_sha: commit } : {}),
                ...(workflowConclusion ? { status: workflowConclusion } : {}),
            }
            )) {
                for (const run of runs.data) {
                    if (runNumber && run.run_number != runNumber) {
                        continue
                    }
                    if (!allowForks && run.head_repository.full_name !== `${owner}/${repo}`) {
                        core.info(`==> Skipping run from fork: ${run.head_repository.full_name}`)
                        continue
                    }
                    if (checkArtifacts || searchArtifacts) {
                        let artifacts = await client.paginate(client.rest.actions.listWorkflowRunArtifacts, {
                            owner: owner,
                            repo: repo,
                            run_id: run.id,
                        })
                        if (!artifacts || artifacts.length == 0) {
                            continue
                        }
                        if (searchArtifacts) {
                            const artifact = artifacts.find((artifact) => {
                                if (nameIsRegExp) {
                                    return artifact.name.match(name) !== null
                                }
                                return artifact.name == name
                            })
                            if (!artifact) {
                                continue
                            }
                        }
                    }

                    runID = run.id
                    core.info(`==> (found) Run ID: ${runID}`)
                    core.info(`==> (found) Run date: ${run.created_at}`)

                    if (!workflow) {
                        workflow = run.workflow_id
                        core.info(`==> (found) Workflow: ${workflow}`)
                    }
                    break
                }
                if (runID) {
                    break
                }
            }
        }

        if (!runID) {
            if (workflowConclusion && (workflowConclusion != 'in_progress')) {
                return setExitMessage(ifNoArtifactFound, "no matching workflow run found with any artifacts?")
            }
            runID = github.context.runId
            core.info(`==> (current) Run ID: ${runID}`)
        }

        let artifacts = await client.paginate(client.rest.actions.listWorkflowRunArtifacts, {
            owner: owner,
            repo: repo,
            run_id: runID,
        })

        // One artifact if 'name' input is specified, one or more if `name` is a regular expression, all otherwise.
        if (name) {
            const filtered = artifacts.filter((artifact) => {
                if (nameIsRegExp) {
                    return artifact.name.match(name) !== null
                }
                return artifact.name == name
            })
            if (filtered.length == 0) {
                core.info(`==> (not found) Artifact: ${name}`)
                core.info('==> Found the following artifacts instead:')
                for (const artifact of artifacts) {
                    core.info(`\t==> (found) Artifact: ${artifact.name}`)
                }
            }
            artifacts = filtered
        }

        artifacts.sort((a, b) => a.created_at.localeCompare(b.created_at))

        core.setOutput("artifacts", artifacts)

        if (dryRun) {
            if (artifacts.length == 0) {
                core.setOutput("dry_run", false)
                core.setOutput("found_artifact", false)
                return
            } else {
                core.setOutput("dry_run", true)
                core.setOutput("found_artifact", true)
                core.info('==> (found) Artifacts')
                for (const artifact of artifacts) {
                    const size = filesize(artifact.size_in_bytes, { base: 10 })
                    core.info(`\t==> Artifact:`)
                    core.info(`\t==> ID: ${artifact.id}`)
                    core.info(`\t==> Name: ${artifact.name}`)
                    core.info(`\t==> Size: ${size}`)
                }
                return
            }
        }

        if (artifacts.length == 0) {
            return setExitMessage(ifNoArtifactFound, "no artifacts found")
        }

        let downloadedArtifact = false
        const expiredArtifacts = []

        for (const artifact of artifacts) {
            core.info(`==> Artifact: ${artifact.id}`)

            const size = filesize(artifact.size_in_bytes, { base: 10 })

            core.info(`==> Downloading: ${artifact.name} (${size})`)

            if (artifact.expired) {
                if (ifNoArtifactFound === "fail") {
                    return setExitMessage(ifNoArtifactFound, "no downloadable artifacts found (expired)")
                }
                expiredArtifacts.push(artifact.name)
                continue
            }

            const dir = skipUnpack || (name && (!nameIsRegExp || mergeMultiple))
                ? path
                : pathname.join(path, artifact.name)

            if (canStreamArtifacts) {
                let response
                try {
                    response = await artifactClient.downloadArtifact(artifact.id, {
                        path: dir,
                        skipDecompress: skipUnpack || useUnzip,
                        ...(artifact.digest ? { expectedHash: artifact.digest } : {}),
                        findBy: {
                            token: token,
                            workflowRunId: Number(runID),
                            repositoryOwner: owner,
                            repositoryName: repo,
                        },
                    })
                } catch (error) {
                    if (error.message.includes("Artifact has expired")) {
                        if (ifNoArtifactFound === "fail") {
                            return setExitMessage(ifNoArtifactFound, "no downloadable artifacts found (expired)")
                        }
                        expiredArtifacts.push(artifact.name)
                        continue
                    }
                    throw error
                }

                if (response.digestMismatch) {
                    throw new Error(`artifact digest mismatch: ${artifact.name}`)
                }

                const zipPath = pathname.join(dir, `${artifact.name}.zip`)
                if (useUnzip && !skipUnpack && fs.existsSync(zipPath)) {
                    core.startGroup(`==> Extracting: ${artifact.name}.zip`)
                    try {
                        await exec.exec("unzip", [zipPath, "-d", dir])
                    } finally {
                        core.endGroup()
                    }
                    fs.rmSync(zipPath)
                }
                downloadedArtifact = true
                continue
            }

            fs.mkdirSync(dir, { recursive: true })
            const zipPath = pathname.join(dir, `.artifact-${randomUUID()}.zip`)

            try {
                await client.request("GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}", {
                    owner: owner,
                    repo: repo,
                    artifact_id: artifact.id,
                    archive_format: "zip",
                    request: {
                        fetch: async (url, options) => {
                            const response = await githubDefaults.request.fetch(url, { ...options, redirect: "follow" })
                            if (!response.ok) return response
                            await pipeline(response.body, fs.createWriteStream(zipPath))
                            return new Response(null, { status: 200, headers: response.headers })
                        },
                    },
                })
            } catch (error) {
                fs.rmSync(zipPath, { force: true })
                if (error.message?.startsWith("Artifact has expired")) {
                    if (ifNoArtifactFound === "fail") {
                        return setExitMessage(ifNoArtifactFound, "no downloadable artifacts found (expired)")
                    }
                    expiredArtifacts.push(artifact.name)
                    continue
                }
                throw error
            }

            downloadedArtifact = true
            if (skipUnpack) {
                try {
                    fs.renameSync(zipPath, `${pathname.join(path, artifact.name)}.zip`)
                } finally {
                    fs.rmSync(zipPath, { force: true })
                }
                continue
            }

            try {
                core.startGroup(`==> Extracting: ${artifact.name}.zip`)
                try {
                    if (useUnzip) {
                        await exec.exec("unzip", [zipPath, "-d", dir])
                    } else {
                        const adm = new AdmZip(zipPath)
                        adm.getEntries().forEach((entry) => {
                            const action = entry.isDirectory ? "creating" : "inflating"
                            const filepath = pathname.join(dir, entry.entryName)

                            core.info(`  ${action}: ${filepath}`)
                        })
                        adm.extractAllTo(dir, true)
                    }
                } finally {
                    core.endGroup()
                }
            } finally {
                fs.rmSync(zipPath, { force: true })
            }
        }

        if (!downloadedArtifact) {
            return setExitMessage(ifNoArtifactFound, "no downloadable artifacts found (expired)")
        }

        if (expiredArtifacts.length > 0) {
            const label = expiredArtifacts.length === 1 ? "artifact" : "artifacts"
            const message = `skipped expired ${label}: ${expiredArtifacts.join(", ")}`
            if (ifNoArtifactFound === "warn") {
                core.warning(message)
            } else {
                core.info(message)
            }
        }

        core.setOutput("found_artifact", true)
    } catch (error) {
        core.setOutput("found_artifact", false)
        core.setOutput("error_message", error.message)
        core.setFailed(error.message)
    }

    function setExitMessage(ifNoArtifactFound, message) {
        core.setOutput("found_artifact", false)

        switch (ifNoArtifactFound) {
            case "fail":
                core.setFailed(message)
                break
            case "warn":
                core.warning(message)
                break
            case "ignore":
            default:
                core.info(message)
                break
        }
    }
}

main()
