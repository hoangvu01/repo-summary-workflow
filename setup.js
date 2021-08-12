const { spawn } = require('child_process');
const fs = require("fs");

const curl = spawn("curl", ["-O", "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml"]);

if (curl.stdout) {
    // Only needed for pipes
    curl.stdout.on('data', function (data) {
        console.log(data);
    });
}

if (curl.stderr) {
    // Only needed for pipes
    curl.stderr.on('data', function (data) {
        console.error(data);
    });
}

app.on('close', (code) => {
    if (code !== 0) {
        console.error("Exit with status: " + code)
        return reject({ code, outputData });
    }

    if (fs.existsSync("languages.yml")) {
        console.log("File languages.yml has been downloaded!")
    }
    return resolve({ code, outputData });
});

app.on('error', (code) => reject({ code, outputData, errorData }));