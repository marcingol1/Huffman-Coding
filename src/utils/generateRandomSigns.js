function generateRandomLetters(length) {
    if (length === void 0) { length = 0; }
    var randomSigns = Math
        .random()
        .toString(36)
        .slice(2, length + 2)
        .split('');
    return randomSigns;
}
function mapLettersToSigns(signs) {
    if (signs === void 0) { signs = []; }
    var mappedSigns = {};
    signs.forEach(function (sign) {
        if (mappedSigns[sign]) {
            mappedSigns[sign].count = mappedSigns[sign].count + 1;
        }
        else {
            mappedSigns[sign] = { count: 1 };
        }
    });
    return mappedSigns;
}
function generateRandomSigns(length) {
    if (length === void 0) { length = 0; }
    var signs = generateRandomLetters(length);
    var finalSigns = mapLettersToSigns(signs);
    return finalSigns;
}
exports["default"] = generateRandomSigns;
