const core = require('@actions/core');
const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const { createLanguageBar } = require('./card/languages');

const octokit = new Octokit({
    userAgent: 'repo-summary-workflow v1.0',
    timeZone: 'Europe/London',
    baseUrl: 'https://api.github.com',
});


function buildReadmeStats(oldContent, newContent) {
    const insertTag = "<!--REPO-SUMMARY-->";
    const tagIndex = oldContent.indexOf(insertTag);

    if (tagIndex === -1) {
        core.error(`Unable to find the tag specifying start of insertion section: ${insertTag}`);
        process.exit(1);
    }

    return [
        oldContent.slice(0, tagIndex),
        '\n',
        newContent,
        '\n',
        oldContent.slice(tagIndex + insertTag.length)
    ].join("");
}


function writeReadme(path, langs) {
    const readmeData = fs.readFileSync(path, 'utf-8');

    const languageBar = createLanguageBar(langs);
    const newReadmeData = buildReadmeStats(readmeData, languageBar);


    if (readmeData !== newReadmeData) {
        core.info('Writing to ' + path);
        fs.writeFileSync(path, newReadmeData);
        process.exit(0);
    }
}

module.exports = {
    writeReadme,
}