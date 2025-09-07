import { pals } from "@eldritchtools/palworld-shared-library";

const getPairId = (parent1, parent2) => {
    return parent1.sortIndex < parent2.sortIndex ? (parent1.sortIndex << 10) + parent2.sortIndex : (parent2.sortIndex << 10) + parent1.sortIndex
}

const getPalsFromPairId = (pairId) => {
    return [indexToPal[pairId >> 10], indexToPal[pairId & ((1 << 10) - 1)]];
}

const indexToPal = Object.values(pals).reduce((acc, pal) => {
    acc[pal.sortIndex] = pal;
    return acc;
}, {})

// Just a way to combine the id and the passive mask for referencing in a dict
const getPalMaskId = (pal, mask, passives) => {
    return (pal.sortIndex << passives.length) + mask;
}

const deconstructPalMaskId = (palMaskId, passives) => {
    return [indexToPal[palMaskId >> passives.length], palMaskId & ((1 << passives.length) - 1)];
}

export {getPairId, getPalsFromPairId, getPalMaskId, deconstructPalMaskId};