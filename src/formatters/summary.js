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
const formatSummary = (repoData, svgPath) => {
    const stats = '####  '
        + `${octicon("eye", 20)} ${repoData.watchers_count} `
        + `${octicon("git-fork", 20)} ${repoData.forks_count} `
        + `${octicon("star", 20)} ${repoData.stargazers_count} `;

    return [
        `### ${octicon("repo", 23)} [${repoData.full_name}](${repoData.html_url})`,
        `> ${octicon("book", 18)} About`,
        `>`,
        `> ${repoData.description}`,
        '\n',
        stats,
        `![Language Breakdown](${svgPath})`,
        ...Object.entries(repoData.languages).map(
            ([lang, attrs]) =>
                languageTextTemplate
                    .replace(/\$node\b/g, createLanguageNode(attrs.colour))
                    .replace(/\$lang\b/g, lang)
                    .replace(/\$ratio\b/g, Math.round(attrs.ratio * 10000) / 100)
                    .replace(/\$size\b/g, attrs.size)
        ),
    ].join("\n");
}

module.exports = {
    formatSummary,
}