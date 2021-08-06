const fs = require('fs');
const path = require('path');

const {
    aggregateLanguages,
    calculateAttributes,
    createLanguageBar,
    createLanguageNode,
} = require('../src/formatters/languages');

const { formatSummary } = require("../src/formatters/summary");
const { writeFile, buildFile } = require("../src/utils");

const {
    README_PATH,
    README_PREFIX,
    README_INSERT_TAG,
    OUT_FOLDER,

    initDummyReadme,
} = require("./common");

const data = {
    html_url: "https://github.com/hoangvu01/Tetris-Plus-Plus",
    full_name: "hoangvu01/Tetris-Plus-Plus",
    description: "Sample description",


    forks_count: 10,
    watchers_count: 10,
    stargazers_count: 12,

    languages: {
        "C++": 50,
        "Python": 100,
        "JS": 25,
    }
}

test('Summarise, formats and writes repository details to README', () => {
    initDummyReadme();

    const outFolder = path.join(OUT_FOLDER, data.full_name);
    if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true });
    }
    const pathToSvg = path.join(outFolder, "languages.svg");
    const oldContent = [
        README_PREFIX,
        README_INSERT_TAG,
    ].join("");


    // Fill in attributes
    const aggregated = aggregateLanguages(data.languages);
    data.languages = calculateAttributes(aggregated);

    // Generate the horizontal bar and writes to file
    createLanguageBar(data.languages, pathToSvg);

    const summary = formatSummary(data, pathToSvg);
    const newFileContent = buildFile(oldContent, summary);

    writeFile(README_PATH, newFileContent);
});
