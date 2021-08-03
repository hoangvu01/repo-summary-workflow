const core = require('@actions/core');
const github = require('@actions/github');

const process = require('process');
const path = require('path');
const fs = require('fs');

const { aggregateLanguages, createLanguageBar, calculateAttributes } = require('./formatters/languages');
const { formatSummary } = require('./formatters/summary');
const { getRepositoryInfo } = require('./fetcher');
const { buildFile, writeFile, commitFile } = require('./utils');

// 
const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

// Path to required files (relative to the root)
const README_PATH = core.getInput('readme_path');
const IMAGE_FOLDER = core.getInput('image_folder');

// Config for the language bar
const LANG_BAR_WIDTH = parseInt(core.getInput('language_bar_width'), 10);
const LANG_BAR_HEIGHT = parseInt(core.getInput('language_bar_height'), 10);

// Read and parse list of repos from workflow inputs
const REPO_LIST_OBJ = core.getInput('repo_list')
const REPO_LIST = REPO_LIST_OBJ.split(";").map(item => item.trim());

if (REPO_LIST.length == 0) {
    core.error("The list of repositories should contain at least 1 item");
    process.exit(1);
}

// Parse max. number of languages to display
const MAX_LANG_COUNT = parseInt(core.getInput('max_language_count'), 10)


// Init list of fetch jobs required
const promiseArray = [];
const runnerNameArray = [];
let reposArray = [];

// Push items to promise array
REPO_LIST.forEach((repoId) => {

    // [repoId] has format {owner}/{repo}
    let words = repoId.trim().split("/");
    let owner = words[0];
    let repo = words[1];

    try {
        const repoData = getRepositoryInfo(owner, repo);

        // Keep a record of the runner
        runnerNameArray.push(repoId);
        promiseArray.push(repoData);

    } catch (err) {
        core.error(err);
    }

});


Promise.allSettled(promiseArray).then((results) => {
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            core.info(`${runnerNameArray[index]} runner succeeded.`);
            reposArray.push(result.value);
        } else {
            core.error(`${runnerNameArray[index]} runner failed. Error:`);
            core.error(result.reason);
        }
    });
}).finally(async () => {

    reposArray.forEach((repoData) => {
        // Enrich [repoData.languages] to contain size, ratio and colour
        const aggregated = aggregateLanguages(repoData.languages, maxCount = MAX_LANG_COUNT);
        repoData['languages'] = calculateAttributes(aggregated);

        // Generate the horizontal bar and writes to file
        const svgFolder = path.join(IMAGE_FOLDER, repoData.full_name);

        // Create the folder
        if (!fs.existsSync(svgFolder)) {
            fs.mkdirSync(svgFolder, { recursive: true });
        }

        // Write svg file into folder
        createLanguageBar(
            repoData.languages,
            path.join(svgFolder, "languages.svg"),
            width = LANG_BAR_WIDTH,
            height = LANG_BAR_HEIGHT,
        );
    })

    const summary = reposArray.reduce((acc, cur, index) => {
        const svgPath = path.join(IMAGE_FOLDER, repoData.full_name, "languages.svg");
        const formattedSummary = formatSummary(cur, svgPath);
        return acc + '\n' + formattedSummary;
    }, '');

    const readme = fs.readFileSync(README_PATH);
    const newReadme = buildFile(readme, summary);
    const fileChanged = writeFile(README_PATH, newReadme);

    const commitEmail = core.getInput("commit_email");
    const commitUsername = core.getInput("commit_username");
    const commitMessage = core.getInput("commit_message");

    if (fileChanged) {
        commitFile(README_PATH, GITHUB_TOKEN, commitUsername, commitEmail, commitMessage);
    }

    console.log('Workflow output:\n' + summary);
});
