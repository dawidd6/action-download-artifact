const core = require('@actions/core')
const github = require('@actions/github')
const decompress = require('decompress')

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const name = core.getInput("name", { required: true })
        const path = core.getInput("path") || "./"
        const pr = core.getInput("pr")
        let commit = core.getInput("commit")

        const client = new github.GitHub(token)

        if (pr) {
            console.log("==> PR:", pr)

            const pull = await client.pulls.get({
                ...github.context.repo,
                pull_number: pr,
            })
            commit = pull.data.head.sha
        }

        console.log("==> Commit:", commit)

        // https://github.com/octokit/routes/issues/665
        const runs = await client.actions.listWorkflowRuns({
            ...github.context.repo,
            workflow_id: workflow,
        })

        const run = runs.data.workflow_runs.find((run) => {
            return run.head_sha == commit
        })

        console.log("==> Run:", run.id)

        const artifacts = await client.actions.listWorkflowRunArtifacts({
            ...github.context.repo,
            run_id: run.id,
        })

        const artifact = artifacts.data.artifacts.find((artifact) => {
            return artifact.name == name
        })

        console.log("==> Artifact:", artifact.id)

        const zip = await client.actions.downloadArtifact({
            ...github.context.repo,
            artifact_id: artifact.id,
            archive_format: "zip",
        })

        decompress(zip, path).then(files => {
            console.log(files);
        });
    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
