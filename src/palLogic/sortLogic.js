import data from '../data/data.json';

function sortPalIds(list) {
    return list.sort((a, b) => data.pals[a].index - data.pals[b].index);
}

function sortParentPairs(list) {
    return list.sort((a, b) => a[0].index === b[0].index ? a[1].index - b[1].index : a[0].index - b[0].index);
}

export { sortPalIds, sortParentPairs };