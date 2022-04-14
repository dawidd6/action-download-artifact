# Download workflow artifact GitHub Action

This action is almost entirely the same as its [fork parent](https://github.com/dawidd6/action-download-artifact), with a few minor changes:
- Filtering by branch name is done client side, rather than using GitHub's unstable API to filter. See [this GitHub community issue](https://github.community/t/filtering-workflow-runs-does-not-include-runs-created-in-the-last-6-hours/244282) for more information on why this was done.
- Filtering by event is not supported.
- Additional console logging is added to clarify why particular runs were skipped based on the filtering criteria.