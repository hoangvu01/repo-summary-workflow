const path = require('path');
const { createLanguageNode } = require('./languages');

const octicon = (item, size, alt) => {
    const altText = alt ? alt : item;
    const url = `https://icongr.am/octicons/${item}.svg?size=${size}`;

    return `![${altText}](${url})`;
};

const languageTextTemplate = '1. $node `$lang` - **$ratio%** ($size bytes)';

/*
 * Generate the summary for the repository given by [repoData].
 * This function might also generate some artifacts (i.e. SVG files)
 * and save those to [imgFolder] folder.
 * 
 * @param {Object} repoData - the information about the repository as
 *                            returned by the GitHub API endpoint
 *                            GET /repos/{owner}/repo
 * 
 * @param {string} imgFolder - name of the folder to save images to
 * 
 * @returns {string}
 */
const formatSummary = (repoData, imgFolder) => {
    const stats = '####  '
        + `${octicon("eye", 20)} ${repoData.watchers_count} `
        + `${octicon("git-fork", 20)} ${repoData.forks_count} `
        + `${octicon("star", 20)} ${repoData.stargazers_count} `;

    const pathToLanguageBar = path.join(imgFolder, repoData.fullname, "languages.svg");
    return [
        `### ${octicon("repo", 23)} [${repoData.fullname}](${repoData.html_url})`,
        `> ${octicon("book", 18)} About`,
        `>`,
        `> ${repoData.description}`,
        '\n',
        stats,
        `![Language Breakdown](${pathToLanguageBar})`,
        ...Object.entries(repoData.languages).map(
            ([lang, attrs]) =>
                languageTextTemplate
                    .replace(/\$node\b/g, createLanguageNode(attrs.colour))
                    .replace(/\$lang\b/g, lang)
                    .replace(/\$ratio\b/g, Math.round(attrs.ratio * 100))
                    .replace(/\$size\b/g, attrs.size)
        ),
    ].join("\n");
}

module.exports = {
    formatSummary,
}