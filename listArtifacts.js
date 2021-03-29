const retry = require('retry');

async function listArtifacts(client, owner, repo, runID) {
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

    return artifacts;
}

async function retryListArtifacts(client, owner, repo, runID) {

    // TODO: create backoff here using condition artifacts.length == 0
    // Use npm module https://npmjs.com/package/backoff
    let artifacts = await  listArtifacts(owner, repo, runID);

    if (artifacts.length == 0)
        throw new Error("no artifacts found")

}

exports.listArtifacts = listArtifacts;
exports.retryListArtifacts = retryListArtifacts;