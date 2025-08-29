import data from '../data/data.json';

function includesIgnoreCase(s1, s2) {
    return s1.toLowerCase().includes(s2.toLowerCase());
}

function checkIdSearchMatch(searchString, id) {
    return includesIgnoreCase(data.pals[id].no, searchString) || includesIgnoreCase(data.pals[id].name, searchString);
}

function checkPalSearchMatch(searchString, pal) {
    return includesIgnoreCase(pal.no, searchString) || includesIgnoreCase(pal.name, searchString);
}

export { checkIdSearchMatch, checkPalSearchMatch };