const core = require('@actions/core');
const { spawn } = require('child_process');
const fs = require('fs');

/**
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

/**
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

    if (fs.existsSync(path)) {
        const oldContent = fs.readFileSync(path, 'utf-8');
        if (oldContent === newContent) {
            core.info('File content unchanged...finishing jobs.');
            return false;
        }
    }

    core.info('Writing to ' + path);
    fs.writeFileSync(path, newContent);
    return true;

}

/**
 * Thanks to https://github.com/gautamkrishnar/blog-post-workflow/.
 * 
 * Executes a command and returns its result as promise
 * @param {string} cmd command to execute
 * @param {array} args command line args
 * @param {Object} options extra options
 * @returns {Promise<Object>}
 */
const execute = (cmd, args = []) => new Promise((resolve, reject) => {
    let outputData = '';

    core.debug(`Executing: ${cmd} ${args.join(" ")}`);

    const app = spawn(cmd, args);
    if (app.stdout) {
        // Only needed for pipes
        app.stdout.on('data', function (data) {
            outputData += data.toString();
        });
    }

    app.on('close', (code) => {
        if (code !== 0) {
            return reject({ code, outputData });
        }
        return resolve({ code, outputData });
    });
    app.on('error', () => reject({ code: 1, outputData }));
});

/**
 * Adds and commits file.
 * 
 * @param {string} path - path to file to be committed
 * @param {string} githubToken - authorisation token for repo
 * @param {string} username - commit username
 * @param {string} email - commit email address
 * @param {string} message - commit message  
 */
async function commitFile(githubToken, username, email, message, ...paths) {
    await execute("git", ["config", "--global", "user.email", email]);
    await execute("git", ["config", "--global", "user.name", username]);

    if (githubToken) {
        await execute(
            "git", [
            "remote", "set-url", "origin",
            `https://${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git`
        ]);
    }

    await execute("git", ["add", ...paths]);
    await execute("git", ["commit", "-m", '"', message, '"']);
    await execute("git", ["push"]);
    core.info("Files" + paths.join(" ") + "committed successfully");
}

module.exports = {
    buildFile,
    writeFile,
    commitFile,
}