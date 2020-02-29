const core = require('@actions/core')
const github = require('@actions/github')
const decompress = require('decompress');

async function main() {
    token = core.getInput("token", { required: true })
    workflow = core.getInput("workflow", { required: true })
    name = core.getInput("name", { required: true })
    path = core.getInput("path") || "./"
    pr = core.getInput("pr")
    commit = core.getInput("commit")

    client = new github.GitHub(token)

    if (pr) {
        pull = await client.pulls.get({
            ...github.context.repo,
            pull_number: pr,
        })
        commit = pull.data.head.sha
    }

    // https://github.com/octokit/routes/issues/665
    runs = await client.actions.listWorkflowRuns({
        ...github.context.repo,
        workflow_id: workflow,
    })

    run = runs.data.find((run) => {
        run.head_sha == commit
    })

    artifacts = await client.actions.listWorkflowRunArtifacts({
        ...github.context.repo,
        run_id: run.id,
    })

    artifact = artifacts.data.find((artifact) => {
        artifact.name == name
    })

    artifact = await client.actions.downloadArtifact({
        ...github.context.repo,
        artifact_id: artifact.id,
        archive_format: "zip",
    })

    decompress(artifact, path).then(files => {
        console.log(files);
    });
}

main()
