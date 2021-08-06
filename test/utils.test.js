const fs = require('fs');
const path = require('path');
const { buildFile } = require('../src/utils');
const { createLanguageBar, calculateAttributes } = require('../src/formatters/languages');

const {
    README_PATH,
    README_PREFIX,
    README_INSERT_TAG,
    README_SUFFIX,
    OUT_FOLDER,

    initDummyReadme,
} = require("./common");

const languages = {
    "python": 120,
    "js": 60,
    "others": 30,
};

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

test('SVG can be generated', () => {
    if (!fs.existsSync(OUT_FOLDER)) {
        fs.mkdirSync(OUT_FOLDER, { recursive: true });
    }

    const pathToSvg = path.join(OUT_FOLDER, "languages.svg");
    const enriched = calculateAttributes(languages);
    createLanguageBar(enriched, pathToSvg);

    if (!fs.existsSync(pathToSvg)) {
        throw `SVG file has not yet been written: ${pathToSvg}`;
    }

    const svgData = fs.readFileSync(pathToSvg);
    expect(svgData).not.toBeNull();

    fs.rmSync(pathToSvg);
});

