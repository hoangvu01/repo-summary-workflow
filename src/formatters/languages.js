const fs = require('fs');
const yaml = require('js-yaml');
const core = require('@actions/core');

const { writeFile } = require("../utils");

let ghLanguage;

/**
 * 
 * @param {string} language - Name of the language
 * @returns 
 */
const getLanguageColour = (language) => {
    if (!ghLanguage) {
        ghLanguage = yaml.load(fs.readFileSync("languages.yml"), { json: true });
        core.info("Loaded GitHub languages details successfully");
    }

    if (ghLanguage[language])
        return ghLanguage[language].color;

    if (language.toLowerCase() === "others")
        return "#ededed";

    throw 'Unknown GitHub language: ' + language;
}

/**
 * Aggregate an Object<string, int> so that the result contains the largest [maxCount] - 1 
 * elements unmodified and the last item is the aggregate of the other values.
 *
 * @param   {Object<string, number>} 
 *          languages - a dictionary containing the language name 
 *                      and the number of bytes 
 * @param   {number}
 *          maxCount - the number of entries in the output
 * @returns Object<string, int>
 */
function aggregateLanguages(languages, maxCount = 5) {
    // Create items array
    let items = Object.keys(languages).map((key) => [key, languages[key]]);

    // Sort the array by DESCENDING order
    items.sort((first, second) => second[1] - first[1]);

    if (items.length > maxCount) {
        // Total values for the aggregated languages
        let aggrBytes = items
            .slice(start = maxCount - 1)
            .map(([_, bytes]) => bytes)
            .reduce((a, b) => a + b, 0);

        // Replace the last (n - [maxCount] - 1) elements with the aggregated value
        items.splice(start = maxCount - 1);
        items.push(["Others", aggrBytes]);
    }
    return Object.fromEntries(items);
}

/** 
 * Calculate the percentage of the language throughout the repo and assign a colour. 
 */
function calculateAttributes(languages) {
    // Calculate total number of bytes across all languages
    let totalBytes = 0;
    Object.values(languages).forEach(val => totalBytes += val);

    let res = {};
    Object.entries(languages).forEach(([lang, bytes]) => {
        res[lang] = {
            size: bytes,
            ratio: bytes / totalBytes,
            colour: getLanguageColour(lang),
        };
    });
    return res;
}

/**
 * Create a text node for the legend.
 */
const createLanguageNode = (colour) =>
    '<svg viewbox="0 0 16 16" width="12" height="12">'
    + `<circle cx="8" cy="8" r="8" fill="${colour}"/>`
    + '</svg>';


/**
 * Creates a horizontal bar representing the ratio of languages used.
 * 
 * @param {Object<String, int>} 
 *        languages - [key] is the language, [value] is the size
 *                    of used throughout the repo
 * @param {number}  
 *        width - width of the bar
 * @param {number}
 *        height - height of the bar
 * 
 * @returns string
 */
function createLanguageBar(languages, output_path, width = 250, height = 20) {
    // Generate the span for each languages
    let spans = {};
    let offset = 0;
    Object.entries(languages).forEach(([key, value]) => {
        spans[key] = `<rect x="${offset}" width="${value.ratio * width}" height="${height}" fill="${value.colour}"> </rect>`
        offset += width * value.ratio;
    });

    writeFile(output_path, [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" version="1.1">`,
        `<rect rx="8" x="0" width="100%" height="100%"></rect>`,
        ...Object.values(spans),
        '</svg>',
    ].join("\n"));
}

module.exports = {
    aggregateLanguages,
    calculateAttributes,
    createLanguageBar,
    createLanguageNode,
}