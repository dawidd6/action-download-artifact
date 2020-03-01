const core = require('@actions/core')
const github = require('@actions/github')
const decompress = require('decompress')

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const name = core.getInput("name", { required: true })
        const path = core.getInput("path")
        const pr = core.getInput("pr")
        let commit = core.getInput("commit")

        const client = new github.GitHub(token)

        if (pr) {
            const pull = await client.pulls.get({
                ...github.context.repo,
                pull_number: pr,
            })
            commit = pull.data.head.sha
        }

        // https://github.com/octokit/routes/issues/665
        const runs = await client.actions.listWorkflowRuns({
            ...github.context.repo,
            workflow_id: workflow,
        })

        const run = runs.data.find((run) => {
            run.head_sha == commit
        })

        const artifacts = await client.actions.listWorkflowRunArtifacts({
            ...github.context.repo,
            run_id: run.id,
        })

        const artifact = artifacts.data.find((artifact) => {
            artifact.name == name
        })

        const artifact = await client.actions.downloadArtifact({
            ...github.context.repo,
            artifact_id: artifact.id,
            archive_format: "zip",
        })

        decompress(artifact, path).then(files => {
            console.log(files);
        });
    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
