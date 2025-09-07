import PriorityQueue from "js-priority-queue";
import { deconstructPalMaskId, getPalMaskId } from "./palLogic";
import { pals } from "@eldritchtools/palworld-shared-library";

import {
    allPalsByBreedPower,
    breedablePalsByBreedPower,
    checkUniquePair,
    computeBabyPower,
    comparePowerGap,
    getParentPairs
} from './breedingLogic';

const SEARCH_CHUNK_LIMIT = 50;

/* eslint-disable no-restricted-globals */
self.onmessage = function (e) {
    const { command, params } = e.data;
    if (command === "start") {
        findPaths(params);
    } else if (command === "cancel") {
        cancelled = true;
    }
};

let cancelled = false;

function findPaths({ targetChildId, targetPassives, profileData, searchBeamSize, costThreshold }) {
    if (!targetChildId) return { candidatePaths: [], suggestedPals: [] };
    cancelled = false;

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
    bests[getPalMaskId(pals[targetChildId], targetMask, targetPassives)] = targetBests;
    const targetBestsLimit = 100 * searchBeamSize;
    let batch = [];

    // insert a candidate node into 'bests', returns the resulting state if success, null otherwise
    // if the candidate is to the target, insert it and return the state
    const insertCandidate = (cost, pal, mask, path, goal = false) => {
        const palMaskId = getPalMaskId(pal, mask, targetPassives);
        if (goal) {
            const state = { cost, pal, mask, path };
            if (palMaskId in bests) bests[palMaskId].push(state);
            else bests[palMaskId] = [state];
            batch.push(state);
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
        const state = insertCandidate(0, pals[id], passiveMasks[id], {})
        if (state) queue.queue(state);
    });

    // search step chunk to yield to incoming messages in case of cancelling
    const handleSearchChunk = () => {
        // beam search bfs/dijkstra, early quit when enough candidates have been found or the computation was aborted
        let counter = 0;
        while (queue.length > 0 && targetBests.length < targetBestsLimit && !cancelled && counter < SEARCH_CHUNK_LIMIT) {
            counter++;
            const state = queue.dequeue();
            const { pal, mask, path } = state;
            const statePalMaskId = getPalMaskId(pal, mask, targetPassives);
            if (!bests[statePalMaskId].includes(state)) continue;
            visited[statePalMaskId] = true;

            // check all possible pairs with the current pal as one of the parents
            let currentIndex = 0;
            /* eslint-disable no-loop-func */
            Object.values(allPalsByBreedPower).forEach(otherParent => {
                if (otherParent.id === targetChildId) return;

                // ignore if the limit has been reached or the computation was aborted
                if (targetBests.length >= targetBestsLimit && !cancelled)
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
                        const childPalMaskId = getPalMaskId(pals[childId], newMask, targetPassives);
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
                                insertCandidate(Object.keys(newPath).length, pals[childId], newMask, newPath, true);
                            } else {
                                // inserting a candidate for further exploration
                                const newState = insertCandidate(Object.keys(newPath).length, pals[childId], newMask, newPath);
                                if (newState) queue.queue(newState);
                            }
                        });
                    }
                });
            })
        }

        if (batch.length > 0) {
            self.postMessage({ type: "batch", results: batch });
            batch.length = 0;
        }

        if (queue.length === 0 || targetBests.length >= targetBestsLimit || cancelled) {
            // legitimately ended
            // sort just in case
            targetBests.sort((a, b) => a.cost - b.cost);

            // find recommended capture pals by exploring all candidate paths collected at the target
            const explored = new Set();
            const scores = {};

            const addScore = (pal, saving, finalCost) => {
                if (pal.id in profileData.pals) return;
                if (pal.id in scores) scores[pal.id] += saving / (1 + 3 * finalCost);
                else scores[pal.id] = saving / (1 + 3 * finalCost);
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
            const result = { candidatePaths: targetBests, suggestedPals: Object.keys(scores).sort((a, b) => scores[b] - scores[a]).map(a => pals[a]) };
            self.postMessage({ type: "done", results: result, cancelled: cancelled });
        } else {
            // just ended due to chunk
            setTimeout(handleSearchChunk, 0);
        }
    }

    handleSearchChunk();
}