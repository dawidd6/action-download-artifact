const core = require('@actions/core')
const github = require('@actions/github')
const AdmZip = require('adm-zip')
const filesize = require('filesize')

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const name = core.getInput("name", { required: true })
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const pr = core.getInput("pr")
        let commit = core.getInput("commit")

        const client = new github.GitHub(token)

        client.registerEndpoints({
            actions: {
                listWorkflowRunsFixed: {
                    method: "GET",
                    url: "/repos/:owner/:repo/actions/workflows/:workflow_id/runs",
                    headers: {
                        accept: "application/vnd.github.groot-preview+json"
                    },
                    params: {
                        owner: {
                            required: true,
                            type: "string"
                        },
                        repo: {
                            required: true,
                            type: "string"
                        },
                        workflow_id: {
                            required: true,
                            type: "string",
                        }
                    }
                }
            }
        })

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
        else {
            console.log("==> No Commit or PR specified - fetching artifact from most recent run")
        }

        // https://github.com/octokit/routes/issues/665
        const options = await client.actions.listWorkflowRunsFixed.endpoint.merge({
            owner: owner,
            repo: repo,
            workflow_id: workflow,
        })

        let run
        for await (const response of client.paginate.iterator(options)) {
            
            if (commit) {
                const matching_run = response.data.workflow_runs.find((workflow_run) => {
                    return workflow_run.head_sha == commit
                })
            }
            else {
                const matching_run = response.data.workflow_runs[0]
            }

            if (matching_run) {
                run = matching_run
                break
            }
        }

        console.log("==> Run:", run.id)

        const artifacts = await client.actions.listWorkflowRunArtifacts({
            owner: owner,
            repo: repo,
            run_id: run.id,
        })

        const artifact = artifacts.data.artifacts.find((artifact) => {
            return artifact.name == name
        })

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
            console.log(`  ${action}: ${path}/${entry.entryName}`)
        })
        adm.extractAllTo(path, true)
    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
