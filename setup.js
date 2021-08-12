const { spawn } = require('child_process');
const core = require('@actions/core');
const fs = require("fs");

const curl = spawn("curl", ["-O", "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml"]);

if (curl.stdout) {
    // Only needed for pipes
    curl.stdout.on('data', function (data) {
        core.info(data);
    });
}

if (curl.stderr) {
    // Only needed for pipes
    curl.stderr.on('data', function (data) {
        core.error(data);
    });
}

app.on('close', (code) => {
    if (code !== 0) {
        core.error("Exit with status: " + code)
        return reject({ code, outputData });
    }

    if (fs.existsSync("languages.yml")) {
        core.info("File languages.yml has been downloaded!")
    }
    return resolve({ code, outputData });
});

app.on('error', (code) => reject({ code, outputData, errorData }));