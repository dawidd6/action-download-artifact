const core = require('@actions/core')
const github = require('@actions/github')
const AdmZip = require('adm-zip')
const fs = require("fs")
const filesize = require('filesize')
const pathname = require('path')

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const name = core.getInput("name")
        let branch = core.getInput("branch")
        let pr = core.getInput("pr")
        let commit = core.getInput("commit")

        const client = github.getOctokit(token)

        console.log("==> Repo:", owner + "/" + repo)

        if (branch) {
            console.log("==> Branch:", branch)

            if (pr) {
                console.log("==> Branch and PR can not be defined at the same time, ignoring PR:", pr)
                pr = undefined
            }

            if (commit) {
                console.log("==> Branch and Commit can not be defined at the same time, ignoring Commit:", commit)
                commit = undefined
            }
        }

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

        let run
        const endpoint = "GET /repos/:owner/:repo/actions/workflows/:id/runs"
        const params = {
            owner: owner,
            repo: repo,
            id: workflow,
            branch: branch
        }
        for await (const runs of client.paginate.iterator(endpoint, params)) {
            run = runs.data.find((run) => {
                if (commit) {
                    return run.head_sha == commit
                }
                else {
                    // No PR or commit was specified just return the first one.
                    // The results appear to be sorted from API, so the most recent is first.
                    // Just check if workflow run completed.
                    return run.status == "completed"
                }
            })

            if (run) {
                break
            }
        }

        console.log("==> Run:", run.id)

        const artifacts = await client.actions.listWorkflowRunArtifacts({
            owner: owner,
            repo: repo,
            run_id: run.id,
        })

        let atfs;
        if (name) {
            atfs = artifacts.data.artifacts.filter((artifact) => {
                return artifact.name == name
            }) 
        }
        else {
            artfs = artifacts.data.artifacts
            // If we download all, it puts under each artifact name.
            artfs.forEach(function (artifact) {
                dirpath = pathname.join(path, artifact.name)
                fs.mkdirSync(dirpath, { recursive: true })
            })
        }

        for (const artifact of artfs) {
            console.log("==> Artifact:", artifact.id)

            const size = filesize(artifact.size_in_bytes, { base: 10 })

            console.log("==> Downloading:", name + ".zip", `(${size})`)

            const zip = await client.actions.downloadArtifact({
                owner: owner,
                repo: repo,
                artifact_id: artifact.id,
                archive_format: "zip",
            })

            const adm = new AdmZip(Buffer.from(zip.data))
            adm.getEntries().forEach((entry) => {
                const action = entry.isDirectory ? "creating" : "inflating"
                let filepath;
                if (name) {
                    filepath = pathname.join(path, entry.entryName)
                }
                else {
                    filepath = pathname.join(path, artifact.name, entry.entryName)
                }
                console.log(`  ${action}: ${filepath}`)
            })
            if (name) {
                adm.extractAllTo(path, true)
            }
            else {
                adm.extractAllTo(pathname.join(path, artifact.name), true)
            }
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
