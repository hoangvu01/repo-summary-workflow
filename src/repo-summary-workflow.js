const core = require('@actions/core');
const github = require('@actions/github');

const process = require('process');
const path = require('path');
const { aggregateLanguages, createLanguageBar } = require('./formatters/languages');
const { formatSummary } = require('./formatters/summary');


// Path to required files (relative to the root)
const README_PATH = core.getInput('readme_path');
const IMAGE_FOLDER = core.getInput('image_folder');

// Read and parse list of repos from workflow inputs
const REPO_LIST = core.getMultilineInput('repo_list');
if (REPO_LIST.length == 0) {
    core.error("The list of repositories should contain at least 1 item");
    // process.exit(1);
}

// Parse max. number of languages to display
try {
    const MAX_LANG_COUNT = parseInt(core.getInput('max_language_count'), 10)
} catch (err) {
    core.error(err);
    process.exit(1);
}

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
        if (result.status === '') {
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
        createLanguageBar(repoData.languages, path.join(IMAGE_FOLDER, repoData.fullname, "languages.svg"));
    })

    const summary = reposArray.reduce((acc, cur, index) => {
        const formattedSummary = formatSummary(cur);
        return acc + '\n' + formattedSummary;
    }, '');


});