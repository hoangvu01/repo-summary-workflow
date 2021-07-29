const core = require('@actions/core');
const { Octokit } = require("@octokit/rest");
const fs = require('fs');
const { createLanguageBar } = require('./formatters/languages');

const octokit = new Octokit({
    userAgent: 'repo-summary-workflow v1.0',
    timeZone: 'Europe/London',
    baseUrl: 'https://api.github.com',
});


function buildFile(oldContent, newContent) {
    const insertTag = "<!--REPO-SUMMARY-->";
    const tagIndex = oldContent.indexOf(insertTag);

    if (tagIndex === -1) {
        throw `Unable to find tag marking insertion point. Required ${insertTag}`;
    }

    return [
        oldContent.slice(0, tagIndex),
        '\n',
        newContent,
        '\n',
        oldContent.slice(tagIndex + insertTag.length)
    ].join("");
}


function writeFile(path, newContent) {
    const oldContent = fs.readFileSync(path, 'utf-8');

    if (oldContent !== newContent) {
        core.info('Writing to ' + path);
        fs.writeFileSync(path, newContent);
    }
}

module.exports = {
    buildFile,
    writeFile,
}