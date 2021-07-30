const core = require('@actions/core');
const { Octokit } = require("@octokit/rest");
const fs = require('fs');

const octokit = new Octokit({
    userAgent: 'repo-summary-workflow v1.0',
    timeZone: 'Europe/London',
    baseUrl: 'https://api.github.com',
});


/* 
 * Looks for the [insertTag] inside [oldContent] and replaces it with 
 * [newContent]. The tag is removed from the returned value. 
 * 
 * @param {string} oldContent - A string containing an insertion tag.
 * @param {string} newContent - The string to replace the insertion tag.
 * 
 * @returns {string}
 */
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

/* 
 * Write [newContent] to a file by its [path]. This function creates the
 * file if it does not already exist and override it otherwise.
 * 
 * The file is unchanged if the [newContent] is the identical to the
 * current content of the file.
 */
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