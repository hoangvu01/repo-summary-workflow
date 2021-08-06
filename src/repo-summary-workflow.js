const core = require('@actions/core');
const github = require('@actions/github');

const process = require('process');
const path = require('path');
const fs = require('fs');

const { aggregateLanguages, createLanguageBar, calculateAttributes } = require('./formatters/languages');
const { formatSummary } = require('./formatters/summary');
const { getRepositoryInfo } = require('./fetcher');
const { buildFile, writeFile, commitFile } = require('./utils');

// GitHub config
const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

// Path to required files (relative to the root)
const README_PATH = core.getInput('readme_path');
const IMAGE_FOLDER = core.getInput('image_folder');
const OUTPUT_PATH = core.getInput('output_path');

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

// Logging configurations for debugging purposes
core.debug("Received configurations...echoing...");
core.debug(
    JSON.stringify({
        README_PATH,
        IMAGE_FOLDER,
        OUTPUT_PATH,
        LANG_BAR_WIDTH,
        LANG_BAR_HEIGHT,
        REPO_LIST,
    })
);

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
        const svgPath = path.join(IMAGE_FOLDER, cur.full_name, "languages.svg");

        const outFolder = path.dirname(OUTPUT_PATH);
        const svgRelPath = path.relative(outFolder, svgPath);

        const formattedSummary = formatSummary(cur, svgRelPath);
        return acc + '\n' + formattedSummary;
    }, '');

    // Read in current content of the README file
    const readme = fs.readFileSync(README_PATH);
    const newReadme = buildFile(readme, summary);

    // Check if we are overriding the current file
    if (README_PATH === OUTPUT_PATH) {
        core.warning(`readme_path is the same as output_path: ${README_PATH}`);
        core.info(`Overriding current content in ${README_PATH}`);
    }
    const fileChanged = writeFile(OUTPUT_PATH, newReadme);

    const commitEmail = core.getInput("commit_email");
    const commitUsername = core.getInput("commit_username");
    const commitMessage = core.getInput("commit_message");

    if (fileChanged) {
        commitFile(GITHUB_TOKEN, commitUsername, commitEmail, commitMessage, OUTPUT_PATH, IMAGE_FOLDER);
    }
});
