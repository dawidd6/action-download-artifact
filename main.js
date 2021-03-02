const core = require('@actions/core')
const github = require('@actions/github')
const AdmZip = require('adm-zip')
const filesize = require('filesize')
const pathname = require('path')
const fs = require('fs')

// https://docs.github.com/en/free-pro-team@latest/rest/reference/actions#list-workflow-runs
// allows for both status or conclusion to be used as status filter
const allowed_workflow_conclusions = ["failure", "success", "neutral", "cancelled", "skipped", "timed_out", "action_required", "queued", "in_progress", "completed"]

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const name = core.getInput("name")
        let workflow_conclusion = core.getInput("workflow_conclusion")
        let pr = core.getInput("pr")
        let commit = core.getInput("commit")
        let branch = core.getInput("branch")
        let runID = core.getInput("run_id")
        let runNumber = core.getInput("run_number")

        const client = github.getOctokit(token)

        if ([runID, branch, pr, commit, runNumber].filter(elem => elem).length > 1) {
            throw new Error("don't specify `run_id`, `branch`, `pr`, `commit` together")
        }

        if ([runID, workflow_conclusion].filter((elem) => elem).length > 1) {
            throw new Error("don't specify `run_id`, `workflow_conclusion` together")
        }

        if (!workflow_conclusion) {
            workflow_conclusion = "completed"
        }

        if(!allowed_workflow_conclusions.includes(workflow_conclusion)) {
            throw new Error(`Unknown workflow conclusion '${workflow_conclusion}'`)
        }

        console.log("==> Repo:", owner + "/" + repo)

        if (pr) {
            console.log("==> PR:", pr)

            const pull = await client.pulls.get({
                owner: owner,
                repo: repo,
                pull_number: pr,
            })
            commit = pull.data.head.sha
        }

        if (commit) {
            console.log("==> Commit:", commit)
        }
        if (runNumber) {
            console.log("==> RunNumber:", runNumber)
        }

        if (!runID) {
            branch = branch.replace(/^refs\/heads\//, "")
            const endpoint = "GET /repos/:owner/:repo/actions/workflows/:id/runs?status=:status&branch=:branch"
            const params = {
                owner: owner,
                repo: repo,
                id: workflow,
                branch: branch,
                status: workflow_conclusion,
            }
            for await (const runs of client.paginate.iterator(endpoint,params)) {
                const run = runs.data.find(r => {
                    if (commit) {
                        return r.head_sha == commit
                    }
                    if (runNumber) {
                        return r.run_number == runNumber
                    }
                    return true
                })

                if (run) {
                    runID = run.id
                    break
                }
            }
        }

        console.log("==> RunID:", runID)

        let artifacts = await client.actions.listWorkflowRunArtifacts({
            owner: owner,
            repo: repo,
            run_id: runID,
        })

        // One artifact or all if `name` input is not specified.
        if (name) {
            artifacts = artifacts.data.artifacts.filter((artifact) => {
                return artifact.name == name
            })
        } else {
            artifacts = artifacts.data.artifacts
        }

        if (artifacts.length == 0) 
          throw new Error("no artifacts found")

        for (const artifact of artifacts) {
            console.log("==> Artifact:", artifact.id)

            const size = filesize(artifact.size_in_bytes, { base: 10 })

            console.log("==> Downloading:", artifact.name + ".zip", `(${size})`)

            const zip = await client.actions.downloadArtifact({
                owner: owner,
                repo: repo,
                artifact_id: artifact.id,
                archive_format: "zip",
            })

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
        core.setFailed(error.message)
    }
}

main()
