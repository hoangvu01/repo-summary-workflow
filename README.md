# Repo Summary Workflow

### Usage
- Go to your repository
- Add the following tags to the `Markdown` file you want to write to, the workflow will replace the contents between these tags with information from your selected repositories (see later): 
```
<!-- REPO-SUMMARY:START -->
<!-- REPO-SUMMARY:END -->
```

- Create a [`GitHub Workflow`](https://docs.github.com/en/actions/quickstart) to update your file hourly
- Create the following folders and file from the root of your repository 

```
.github/workflows/repo-summary-workflow.yml
```
- Add the following contents to the file:

```
on:
  schedule: 
    - cron: '0 0 * * *' # Runs 1 a day at midnight
  workflow_dispatch: # Allows manually triggering the workflow
jobs:
  update-file:
    name: Update a file with updated repositories data
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: hoangvu01/repo-summary-workflow@master
        with:
          repo_list: hoangvu01/not_here; hoangvu01/Tetris-Plus-Plus


```
- Replace `repo_list` with the list of repositories you want to add to your 
markdown file. Note that they are *required* to be **public** repositories.

## Options

Below is the list of optional parameters to customise your workflow with:

Parameter | Required | Default Value | Description
--|--|--|---
`GITHUB_TOKEN` | Y | N/A | Token to run `git` commands with. You can also use [`${{ secrets.GITHUB_TOKEN }}`](https://docs.github.com/en/actions/reference/authentication-in-a-workflow#using-the-github_token-in-a-workflow)
`repo_list` | Y | N/A | List of repositories to read data from
`commit_email` | N | N/A | If not specified, the current `git config` is used
`commit_username` | N | N/A | (as above)
`commit_message` | Y | N/A | Commit message for the updated markdown file
`readme_path` | N | `./README.md` | Path to the file with the `START` and `END` tags as described above
`output_path` | N | `./README.md` | Path to the output file. This can be the same as `readme_path`
`image_folder` | N | `./images/` | The workflow will create SVG files, this parameter specify where to write these files to
`max_language_count` | N | `5` | The number of languages to be shown in the output file
`language_bar_width` | N | `100` | Width of the language breakdown bar
`language_bar_height`| N | `20` | Height of the language breakdown bar

### Example

- Visit [hoangvu01/hoangvu01](https://github.com/hoangvu01/hoangvu01)
- See [example](example/)
