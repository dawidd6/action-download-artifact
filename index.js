const core = require('@actions/core')
const github = require('@actions/github')
const AdmZip = require('adm-zip')
const filesize = require('filesize')
const pathname = require('path')
const fs = require('fs')
const pRetry = require('p-retry');


async function listArtifacts(client, owner, repo, runID, name) {
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

    if (artifacts.length == 0) {
        console.log("No artifacts found yet.");
        return Promise.reject("No artifacts found.");
    }

    return artifacts;
}


async function index() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const name = core.getInput("name")
        let workflowConclusion = core.getInput("workflow_conclusion")
        let pr = core.getInput("pr")
        let commit = core.getInput("commit")
        let branch = core.getInput("branch")
        let runID = core.getInput("run_id")
        let runNumber = core.getInput("run_number")

        const client = github.getOctokit(token)

        if ([runID, branch, pr, commit].filter(elem => elem).length > 1) {
            throw new Error("don't specify `run_id`, `branch`, `pr`, `commit` together")
        }

        console.log("==> Workflow:", workflow)

        console.log("==> Repo:", owner + "/" + repo)

        console.log("==> Conclusion:", workflowConclusion)

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

        if (branch) {
            branch = branch.replace(/^refs\/heads\//, "")
            console.log("==> Branch:", branch)
        }

        if (runNumber) {
            console.log("==> RunNumber:", runNumber)
        }

        if (!runID) {
            const endpoint = "GET /repos/:owner/:repo/actions/workflows/:id/runs?status=:status&branch=:branch"
            const params = {
                owner: owner,
                repo: repo,
                id: workflow,
                branch: branch,
                status: workflowConclusion,
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

        let artifacts = await pRetry(
        () => listArtifacts(client, owner, repo, runID, name),
        {retries: 5}
        );

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


exports.listArtifacts = listArtifacts;
exports.retryListArtifacts = retryListArtifacts;

index()
