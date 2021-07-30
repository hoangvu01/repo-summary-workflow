const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    userAgent: 'repo-summary-workflow v1.0',
    timeZone: 'Europe/London',
    baseUrl: 'https://api.github.com',
});

/* 
 * Hit GitHub API endpoint for basic information about the repository.
 * See https://docs.github.com/en/rest/reference/repos#get-a-repository
 */
const fetchRepository = async (owner, repo) => {

    const response = await octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo,
    });

    switch (response.status) {
        case 404: {
            throw `Repository ${owner}/${repo} not found.`;
        }
        case 403: {
            throw `Unsufficient permission to view ${owner}/${repo}`;
        }
        case 301: {
            throw `Repository ${owner}/${repo} has been moved permanently.`;
        }
    }

    return response.data;
}

/* 
 * Retrieve data about the language breakdown of a particular repository.
 * See https://docs.github.com/en/rest/reference/repos#list-repository-languages
 */
const fetchLanguageList = async (owner, repo) => {
    const response = await octokit.request('GET /repos/{owner}/{repo}/languages', {
        owner,
        repo,
    });


    if (response.status != 200) {
        throw 'Failed to fetch repository languages';
    }

    return response.data;
}


const getRepositoryInfo = async (owner, repo) => {
    const basicData = await fetchRepository(owner, repo);
    const languages = await fetchLanguageList(owner, repo);

    basicData['languages'] = languages;

    return basicData;
}

module.exports = {
    fetchRepository,
    fetchLanguageList,
    getRepositoryInfo,
}