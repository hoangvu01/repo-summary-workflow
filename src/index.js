const core = require('@actions/core');
const github = require('@actions/github');

const process = require('process');


// Path to the README file (relative to the root)
const README_PATH = core.getInput('readme_path');

// Read and parse list of repos from workflow inputs
const REPO_LIST = core.getMultilineInput('repo_list');
if (REPO_LIST.length == 0) {
    core.error("The list of repositories should contain at least 1 item");
    process.exit(1);
}

// Init list of fetch jobs required
const promiseArray = [];
const runnerNameArray = [];
let reposArray = [];

// Push items to promise array
REPO_LIST.forEach((repoUrl) => {
    runnerNameArray.push(repoUrl);
});
