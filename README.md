# Download Workflow Artifact GitHub Action

An action that downloads and extracts uploaded artifacts associated with a given workflow and commit or other criteria.

### Problem

Let's suppose you have a workflow with a job that uploads an artifact using the `actions/upload-artifact` action. If you want to download this artifact in another workflow that runs after the first one, you might run into issues, as the official `actions/download-artifact` action does not support this use case. This action allows you to download artifacts from a different workflow using details like the workflow name, commit SHA, or other criteria.

## Usage

> **Note**: If `commit`, `pr`, `branch`, `run_id`, or `workflow_conclusion` are not specified, the artifact from the most recent successfully completed workflow run will be downloaded.

> **Important**: Do not specify `pr`, `commit`, `branch`, `run_id` together, or `workflow_conclusion` and `run_id` together. Pick just one of each or none.

### Example:

```yaml
- name: Download artifact
  id: download-artifact
  uses: dawidd6/action-download-artifact@v7
  with:
    # Optional: GitHub token. A Personal Access Token with `public_repo` scope if needed
    # Required if the artifact is from a different repo or the repo is private. Use `repo` scope or GitHub token with `read` permissions.
    github_token: ${{ secrets.GITHUB_TOKEN }}
    
    # Optional: Workflow file name or ID. Will be inferred from `run_id` if provided.
    workflow: workflow_name.yml
    
    # Optional: Set to true if you want to search for the most recent workflow matching the criteria.
    workflow_search: false
    
    # Optional: Search for a specific workflow conclusion.
    # Can be: "failure", "success", "neutral", "cancelled", "skipped", "timed_out", "action_required"
    # Or a workflow status: "completed", "in_progress", "queued"
    workflow_conclusion: success
    
    # Optional: Pull request number. Will use head commit SHA if provided.
    pr: ${{ github.event.pull_request.number }}
    
    # Optional: Commit SHA. Used for identifying the artifact.
    commit: ${{ github.event.pull_request.head.sha }}
    
    # Optional: Branch to consider (defaults to all branches).
    branch: master
    
    # Optional: Event type (defaults to "push").
    event: push
    
    # Optional: Workflow run ID. Use `${{ github.event.workflow_run.id }}` in a `workflow_run` event.
    run_id: 1122334455
    
    # Optional: Run number from the workflow.
    run_number: 34
    
    # Optional: Artifact name. Will download all artifacts if not specified.
    # The name is treated as a regular expression if `name_is_regexp` is true.
    name: artifact_name
    
    # Optional: Set to true if the artifact name is a regular expression.
    name_is_regexp: true
    
    # Optional: Directory where to extract artifact(s). Defaults to the current directory.
    path: extract_here
    
    # Optional: Repository to search for the artifact. Defaults to the current repo.
    repo: ${{ github.repository }}
    
    # Optional: Check whether the workflow run has an artifact. Default is false.
    check_artifacts: false
    
    # Optional: Search for the last workflow run that stored an artifact with the specified name.
    search_artifacts: false
    
    # Optional: Choose to skip unpacking the downloaded artifact(s). Default is false.
    skip_unpack: false
    
    # Optional: How to exit the action if no artifact is found. Options: "fail", "warn", "ignore". Default is "fail".
    if_no_artifact_found: fail
    
    # Optional: Include forks when searching for artifacts. Default is false.
    allow_forks: false
```
