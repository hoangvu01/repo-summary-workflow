const fs = require("fs");

const README_PATH = "./test_readme.md";
const README_PREFIX = "# Prefix...";
const README_START_INSERT_TAG = "<!-- REPO-SUMMARY:START -->";
const README_END_INSERT_TAG = "<!-- REPO-SUMMARY:END -->";
const README_SUFFIX = "# Suffix";

const OUT_FOLDER = "images";

module.exports = {
    README_PATH,
    README_PREFIX,
    README_START_INSERT_TAG,
    README_END_INSERT_TAG,
    README_SUFFIX,

    OUT_FOLDER,
}