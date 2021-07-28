/* Generates a random colour.
 * @returns string
 */
function getRandomColour() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/* Aggregate an Object<string, int> so that the result contains the largest [maxCount] - 1 
 * elements unmodified and the last item is the aggregate of the other values.
 *
 * @param   {Object<string, number>} 
 *          languages - a dictionary containing the language name 
 *                      and the number of bytes 
 * @param   {number}
 *          maxCount - the number of entries in the output
 * @returns Object<string, int>
 */
function aggregateLanguages(languages, { maxCount = 5 }) {
    // Create items array
    var items = Object.keys(languages).map((key) => [key, languages[key]]);

    // Sort the array by DESCENDING order
    items.sort((first, second) => second[1] - first[1]);

    if (items.length > maxCount) {
        // Total values for the aggregated languages
        var aggrBytes = 0;
        var itemsToAggr = items.slice(start = maxCount - 1);
        Object.values(itemsToAggr).forEach(val => aggrBytes += val);

        // Replace the last (n - [maxCount] - 1) elements with the aggregated value
        items.splice(start = maxCount - 1);
        items.push(["others", aggrBytes]);
    }
    return Object.fromEntries(items);
}

/* 
 * Calculate the percentage of the language throughout the repo and assign a colour. 
 */
function calculateAttributes(languages) {
    // Calculate total number of bytes across all languages
    var totalBytes = 0;
    Object.values(languages).forEach(val => totalBytes += val);

    var res = {};
    Object.entries(languages).forEach(([lang, bytes]) => {
        res[lang] = {
            size: bytes,
            ratio: bytes / totalBytes,
            colour: getRandomColour(),
        };
    });
    return res;
}

/*
 * Create a text node for the legend.
 */
const createLanguageNode = (language, attributes) => [
    '<li>',
    '<svg viewbox="0 0 16 16" width="12" height="12">',
    `<circle cx="8" cy="8" r="8" fill="${attributes.colour}"/>`,
    '</svg>',
    ` ${language} - ${Math.round(attributes.ratio * 100)}% (${attributes.size} bytes)`,
    '</li>',
].join("");
/*
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
function createLanguageBar(languages, width = 250, height = 20) {

    const aggregated = aggregateLanguages(languages, maxCount = 5);
    const enriched = calculateAttributes(aggregated);

    // Generate the span for each languages
    var spans = {};
    var offset = 0;
    Object.entries(enriched).forEach(([key, value]) => {
        spans[key] = `<rect x="${offset}" width="${value.ratio * width}" height="${height}" fill="${value.colour}"> </rect>`
        offset += width * value.ratio;
    });



    return [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" version="1.1">`,
        `<rect rx="8" x="0" width="100%" height="100%"></rect>`,
        ...Object.values(spans),
        '</svg><br/>',
        '<ol>',
        ...Object.entries(enriched).map(([lang, value]) => createLanguageNode(lang, value)),
        '</ol>',
    ].join("\n");
}

module.exports = {
    createLanguageBar,
}