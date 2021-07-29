const fs = require('fs');
const { buildFile, writeFile } = require('../src/utils');

const README_PATH = "./test_readme.md";
const README_PREFIX = "# Prefix...";
const README_INSERT_TAG = "<!--REPO-SUMMARY-->";
const README_SUFFIX = "# Suffix";

const languages = {
    "python": 120,
    "js": 60,
    "others": 30,
};

function initDummyReadme() {
    fs.writeFileSync(README_PATH, [
        README_PREFIX,
        README_INSERT_TAG,
    ].join(""));
}

test('Insertion tag is removed in `buildFile`', () => {
    const oldContent = [
        README_PREFIX,
        README_INSERT_TAG,
    ].join("");

    const newContent = "Hello";
    const data = buildFile(oldContent, newContent);

    expect(data).not.toEqual(expect.stringContaining(README_INSERT_TAG));
});

test('New content is added into string by `buildFile`', () => {
    const oldContent = [
        README_PREFIX,
        README_INSERT_TAG,
    ].join("");

    const newContent = "Hello";
    const data = buildFile(oldContent, newContent);

    expect(data).toEqual(expect.stringContaining(newContent));
});

test('Old content is unaffected by `buildFile`', () => {
    const oldContent = [
        README_PREFIX,
        README_INSERT_TAG,
        README_SUFFIX,
    ].join("\n");

    const newContent = "Hello";
    const data = buildFile(oldContent, newContent);

    expect(data).toEqual(expect.stringContaining(README_PREFIX));
    expect(data).toEqual(expect.stringContaining(README_SUFFIX));

});

test('Chart is inserted correctly at insert tag', () => {
    initDummyReadme();
    writeFile(README_PATH, languages);

    const data = fs.readFileSync(README_PATH, 'utf-8');

    expect(data).toEqual(expect.stringContaining("120 bytes"));
});

