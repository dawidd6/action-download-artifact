# Download workflow artifact Github Action

An action that downloads and extracts uploaded artifact associated with given workflow and commit.

Let's suppose you have a workflow with a job in it that at the end uploads an artifact using `actions/upload-artifact` action and you want to download this artifact in another workflow that is run after the first one. Official `actions/download-artifact` does not allow this. That's why I decided to create this action. By knowing only the workflow name and commit SHA, you can download the previously uploaded artifact from different workflow associated with that commit and use it.

## Usage

```yaml
- name: Download artifact
  uses: dawidd6/action-download-artifact@master
  with:
    github_token: ${{secrets.GITHUB_TOKEN}}
    workflow: workflow_name.yml
    commit: ${{github.event.pull_request.head.sha}}
    name: artifact_name
    path: extract_here
```
