import PriorityQueue from "js-priority-queue";
import data from "../data/data.json";
import { deconstructPalMaskId, getPairId, getPalMaskId } from "./palLogic";

const allPalsByBreedPower = Object.values(data.pals).sort((a, b) => a.breeding_power - b.breeding_power);
const idToAllBreedPowerIndex = allPalsByBreedPower.reduce((acc, pal, index) => {
    acc[pal.id] = index;
    return acc;
}, {});

const breedablePalsByBreedPower = allPalsByBreedPower.filter(pal => !pal.unique);
const idToBreedPowerIndex = breedablePalsByBreedPower.reduce((acc, pal, index) => {
    acc[pal.id] = index;
    return acc;
}, {});

const uniquePairs = Object.values(data.pals).reduce((acc, pal) => {
    if (pal.parents) {
        pal.parents.forEach(parents => {
            const pairId = getPairId(data.pals[parents[0]], data.pals[parents[1]]);
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
    return (parent1.breeding_power + parent2.breeding_power + 1) >> 1;
}

function comparePowerGap(babyPower, option1, option2) {
    const diff1 = Math.abs(babyPower - option1.breeding_power);
    const diff2 = Math.abs(babyPower - option2.breeding_power);
    return (diff1 < diff2 || (diff1 === diff2 && option1.index < option2.index));
}

function sortPairList(list) {
    return list.sort(([a1, a2], [b1, b2]) => {
        if (a1.id === b1.id) return a2.index - b2.index;
        return a1.index - b1.index;
    })
}

function getChildren(parentId1, parentId2) {
    if (parentId1 === null && parentId2 === null) {
        return {};
    } else if (parentId1 === null || parentId2 === null) {
        const parent = parentId1 ? data.pals[parentId1] : data.pals[parentId2];
        const results = { [parent.id]: [[parent, parent]] };
        let currentIndex = 0;
        Object.values(allPalsByBreedPower).forEach(otherParent => {
            if (parent.id === otherParent.id) return;
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
        const parent1 = data.pals[parentId1];
        const parent2 = data.pals[parentId2];
        if (parent1.index === parent2.index) return { [parent1.id]: [[parent1, parent2]] };
        const uniquePair = checkUniquePair(parent1, parent2);
        if (uniquePair) return uniquePair.reduce((acc, id) => { acc[id] = [[parent1, parent2]]; return acc }, {});
        const babyPower = computeBabyPower(parent1, parent2);
        // binary search with left and right ends starting at the index of the parents since the child is always between them
        // use the left and right ends if the parent isn't in the list
        let L, R = null;
        if (parent1.breeding_power < parent2.breeding_power) {
            L = parent1.unique ? 0 : idToBreedPowerIndex[parent1.id];
            R = parent2.unique ? breedablePalsByBreedPower.length - 1 : idToBreedPowerIndex[parent2.id];
        } else {
            L = parent2.unique ? 0 : idToBreedPowerIndex[parent2.id];
            R = parent1.unique ? breedablePalsByBreedPower.length - 1 : idToBreedPowerIndex[parent1.id];
        }

        while (R - L > 2) {
            let M = (R + L) >> 1;
            if (breedablePalsByBreedPower[M].breeding_power < babyPower) L = M;
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
    const child = data.pals[childId];
    if (child.unique) {
        if (child.parents)
            return sortPairList([...child.parents.map(parents => parents.map(p => data.pals[p])), [child, child]]);
        else
            return [[child, child]];
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
                const selfDiff = Math.abs(babyPower - child.breeding_power);

                if (notFirst) {
                    const otherDiff = Math.abs(babyPower - breedablePalsByBreedPower[bpi - 1].breeding_power);
                    if (otherDiff < selfDiff || (otherDiff === selfDiff && breedablePalsByBreedPower[bpi - 1].index < child.index)) {
                        si++;
                        continue;
                    }
                }

                if (notLast) {
                    const otherDiff = Math.abs(babyPower - breedablePalsByBreedPower[bpi + 1].breeding_power);
                    if (otherDiff < selfDiff || (otherDiff === selfDiff && breedablePalsByBreedPower[bpi + 1].index < child.index)) {
                        break;
                    }
                }

                const parent1 = allPalsByBreedPower[p1];
                const parent2 = allPalsByBreedPower[p2];
                if (parent1.index < parent2.index) pairs.push([parent1, parent2]);
                else pairs.push([parent2, parent1]);
            }
        }

        if (sorted)
            return sortPairList(pairs);
        else
            return pairs;
    }
}

function findPaths(targetChildId, targetPassives, profileData, searchBeamSize, costThreshold) {
    if (!targetChildId) return { candidatePaths: [], suggestedPals: [] };

    // bitmask of passives of each starting pal
    const passiveMasks = Object.entries(profileData.pals).reduce((acc, [id, passives]) => {
        let mask = 0;
        for (let i = 0; i < targetPassives.length; i++) {
            if (passives.includes(targetPassives[i])) {
                mask |= (1 << i);
            }
        }
        acc[id] = mask;
        return acc;
    }, {});

    // data structs for the beam search bfs
    const queue = new PriorityQueue({ comparator: (a, b) => a.cost - b.cost });
    const bests = {}
    const visited = {};
    const targetBests = [];
    const targetMask = (1 << targetPassives.length) - 1;
    bests[getPalMaskId(data.pals[targetChildId], targetMask, targetPassives)] = targetBests;
    const targetBestsLimit = 100 * searchBeamSize;

    // insert a candidate node into 'bests', returns the resulting state if success, null otherwise
    // if the candidate is to the target, insert it and return the state
    const insertCandidate = (cost, pal, mask, path, goal = false) => {
        const palMaskId = getPalMaskId(pal, mask, targetPassives);
        if (goal) {
            const state = { cost, pal, mask, path };
            if (palMaskId in bests) bests[palMaskId].push(state);
            else bests[palMaskId] = [state];
            return state;
        }
        if (palMaskId in bests) {
            if (bests[palMaskId].length < searchBeamSize || cost < bests[palMaskId][bests[palMaskId].length - 1].cost) {
                const state = { cost, pal, mask, path };
                bests[palMaskId].push(state);
                bests[palMaskId].sort((a, b) => a.cost - b.cost);
                visited[palMaskId] = false;
                if (pal.id !== targetChildId && bests[palMaskId].length > searchBeamSize) {
                    bests[palMaskId].length = searchBeamSize;
                }
                return state;
            }
        } else {
            const state = { cost, pal, mask, path }
            bests[palMaskId] = [state];
            visited[palMaskId] = false;
            return state;
        }
        return null;
    }

    // insert all initially available pals as starting nodes
    Object.keys(profileData.pals).forEach(id => {
        const state = insertCandidate(0, data.pals[id], passiveMasks[id], {})
        if (state) queue.queue(state);
    });

    // beam search bfs/dijkstra, early quit when enough candidates have been found
    while (queue.length > 0 && targetBests.length < targetBestsLimit) {
        const state = queue.dequeue();
        const { pal, mask, path } = state;
        const statePalMaskId = getPalMaskId(pal, mask, targetPassives);
        if (!bests[statePalMaskId].includes(state)) continue;
        visited[statePalMaskId] = true;

        // check all possible pairs with the current pal as one of the parents
        let currentIndex = 0;
        Object.values(allPalsByBreedPower).forEach(otherParent => {
            if (otherParent.id === targetChildId) return;

            // ignore if the limit has been reached
            if (targetBests.length >= targetBestsLimit)
                return;

            // check if it's a unique pair, if not breed normally
            let children = checkUniquePair(pal, otherParent);
            if (!children && pal.id === otherParent.id) children = [pal.id];
            if (!children) {
                const babyPower = computeBabyPower(pal, otherParent);
                // since we're iterating in order of breed power, the possible child will also always be in the same order if it's not a unique pair
                while (currentIndex < breedablePalsByBreedPower.length - 1 && !comparePowerGap(babyPower, breedablePalsByBreedPower[currentIndex], breedablePalsByBreedPower[currentIndex + 1])) {
                    currentIndex++;
                }
                children = [breedablePalsByBreedPower[currentIndex].id];
            }

            children.forEach(childId => {
                // need to do this check for all possible masks of the other parent
                for (let otherMask = 0; otherMask < (1 << targetPassives.length); otherMask++) {
                    const palMaskId = getPalMaskId(otherParent, otherMask, targetPassives);
                    // Only consider visited states to prevent doubling and invalid paths
                    if (!visited[palMaskId]) continue;

                    const newMask = (childId in passiveMasks ? passiveMasks[childId] : 0) | mask | otherMask;
                    const childPalMaskId = getPalMaskId(data.pals[childId], newMask, targetPassives);
                    // If the child pal was a needed breed in this pal's path, then ignore this to prevent circular breed paths
                    if (childPalMaskId in path) continue;

                    // if the resulting pal was already available from the start and its passive list is a superset of that of both parents then there's no point in breeding them
                    // technically there is if the passives are more isolated in the parents, but that's just a limitation of this tool
                    if (childId in profileData.pals && (passiveMasks[childId] | mask | otherMask) === passiveMasks[childId]) continue;

                    // If both parents are the same and one mask is the subset of another, then there's no point in breeding them
                    // It is relevant to check this and not to just ignore all cases of the same parents because there may be cases of a pal
                    // needing to be bred with two different sets of passives under two different pairs of parents, then combined to get the final passives
                    if (pal.id === otherParent.id && ((mask | otherMask) === mask || (mask | otherMask) === otherMask)) continue;

                    let otherStates = null;
                    if (otherParent.id in profileData.pals) {
                        // if the other parent is an already available pal, only consider masks that are not strictly subsets of its initial mask
                        if ((otherMask | passiveMasks[otherParent.id]) === passiveMasks[otherParent.id] && otherMask !== passiveMasks[otherParent.id]) continue;
                        // check if this configuration is available get its best states
                        if (palMaskId in bests) otherStates = bests[palMaskId];
                    } else {
                        // if the other parent was also bred, get its best states if available
                        if (palMaskId in bests) otherStates = bests[palMaskId];
                    }
                    // only propagate if the other parent was available
                    if (!otherStates) continue;

                    otherStates.forEach(otherState => {
                        // If the child pal was a needed breed in the other path, then ignore this to prevent circular breed paths
                        if (childPalMaskId in otherState.path) return;

                        // merge passive masks of parents with mask of child if it's already available

                        const newPath = { ...path, ...otherState.path, [childPalMaskId]: [[pal, mask], [otherParent, otherMask]] };

                        if (childId === targetChildId && newMask === (1 << targetPassives.length) - 1) {
                            // inserting a candidate for the goal
                            insertCandidate(Object.keys(newPath).length, data.pals[childId], newMask, newPath, true);
                        } else {
                            // inserting a candidate for further exploration
                            const newState = insertCandidate(Object.keys(newPath).length, data.pals[childId], newMask, newPath);
                            if (newState) queue.queue(newState);
                        }
                    });
                }
            });
        })
    }

    // sort just in case
    targetBests.sort((a, b) => a.cost - b.cost);

    // find recommended capture pals by exploring all candidate paths collected at the target
    const explored = new Set();
    const scores = {};

    const addScore = (pal, saving, finalCost) => {
        if (pal.id in profileData.pals) return;
        if (pal.id in scores) scores[pal.id] += saving / (1 + 3*finalCost);
        else scores[pal.id] = saving / (1 + 3*finalCost);
    }

    if (targetBests.length > 0) {
        targetBests.forEach(({ cost, path }) => {
            Object.entries(path).forEach(([palMaskId, [[p1, m1], [p2, m2]]]) => {
                const [child, mask] = deconstructPalMaskId(palMaskId, targetPassives);

                // consider cases where one parent is a capture pal
                const cost1 = bests[getPalMaskId(p1, m1, targetPassives)][0].cost;
                const cost2 = bests[getPalMaskId(p2, m2, targetPassives)][0].cost;
                if (m2 === mask && !(p2.id in profileData.pals)) addScore(p2, cost1, cost - cost1);
                if (m1 === mask && !(p1.id in profileData.pals)) addScore(p1, cost2, cost - cost2);

                // skip exploration of parent combinations if this state was already previously explored
                if (explored.has(palMaskId)) return;
                explored.add(palMaskId);

                getParentPairs(child.id, false).forEach(([parent1, parent2]) => {
                    const bests1 = bests[getPalMaskId(parent1, mask, targetPassives)];
                    const bests2 = bests[getPalMaskId(parent2, mask, targetPassives)];

                    // if the path of one parent is within the cost threshold and the other is not initially available, score the unavailable pal
                    // technically also checking for the unavailable pal in the path would be correct, but that seems unnecessary for the added complexity 
                    if (bests1 && bests1[0].cost <= costThreshold && !(parent2.id in profileData.pals)) addScore(parent2, costThreshold, cost - costThreshold);
                    if (bests2 && bests2[0].cost <= costThreshold && !(parent1.id in profileData.pals)) addScore(parent1, costThreshold, cost - costThreshold);
                })
            })
        });
    } else {
        // If the child is unreachable, check all direct parents to see if it can be salvaged by catching a pal
        getParentPairs(targetChildId, false).forEach(([parent1, parent2]) => {
            const bests1 = bests[getPalMaskId(parent1, targetMask, targetPassives)];
            const bests2 = bests[getPalMaskId(parent2, targetMask, targetPassives)];

            // if the path of one parent is within the cost threshold and the other is not initially available, score the unavailable pal
            // technically also checking for the unavailable pal in the path would be correct, but that seems unnecessary for the added complexity
            if (bests1 && bests1.length > 0 && bests1[0].cost <= costThreshold && !(parent2.id in profileData.pals)) addScore(parent2, costThreshold, bests1[0].cost);
            if (bests2 && bests2.length > 0 && bests2[0].cost <= costThreshold && !(parent1.id in profileData.pals)) addScore(parent1, costThreshold, bests2[0].cost);
        })
    }

    // sort suggested pals by decreasing score
    return { candidatePaths: targetBests, suggestedPals: Object.keys(scores).sort((a, b) => scores[b] - scores[a]).map(a => data.pals[a]) }
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
        const pal = data.pals[palId];

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

export { getChildren, getParentPairs, findPaths, getPalsByLayer };