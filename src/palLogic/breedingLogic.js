import { getPairId } from "./palLogic";
import { pals } from "@eldritchtools/palworld-shared-library";

const allPalsByBreedPower = Object.values(pals).sort((a, b) => a.breedingPower - b.breedingPower);
const idToAllBreedPowerIndex = allPalsByBreedPower.reduce((acc, pal, index) => {
    acc[pal.id] = index;
    return acc;
}, {});

const breedablePalsByBreedPower = allPalsByBreedPower.filter(pal => !pal.unique);
const idToBreedPowerIndex = breedablePalsByBreedPower.reduce((acc, pal, index) => {
    acc[pal.id] = index;
    return acc;
}, {});

const uniquePairs = Object.values(pals).reduce((acc, pal) => {
    if (pal.parents) {
        pal.parents.forEach(parents => {
            const pairId = getPairId(pals[parents[0]], pals[parents[1]]);
            if (pairId in acc) acc[pairId].push(pal.id);
            else acc[pairId] = [pal.id];
        });
    }
    return acc;
}, {})

function checkUniquePair(parent1, parent2) {
    const pairId = getPairId(parent1, parent2);
    if (pairId in uniquePairs) return uniquePairs[pairId];
    else return null;
}

function computeBabyPower(parent1, parent2) {
    // floor(x/2) is the same as x >> 1
    return (parent1.breedingPower + parent2.breedingPower + 1) >> 1;
}

function comparePowerGap(babyPower, option1, option2) {
    const diff1 = Math.abs(babyPower - option1.breedingPower);
    const diff2 = Math.abs(babyPower - option2.breedingPower);
    return (diff1 < diff2 || (diff1 === diff2 && option1.tiebreakIndex < option2.tiebreakIndex));
}

function sortPairList(list) {
    return list.sort(([a1, a2], [b1, b2]) => {
        if (a1.id === b1.id) return a2.sortIndex - b2.sortIndex;
        return a1.sortIndex - b1.sortIndex;
    })
}

function getChildren(parentId1, parentId2) {
    if (parentId1 === null && parentId2 === null) {
        return {};
    } else if (parentId1 === null || parentId2 === null) {
        const parent = parentId1 ? pals[parentId1] : pals[parentId2];
        const results = {};
        let currentIndex = 0;
        Object.values(allPalsByBreedPower).forEach(otherParent => {
            const uniquePair = checkUniquePair(parent, otherParent);
            if (uniquePair) {
                uniquePair.forEach(id => {
                    if (id in results) results[id].push([parent, otherParent]);
                    else results[id] = [[parent, otherParent]];
                })
                return;
            }

            const babyPower = computeBabyPower(parent, otherParent);
            while (currentIndex < breedablePalsByBreedPower.length - 1 && !comparePowerGap(babyPower, breedablePalsByBreedPower[currentIndex], breedablePalsByBreedPower[currentIndex + 1])) {
                currentIndex++;
            }
            if (breedablePalsByBreedPower[currentIndex].id in results) results[breedablePalsByBreedPower[currentIndex].id].push([parent, otherParent]);
            else results[breedablePalsByBreedPower[currentIndex].id] = [[parent, otherParent]];
        })

        return Object.entries(results).reduce((acc, [id, pairs]) => {
            acc[id] = sortPairList(pairs);
            return acc;
        }, {})
    } else {
        const parent1 = pals[parentId1];
        const parent2 = pals[parentId2];
        if (parent1.sortIndex === parent2.sortIndex) return { [parent1.id]: [[parent1, parent2]] };
        const uniquePair = checkUniquePair(parent1, parent2);
        if (uniquePair) return uniquePair.reduce((acc, id) => { acc[id] = [[parent1, parent2]]; return acc }, {});
        const babyPower = computeBabyPower(parent1, parent2);
        // binary search with left and right ends starting at the index of the parents since the child is always between them
        // use the left and right ends if the parent isn't in the list
        let L, R = null;
        if (parent1.breedingPower < parent2.breedingPower) {
            L = parent1.unique ? 0 : idToBreedPowerIndex[parent1.id];
            R = parent2.unique ? breedablePalsByBreedPower.length - 1 : idToBreedPowerIndex[parent2.id];
        } else {
            L = parent2.unique ? 0 : idToBreedPowerIndex[parent2.id];
            R = parent1.unique ? breedablePalsByBreedPower.length - 1 : idToBreedPowerIndex[parent1.id];
        }

        while (R - L > 2) {
            let M = (R + L) >> 1;
            if (breedablePalsByBreedPower[M].breedingPower < babyPower) L = M;
            else R = M;
        }

        let best = L;
        for (let i = L + 1; i <= R; i++) {
            if (comparePowerGap(babyPower, breedablePalsByBreedPower[i], breedablePalsByBreedPower[best])) best = i;
        }

        return { [breedablePalsByBreedPower[best].id]: [[parent1, parent2]] };
    }
}

function getParentPairs(childId, sorted = true) {
    if (!childId) return [];
    const child = pals[childId];
    if (child.unique) {
        return sortPairList([...child.parents.map(parents => parents.map(p => pals[p]))]);
    } else {
        // the possible partners of every pal to produce the same child is a sliding window
        const pairs = [];
        const bpi = idToBreedPowerIndex[child.id];
        const notFirst = bpi !== 0;
        const notLast = bpi !== Object.keys(idToBreedPowerIndex).length - 1;
        let si = idToAllBreedPowerIndex[child.id]; // starting index of "sliding window"
        for (let p1 = si; p1 >= 0; p1--) {
            for (let p2 = si; p2 < allPalsByBreedPower.length; p2++) {
                const babyPower = computeBabyPower(allPalsByBreedPower[p1], allPalsByBreedPower[p2]);
                const selfDiff = Math.abs(babyPower - child.breedingPower);

                if (notFirst) {
                    // move the starting index of the window forward if the pal in the current start is no longer part of it
                    const otherDiff = Math.abs(babyPower - breedablePalsByBreedPower[bpi - 1].breedingPower);
                    if (otherDiff < selfDiff || (otherDiff === selfDiff && breedablePalsByBreedPower[bpi - 1].tiebreakIndex < child.tiebreakIndex)) {
                        si++;
                        continue;
                    }
                }

                if (notLast) {
                    // this is the end of the window for this parent
                    const otherDiff = Math.abs(babyPower - breedablePalsByBreedPower[bpi + 1].breedingPower);
                    if (otherDiff < selfDiff || (otherDiff === selfDiff && breedablePalsByBreedPower[bpi + 1].tiebreakIndex < child.tiebreakIndex)) {
                        break;
                    }
                }

                const parent1 = allPalsByBreedPower[p1];
                const parent2 = allPalsByBreedPower[p2];
                if (parent1.sortIndex < parent2.sortIndex) pairs.push([parent1, parent2]);
                else pairs.push([parent2, parent1]);
            }
        }

        if (sorted)
            return sortPairList(pairs);
        else
            return pairs;
    }
}

function getPalsByLayer(profileData) {
    const palSteps = {};
    const queue = [];
    let queueIndex = 0;

    const palsByLayer = {};
    
    Object.keys(profileData.pals).forEach(palId => {
        palSteps[palId] = 0;
        queue.push(palId);
    });

    while (queueIndex < queue.length) {
        const palId = queue[queueIndex++];
        const pal = pals[palId];

        // check all possible pairs with the current pal as one of the parents
        let currentIndex = 0;
        Object.values(allPalsByBreedPower).forEach(otherParent => {
            if (!(otherParent.id in palSteps)) return;
            if (palId === otherParent.id) return;

            // check if it's a unique pair, if not breed normally
            let children = checkUniquePair(pal, otherParent);
            if (!children) {
                const babyPower = computeBabyPower(pal, otherParent);
                // since we're iterating in order of breed power, the possible child will also always be in the same order if it's not a unique pair
                while (currentIndex < breedablePalsByBreedPower.length - 1 && !comparePowerGap(babyPower, breedablePalsByBreedPower[currentIndex], breedablePalsByBreedPower[currentIndex + 1])) {
                    currentIndex++;
                }
                children = [breedablePalsByBreedPower[currentIndex].id];
            }

            children.forEach(childId => {
                if (childId in palSteps) return;

                const steps = Math.max(palSteps[palId], palSteps[otherParent.id]) + 1;
                palSteps[childId] = steps;
                
                if (!(steps in palsByLayer)) palsByLayer[steps] = {};
                palsByLayer[steps][childId] = [pal, otherParent];
                queue.push(childId);
            });
        })
    }

    return palsByLayer;
}

export { allPalsByBreedPower, idToAllBreedPowerIndex, breedablePalsByBreedPower, idToBreedPowerIndex, uniquePairs, checkUniquePair, computeBabyPower, comparePowerGap };
export { getChildren, getParentPairs, getPalsByLayer };