const fs = require('fs');
const { writeReadme } = require('../src/utils');

const README_PATH = "./test_readme.md";
const README_PREFIX = "# Testing...";

const languages = {
    "python": 120,
    "js": 60,
    "others": 30,
};

function initDummyReadme() {
    fs.writeFileSync(README_PATH, [
        README_PREFIX,
        "<!--REPO-SUMMARY-->",
    ].join(""));
}

test('Chart is inserted correctly at insert tag', () => {
    initDummyReadme();
    writeReadme(README_PATH, languages);

    const data = fs.readFileSync(README_PATH, 'utf-8');

    expect(data).toEqual(expect.stringContaining("120 bytes"));
});

