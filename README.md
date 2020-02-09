# Download workflow artifact Github Action

An action that downloads and extracts uploaded artifact associated with given workflow and commit.

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
