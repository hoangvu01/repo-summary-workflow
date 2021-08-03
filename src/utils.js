const core = require('@actions/core');
const { exec } = require('child_process');
const fs = require('fs');

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
 * 
 * Returns [true] iff the file is changed
 * 
 * @returns {bool}
 */
function writeFile(path, newContent) {
    const oldContent = fs.readFileSync(path, 'utf-8');

    if (oldContent !== newContent) {
        core.info('Writing to ' + path);
        fs.writeFileSync(path, newContent);
        return true;
    }

    return false;
}

function executeCommand(...args) {
    exec(args.join(" "), (error, stdout, stderr) => {
        if (error) {
            core.error(error);
            return;
        }

        if (stdout) {
            core.info(stdout);
        }

        if (stderr) {
            core.error(stderr);
            return;
        }
    });
}

/*
 * Adds and commits file.
 * 
 * @param {string} path - path to file to be committed
 * @param {string} githubToken - authorisation token for repo
 * @param {string} username - commit username
 * @param {string} email - commit email address
 * @param {string} message - commit message  
 */
function commitFile(path, githubToken, username, email, message) {
    executeCommand("git config --global user.email", email);
    executeCommand("git config --global user.name", username);

    if (githubToken) {
        executeCommand(
            "git remote set-url origin",
            `https://${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git`
        );
    }

    executeCommand("git add", path);
    executeCommand("git commit -m", message);
    executeCommand("git push");
    core.info("File committed successfully");
}

module.exports = {
    buildFile,
    writeFile,
    commitFile,
}