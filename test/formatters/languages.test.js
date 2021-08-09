const { aggregateLanguages } = require("../../src/formatters/languages");


test('Aggregator returns identical copy if fewer record than maxCount', () => {
    const testInput = { "C": 300 };
    const testOutput = aggregateLanguages(testInput, 5);

    expect(testOutput).toEqual(testInput);
    expect(testOutput).not.toBe(testInput);
})

test('Aggregator does not modify original item', () => {
    const testInput = { "C": 300 };
    aggregateLanguages(testInput, 5);

    expect(testInput).toEqual({ "C": 300 });
})

test('Aggregator returns new object if more record than maxCount', () => {
    const testInput = { "C": 300, "C++": 400, "Python": 500 };
    const testOutput = aggregateLanguages(testInput, 2);

    expect(testOutput).toEqual({ "Python": 500, "Others": 700 });
})