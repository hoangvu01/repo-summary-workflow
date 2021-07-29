const fs = require("fs");

const README_PATH = "./test_readme.md";
const README_PREFIX = "# Prefix...";
const README_INSERT_TAG = "<!--REPO-SUMMARY-->";
const README_SUFFIX = "# Suffix";

const OUT_FOLDER = "images";

function initDummyReadme() {
    fs.writeFileSync(README_PATH, [
        README_PREFIX,
        README_INSERT_TAG,
    ].join(""));
}

module.exports = {
    README_PATH,
    README_PREFIX,
    README_INSERT_TAG,
    README_SUFFIX,

    OUT_FOLDER,

    initDummyReadme,
}