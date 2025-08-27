import data from '../data/data.json';

function includesIgnoreCase(s1, s2) {
    return s1.toLowerCase().includes(s2.toLowerCase());
}

function checkIdSearchMatch(searchString, id) {
    return includesIgnoreCase(id, searchString) || includesIgnoreCase(data.pals[id].name, searchString);
}

function checkPalSearchMatch(searchString, pal) {
    return includesIgnoreCase(pal.id, searchString) || includesIgnoreCase(pal.name, searchString);
}

export { checkIdSearchMatch, checkPalSearchMatch };