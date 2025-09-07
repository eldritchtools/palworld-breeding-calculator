function sortParentPairs(list) {
    return list.sort((a, b) => a[0].sortIndex === b[0].sortIndex ? a[1].sortIndex - b[1].sortIndex : a[0].sortIndex - b[0].sortIndex);
}

export { sortParentPairs };