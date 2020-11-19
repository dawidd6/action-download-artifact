const core = require('@actions/core')
const github = require('@actions/github')
const glob = require('@actions/glob')
const AdmZip = require('adm-zip')
const filesize = require('filesize')
const pathname = require('path')
const fs = require('fs')
const os = require('os')
const rimraf = require('rimraf')

const allowed_workflow_conclusions = ["failure", "success", "neutral", "cancelled", "skipped", "timed_out", "action_required"];

function extractAll(adm, dir) {
    adm.getEntries().forEach((entry) => {
        const action = entry.isDirectory ? "creating" : "inflating"
        const filepath = pathname.join(dir, entry.entryName)

        console.log(`  ${action}: ${filepath}`)
    })

    adm.extractAllTo(dir, true)
}

async function extractWithFilter(adm, filter, dir) {
    tmpdir = pathname.join(os.tmpdir(), "artifact")
    adm.extractAllTo(tmpdir, true)
    
    const globber = await glob.create(filter.map(s => `${tmpdir}${s}`).join("\n"))
    for await (const file of globber.globGenerator()){
        // Only copy files that we know are matched
        if (fs.lstatSync(file).isDirectory()) {
            return;
        }

        const filepath = file.slice(tmpdir.length)
        const destination = pathname.join(dir, filepath)
        console.log(`  creating: ${destination}`)

        fs.copyFileSync(file, destination)
    }

    rimraf.sync(tmpdir)
}

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const workflow = core.getInput("workflow", { required: true })
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const name = core.getInput("name")
        const workflow_conclusion = core.getInput("workflow_conclusion")
        let filter = core.getInput("filter", { required: false })
        let pr = core.getInput("pr")
        let commit = core.getInput("commit")
        let branch = core.getInput("branch")
        let runID = core.getInput("run_id")

        const client = github.getOctokit(token)

        if ([runID, branch, pr, commit, workflow_conclusion].filter(elem => elem).length > 1) {
            throw new Error("don't specify `run_id`, `branch`, `pr`, `commit` and `workflow_conclusion` together")
        }

        if(workflow_conclusion && !allowed_workflow_conclusions.includes(workflow_conclusion)) {
            throw new Error(`Unknown workflow conclusion '${workflow_conclusion}'`)
        }

        // If a filter is provided, treat it as a line-delimeted array
        if (filter) {
            filter = filter
                .split("\n")
                .map(s => s.trim())
                .filter(x => x !== "");
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

        if (!runID) {
            const endpoint = "GET /repos/:owner/:repo/actions/workflows/:id/runs"
            const params = {
                owner: owner,
                repo: repo,
                id: workflow,
                branch: branch
            }
            for await (const runs of client.paginate.iterator(endpoint, params)) {
                const run = runs.data.find(r => {
                    if (commit) {
                        return r.head_sha == commit
                    } else if(workflow_conclusion) {
                        return r.conclusion == workflow_conclusion
                    } else {
                        // No PR, commit or conclusion was specified; just return the first one.
                        // The results appear to be sorted from API, so the most recent is first.
                        // Just check if workflow run completed.
                        return r.status == "completed"
                    }
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

            if (filter) {
                await extractWithFilter(adm, filter, dir)
            } else {
                extractAll(adm, dir)
            }
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

main()
