const core = require('@actions/core')
const filesize = require('filesize')
const fs = require('fs')
const github = require('@actions/github')
const https = require('follow-redirects').https;
const pathname = require('path')
const url = require('url')
const yauzl = require("yauzl");

async function main() {
    try {
        const token = core.getInput("github_token", { required: true })
        const [owner, repo] = core.getInput("repo", { required: true }).split("/")
        const path = core.getInput("path", { required: true })
        const name = core.getInput("name")
        const skipUnpack = core.getInput("skip_unpack")
        const ifNoArtifactFound = core.getInput("if_no_artifact_found")
        let workflow = core.getInput("workflow")
        let workflowConclusion = core.getInput("workflow_conclusion")
        let pr = core.getInput("pr")
        let commit = core.getInput("commit")
        let branch = core.getInput("branch")
        let event = core.getInput("event")
        let runID = core.getInput("run_id")
        let runNumber = core.getInput("run_number")
        let checkArtifacts = core.getInput("check_artifacts")
        let searchArtifacts = core.getInput("search_artifacts")
        let dryRun = core.getInput("dry_run")

        const client = github.getOctokit(token)

        core.info(`==> Repository: ${owner}/${repo}`)
        core.info(`==> Artifact name: ${name}`)
        core.info(`==> Local path: ${path}`)

        if (!workflow) {
            const run = await client.rest.actions.getWorkflowRun({
                owner: owner,
                repo: repo,
                run_id: runID || github.context.runId,
            })
            workflow = run.data.workflow_id
        }

        core.info(`==> Workflow name: ${workflow}`)
        core.info(`==> Workflow conclusion: ${workflowConclusion}`)

        const uniqueInputSets = [
            {
                "pr": pr,
                "commit": commit,
                "branch": branch,
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

        if (!runID) {
            // Note that the runs are returned in most recent first order.
            for await (const runs of client.paginate.iterator(client.rest.actions.listWorkflowRuns, {
                owner: owner,
                repo: repo,
                workflow_id: workflow,
                ...(branch ? { branch } : {}),
                ...(event ? { event } : {}),
            }
            )) {
                for (const run of runs.data) {
                    if (commit && run.head_sha != commit) {
                        continue
                    }
                    if (runNumber && run.run_number != runNumber) {
                        continue
                    }
                    if (workflowConclusion && (workflowConclusion != run.conclusion && workflowConclusion != run.status)) {
                        continue
                    }
                    if (checkArtifacts || searchArtifacts) {
                        let artifacts = await client.rest.actions.listWorkflowRunArtifacts({
                            owner: owner,
                            repo: repo,
                            run_id: run.id,
                        })
                        if (artifacts.data.artifacts.length == 0) {
                            continue
                        }
                        if (searchArtifacts) {
                            const artifact = artifacts.data.artifacts.find((artifact) => {
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
                    break
                }
                if (runID) {
                    break
                }
            }
        }

        if (!runID) {
            return setExitMessage(ifNoArtifactFound, "no matching workflow run found with any artifacts?")
        }

        let artifacts = await client.paginate(client.rest.actions.listWorkflowRunArtifacts, {
            owner: owner,
            repo: repo,
            run_id: runID,
        })

        // One artifact or all if `name` input is not specified.
        if (name) {
            filtered = artifacts.filter((artifact) => {
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

        core.setOutput("found_artifact", true)
        
        for (const artifact of artifacts) {
            core.info(`==> Artifact: ${artifact.id}`)

            const size = filesize(artifact.size_in_bytes, { base: 10 })

            core.info(`==> Downloading: ${artifact.name}.zip (${size})`)

            let saveTo = `${pathname.join(path, artifact.name)}.zip`
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true })
            }

            let request = client.rest.actions.downloadArtifact.endpoint({
                owner: owner,
                repo: repo,
                artifact_id: artifact.id,
                archive_format: "zip",
            });

            const sendGetRequest = async () => {
                return new Promise(resolve => {
                    const options = {
                        hostname: url.parse(request.url).hostname,
                        path: url.parse(request.url).pathname,
                        headers: {
                            ...request.headers,
                            Authorization: `token ${token}`,
                        }
                    }
                    const file = fs.createWriteStream(saveTo);
                    https.get(options, (response) => {
                        response.on('error', function(err) {
                            core.info(`error downloading: ${err}`);
                            resolve()
                        })
                        response.pipe(file);
                        file.on("finish", () => {
                            file.close();
                            core.info("Download Completed");
                            resolve()
                        });
                        file.on("error", () => {
                            core.info(`error saving file: ${err}`);
                            resolve()
                        })
                    });
                })
            }

            await sendGetRequest();

            if (skipUnpack) {
                continue
            }

            const dir = name ? path : pathname.join(path, artifact.name)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            core.startGroup(`==> Extracting: ${artifact.name}.zip`)
            yauzl.open(saveTo, {lazyEntries: true}, function(err, zipfile) {
                if (err) throw err;
                zipfile.readEntry();
                zipfile.on("entry", function(entry) {
                    const filepath = pathname.resolve(pathname.join(dir, entry.fileName))

                    // Make sure the zip is properly crafted.
                    const relative = pathname.relative(dir, filepath);
                    const isInPath = relative && !relative.startsWith('..') && !pathname.isAbsolute(relative);
                    if (!isInPath) {
                        core.info(`    ==> Path ${filepath} resolves outside of ${dir} skipping`)
                        zipfile.readEntry();
                    }

                    // The zip may contain the directory names for newly created files.
                    if (/\/$/.test(entry.fileName)) {
                        // Directory file names end with '/'.
                        // Note that entries for directories themselves are optional.
                        // An entry's fileName implicitly requires its parent directories to exist.
                        if (!fs.existsSync(filepath)) {
                            core.info(`    ==> Creating: ${filepath}`)
                            fs.mkdirSync(filepath, { recursive: true })
                        }
                        zipfile.readEntry();
                    } else {
                        // This is a file entry. Attempt to extract it.
                        core.info(`    ==> Extracting: ${entry.fileName}`)

                        // Ensure the parent folder exists
                        let dirName = pathname.dirname(filepath)
                        if (!fs.existsSync(dirName)) {
                            core.info(`    ==> Creating: ${dirName}`)
                            fs.mkdirSync(dirName, { recursive: true })
                        }
                        zipfile.openReadStream(entry, (err, readStream) => {
                            if (err) throw err;

                            readStream.on("end", () => {
                                zipfile.readEntry();
                            });
                            readStream.on("error", (err) => {
                                throw new Error(`Failed to extract ${entry.fileName}: ${err}`)
                            });

                            const file = fs.createWriteStream(filepath);
                            readStream.pipe(file);
                            file.on("finish", () => {
                                file.close();
                            });
                            file.on("error", (err) => {
                                throw new Error(`Failed to extract ${entry.fileName}: ${err}`)
                            });
                        });
                    }
                });
            });
            core.endGroup()
        }
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
