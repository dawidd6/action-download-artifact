# Download workflow artifact Github Action

An action that downloads and extracts uploaded artifact associated with given workflow and commit.

Let's suppose you have a workflow with a job in it that at the end uploads an artifact using `actions/upload-artifact` action and you want to download this artifact in another workflow that is run after the first one. Official `actions/download-artifact` does not allow this. That's why I decided to create this action. By knowing only the workflow name and commit SHA, you can download the previously uploaded artifact from different workflow associated with that commit and use it.

## Usage

> If `commit` or `pr` is not specified then the artifact from the most recent completed workflow run will be downloaded.

```yaml
- name: Download artifact
  uses: dawidd6/action-download-artifact@v2
  with:
    github_token: ${{secrets.GITHUB_TOKEN}}
    workflow: workflow_name.yml
    # Optional, will get head commit SHA
    pr: ${{github.event.pull_request.number}}
    # Optional, no need to specify if PR is
    commit: ${{github.event.pull_request.head.sha}}
    name: artifact_name
    path: extract_here
    # Optional, defaults to current repo
    repo: ${{github.repository}}
```
