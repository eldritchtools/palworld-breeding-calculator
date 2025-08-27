import data from '../data/data.json';

const getPairId = (parent1, parent2) => {
    return parent1.index < parent2.index ? (parent1.index << 10) + parent2.index : (parent2.index << 10) + parent1.index
}

const getPalsFromPairId = (pairId) => {
    return [indexToPal[pairId >> 10], indexToPal[pairId & ((1 << 10) - 1)]];
}

const indexToPal = Object.values(data.pals).reduce((acc, pal) => {
    acc[pal.index] = pal;
    return acc;
}, {})

// Just a way to combine the id and the passive mask for referencing in a dict
const getPalMaskId = (pal, mask, passives) => {
    return (pal.index << passives.length) + mask;
}

const deconstructPalMaskId = (palMaskId, passives) => {
    return [indexToPal[palMaskId >> passives.length], palMaskId & ((1 << passives.length) - 1)];
}

export {getPairId, getPalsFromPairId, getPalMaskId, deconstructPalMaskId};