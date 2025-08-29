import data from '../data/data.json';

function sortPalIds(list) {
    return list.sort((a, b) => data.pals[a].sortIndex - data.pals[b].sortIndex);
}

function sortParentPairs(list) {
    return list.sort((a, b) => a[0].sortIndex === b[0].sortIndex ? a[1].sortIndex - b[1].sortIndex : a[0].sortIndex - b[0].sortIndex);
}

function sortFromIds(a, b) {
    return data.pals[a].sortIndex - data.pals[b].sortIndex;
}

export { sortPalIds, sortParentPairs, sortFromIds };