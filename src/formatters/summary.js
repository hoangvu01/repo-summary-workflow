const core = require('@actions/core');
const { createLanguageNode } = require('./languages');

const octicon = (item, size, alt, colour = 'b3b3b3') => {
    const altText = alt ? alt : item;

    const userColour = core.getInput('icon_colour');
    if (userColour) colour = userColour;

    const url = `https://icongr.am/octicons/${item}.svg?size=${size}?color=${colour}`;

    return `![${altText}](${url})`;
};

const languageTextTemplate = '1. $node `$lang` - **$ratio%** ($size bytes)';

/**
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
        + `${octicon("eye", 16)} watchers ${repoData.watchers_count} `
        + `${octicon("git-fork", 16)} forks ${repoData.forks_count} `
        + `${octicon("star", 16)} stars ${repoData.stargazers_count} `;

    return [
        `### ${octicon("repo", 20)} [${repoData.full_name}](${repoData.html_url})`,
        `> ${octicon("book", 14)} About`,
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