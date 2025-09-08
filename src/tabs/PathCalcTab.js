import { useEffect, useMemo, useRef, useState } from "react";

import BreedPathTree from "./BreedPathTree";
import { Tooltip } from "react-tooltip";
import { tooltipStyle } from "../styles";
import { useProfiles } from "@eldritchtools/shared-components";
import { pals, PalIcon, PalSelect, PassiveSelect, palIdSortFunc, checkIdSearchMatch } from "@eldritchtools/palworld-shared-library";

function SliderComponent({ value, setValue, min = 1, max = 10 }) {
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.2rem" }}>
            <input type="range" min={min} max={max} step={1} value={value} onChange={e => setValue(Number(e.target.value))} />
            <input type="number" min={min} max={max} step={1} value={value} onChange={e => setValue(Number(e.target.value))} />
        </div>
    );
}

function SidePanel({ suggestedPals, handleCompute, isRunning }) {
    const { profileData, setProfileData } = useProfiles();
    const [targetPalId, setTargetPalId] = useState(null);
    const [passives, setPassives] = useState([null, null, null, null]);
    const [searchThoroughness, setSearchThoroughness] = useState(5);
    const [preferredBreedLimit, setPreferredBreedLimit] = useState(5);
    const [menuSetting, setMenuSetting] = useState(null);

    const handleSetPassive = (passive, index) => {
        setPassives(prev => prev.map((p, i) => i === index ? passive : p));
    }

    const handleRightClick = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        setPassives(prev => prev.map((p, i) => i === index ? null : p));
    }

    const handleSetMenuSetting = (x) => {
        setOwnedSelected([]);
        setUnownedSelected([]);
        setMenuSetting(x);
    }

    const handleSetMenuRightClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSetMenuSetting(null);
    }


    const components = [];
    // target pal section
    components.push(<div style={{ display: "flex", flexDirection: "column", width: "90%", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "row", width: "80%", alignItems: "center", gap: "1rem" }}>
            <PalIcon id={targetPalId} circle={true} />
            <div style={{ flex: 1 }}>
                <PalSelect value={targetPalId} onChange={setTargetPalId} />
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.3rem" }}>
            Passives (optional, right-click or X to clear)
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.1rem" }}>
                {passives.map((p, index) => <div onContextMenu={(e) => handleRightClick(e, index)}>
                    <PassiveSelect value={p} onChange={(x) => handleSetPassive(x, index)} />
                </div>)}
            </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div data-tooltip-id={"searchThoroughness"} style={{ textAlign: "end", paddingRight: "1em" }}>
                <span style={{ borderBottom: "1px #aaa dashed" }}>Search Thoroughness</span>
                <Tooltip id={"searchThoroughness"} style={{ ...tooltipStyle, textAlign: "start" }}>
                    How thorough the path finding will try to be. <br />
                    Lower values are less likely to find optimal paths, but are faster. Higher values are more likely to find optimal paths, but are slower. <br />
                    Lower values may still find more optimal paths than higher values. Higher values are just more likely to find them. <br />
                    The total number of paths found is softcapped by 100 times this value to reduce computation time. <br /><br />

                    Recommendation: Leave it at the default value of 5 for most cases of breeding a specific pal. <br />
                    Reduce it to 2-3 if you're computing for passives as well and you expect the paths to be long (10+ steps). <br /><br />

                    Caution: Higher values may cause the computation to take a very very long time especially when also using passives.
                </Tooltip>
            </div>
            <SliderComponent value={searchThoroughness} setValue={setSearchThoroughness} />
            <div data-tooltip-id={"preferredBreedLimit"} style={{ textAlign: "end", paddingRight: "1em" }}>
                <span style={{ borderBottom: "1px #aaa dashed" }}>Preferred Breed Limit</span>
                <Tooltip id={"preferredBreedLimit"} style={{ ...tooltipStyle, textAlign: "start" }}>
                    The calculator will try to recommend pals that can shorten breed paths that exceed this length or<br />
                    to make previously unavailable paths available if they do not exceed this length. <br /><br />

                    This has no bearing on the paths actually found by the calculator, only on the recommendations that are shown below. <br /><br />

                    When computing paths with passives, the suggestions will assume that caught pals have no passives. <br />
                    All passives will have to come from pals you already own.<br /><br />

                    The recommendations are not guaranteed to provide you with new shortest paths, especially if the calculator already found short paths.<br />
                    However, generally speaking, if your paths are already short, then lowering this value will likely give better suggestions.<br />
                    Likewise, if your paths are long, increasing this value will likely give better suggestions.
                </Tooltip>
            </div>
            <SliderComponent value={preferredBreedLimit} setValue={setPreferredBreedLimit} />
        </div>
        <div>
            <div>Setting Pals or Passives? (right-click or X to return) </div>
            <div onContextMenu={(e) => handleSetMenuRightClick(e)}>
                <PassiveSelect value={menuSetting} onChange={handleSetMenuSetting} />
            </div>
        </div>
    </div>)

    // owned pals section
    const [ownedSearch, setOwnedSearch] = useState("");
    const handleSetOwnedSearch = (e) => {
        setOwnedSearch(e.target.value);
    }

    const [ownedSelected, setOwnedSelected] = useState([]);
    const handleToggleOwnedSelected = (palId) => {
        if (ownedSelected.includes(palId)) {
            setOwnedSelected(prev => prev.filter(id => id !== palId))
        } else {
            setOwnedSelected(prev => [...prev, palId]);
        }
    }

    const filteredOwned = useMemo(() => Object.entries(profileData.pals).filter(([palId, passives]) => {
        if (menuSetting && !passives.includes(menuSetting)) return false;
        if (ownedSearch === "") return true;
        return checkIdSearchMatch(ownedSearch, palId);
    }).sort((a, b) => palIdSortFunc(a[0], b[0])).map(([palId, _]) => palId), [profileData.pals, ownedSearch, menuSetting]);

    components.push(<div style={{ display: "flex", flexDirection: "column", width: "95%", height: "32%", padding: "2px", borderRadius: "5px", border: "2px #aaa solid" }}>
        <div>
            {menuSetting ? "Pals with this passive " : "Owned Pals "}
            <input onChange={handleSetOwnedSearch} value={ownedSearch} />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.3rem", margin: "0.2rem" }}>
                {filteredOwned.map(ownedId => <div onClick={() => handleToggleOwnedSelected(ownedId)}>
                    <PalIcon id={ownedId} circle={true} highlighted={ownedSelected.includes(ownedId)} />
                </div>)}
            </div>
        </div>
    </div>)

    const addPals = () => {
        setProfileData(prev => {
            if (menuSetting) {
                const newPals = { ...prev.pals };
                unownedSelected.forEach((id) => {
                    if (!newPals[id].includes(menuSetting)) newPals[id].push(menuSetting);
                })
                return { ...prev, pals: newPals };
            } else {
                const newPals = unownedSelected.reduce((acc, id) => {
                    acc[id] = [];
                    return acc;
                }, { ...prev.pals })
                return { ...prev, pals: newPals };
            }
        });
        setUnownedSelected([]);
    }

    const removePals = () => {
        setProfileData(prev => {
            if (menuSetting) {
                const newPals = { ...prev.pals };
                ownedSelected.forEach((id) => {
                    newPals[id] = newPals[id].filter(x => x !== menuSetting);
                })
                return { ...prev, pals: newPals };
            } else {
                const newPals = Object.entries(prev.pals).filter(([id, _]) => !ownedSelected.includes(id)).reduce((acc, [id, passives]) => {
                    acc[id] = passives;
                    return acc;
                }, {});
                return { ...prev, pals: newPals };
            }
        });
        setOwnedSelected([]);
    }

    // swap owned/unowned buttons
    components.push(<div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
        <button style={{ fontSize: "1rem" }} onClick={addPals}>&uarr;</button>
        <button style={{ fontSize: "1rem" }} onClick={removePals}>&darr;</button>
    </div>)

    // unowned suggested pals section
    const [unownedSearch, setUnownedSearch] = useState("");
    const handleSetUnownedSearch = (e) => {
        setUnownedSearch(e.target.value);
    }

    const [unownedSelected, setUnownedSelected] = useState([]);
    const handleToggleUnownedSelected = (palId) => {
        if (unownedSelected.includes(palId)) {
            setUnownedSelected(prev => prev.filter(id => id !== palId))
        } else {
            setUnownedSelected(prev => [...prev, palId]);
        }
    }

    const filteredUnowned = useMemo(() => {
        if (menuSetting) {
            return Object.entries(profileData.pals).filter(([palId, passives]) => {
                if (passives.includes(menuSetting)) return false;
                if (unownedSearch === "") return true;
                return checkIdSearchMatch(unownedSearch, palId);
            }).sort((a, b) => palIdSortFunc(a[0], b[0])).map(([palId, _]) => palId);
        } else {
            return Object.keys(pals).filter(palId => {
                if (palId in profileData.pals) return false;
                if (suggestedPals && suggestedPals.some(suggestion => palId === suggestion.id)) return false;
                if (unownedSearch === "") return true;
                return checkIdSearchMatch(unownedSearch, palId);
            }).sort((a, b) => palIdSortFunc(a, b))
        }
    }, [profileData.pals, suggestedPals, unownedSearch, menuSetting]);

    components.push(<div style={{ display: "flex", flexDirection: "column", width: "95%", height: "38%", padding: "2px", borderRadius: "5px", border: "2px #aaa solid" }}>
        {suggestedPals && suggestedPals.length > 0 ? <>
            <div>Pals likely to enable easier paths if caught</div>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center", overflowX: "auto", overflowY: "hidden", boxSizing: "border-box", gap: "0.3rem", margin: "0.2rem" }}>
                {suggestedPals.map(suggestion => <div onClick={() => handleToggleUnownedSelected(suggestion.id)}>
                    <PalIcon pal={suggestion} circle={true} highlighted={unownedSelected.includes(suggestion.id)} />
                </div>)}
            </div>
        </> : null}
        <div>
            {menuSetting ? "Pals without this passive " : (suggestedPals && suggestedPals.length > 0 ? "Other Unowned Pals " : "Unowned Pals ")}
            <input onChange={handleSetUnownedSearch} value={unownedSearch} />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.3rem", margin: "0.2rem" }}>
                {filteredUnowned.map(unownedId => <div onClick={() => handleToggleUnownedSelected(unownedId)}>
                    <PalIcon id={unownedId} circle={true} highlighted={unownedSelected.includes(unownedId)} />
                </div>)}
            </div>
        </div>
    </div>)

    components.push(<div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={() => handleCompute(targetPalId, passives, profileData, searchThoroughness, preferredBreedLimit)} style={{ fontSize: "1.5rem" }}>
            {isRunning ? "Cancel" : "Compute!"}
        </button>
    </div>)


    return <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", alignItems: "center", gap: "0.2rem" }}>
        {components}
    </div>
}

const getPaths = (paths, start, count) => {
    if (count >= paths.length) return [...paths];
    const result = [];
    for (let i = 0; i < count; i++) result.push(paths[(start + i) % paths.length]);
    return result;
}

function PathsDisplay({ candidatePaths, passives, isRunning }) {
    // const pathsShown = candidatePaths[0].cost < 3 ? 3 : 6;
    const [counter, setCounter] = useState(0);
    const [paths, setPaths] = useState([]);
    const [random, setRandom] = useState(false);
    const [pathsShown, setPathsShown] = useState(3);

    const [coloredEdges, setColoredEdges] = useState(false);
    const handleColoredEdgesToggle = () => {
        setColoredEdges(!coloredEdges);
    }

    useEffect(() => {
        setCounter(0);
        setPaths(getPaths(candidatePaths, 0, pathsShown));
        setRandom(false);
    }, [candidatePaths, pathsShown]);

    const handleResetCounter = () => {
        setCounter(0);
        setPaths(getPaths(candidatePaths, 0, pathsShown));
        setRandom(false);
    }

    const moveNextSet = () => {
        if (random) {
            setCounter(0);
            setPaths(getPaths(candidatePaths, 0, pathsShown));
            setRandom(false);
        } else {
            let newCounter = (counter + pathsShown) % candidatePaths.length;
            setCounter(p => newCounter);
            setPaths(getPaths(candidatePaths, newCounter, pathsShown));
        }
    }

    const movePreviousSet = () => {
        if (random) {
            setCounter(0);
            setPaths(getPaths(candidatePaths, 0, pathsShown));
            setRandom(false);
        } else {
            let newCounter = counter - pathsShown;
            if (newCounter < 0) newCounter += candidatePaths.length;

            setCounter(newCounter);
            setPaths(getPaths(candidatePaths, newCounter, pathsShown));
        }
    }

    const showRandom = () => {
        if (pathsShown > candidatePaths.length) {
            setPaths(candidatePaths);
        } else {
            const newPaths = [];
            while (newPaths.length < pathsShown) {
                const element = candidatePaths[Math.floor(Math.random() * candidatePaths.length)];
                if (!newPaths.includes(element)) newPaths.push(element);
            }
            setPaths(newPaths);
        }
        setRandom(true);
    }

    const handleSetPathsShown = (e) => {
        setPathsShown(parseInt(e.target.value));
    }

    if (candidatePaths && candidatePaths.length > 0) {
        const outerContainerStyle = pathsShown < 4 ?
            { display: "flex", flexDirection: "row", height: "97%", gap: "0.2rem" } :
            { display: "grid", gridTemplateRows: "1fr 1fr", gridTemplateColumns: `repeat(${pathsShown / 2}, 1fr)`, height: "97%", gap: "0.2rem" };
        const innerContainerStyle = pathsShown < 4 ?
            { flex: 1, height: "100%", border: "1px #aaa solid", borderRadius: "20px" } :
            { width: "100%", height: "100%", border: "1px #aaa solid", borderRadius: "20px" };

        return <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "98%", padding: "0.2rem", justifyContent: "space-between" }}>
            <div style={outerContainerStyle}>
                {paths.map(path => <div style={innerContainerStyle}>
                    <BreedPathTree breedPath={path.path} passives={passives} coloredEdges={coloredEdges} />
                </div>)}
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <label data-tooltip-id={"coloredEdges"}>
                    <input type="checkbox" onChange={handleColoredEdgesToggle} />
                    Color code edges?
                    <Tooltip id={"coloredEdges"} style={tooltipStyle}>
                        Colors will be randomly assigned to pals.
                    </Tooltip>
                </label>
                <button onClick={movePreviousSet}>Previous Set</button>
                <button onClick={moveNextSet}>Next Set</button>
                <button onClick={handleResetCounter}>Reset to Start</button>
                <button onClick={showRandom}>Show Random Paths</button>
                <label>
                    {"Paths Shown: "}
                    <select value={pathsShown} onChange={handleSetPathsShown}>
                        <option key={1} value={1}>1</option>
                        <option key={2} value={2}>2</option>
                        <option key={3} value={3}>3</option>
                        <option key={4} value={4}>4</option>
                        <option key={6} value={6}>6</option>
                    </select>
                </label>
                {random ?
                    <div>Showing {pathsShown} random paths out of {candidatePaths.length} </div> :
                    <div>{counter + 1} to {(counter + pathsShown) % (candidatePaths.length + 1)} of {candidatePaths.length} found paths</div>
                }
            </div>
        </div>
    } else {
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isRunning ?
                <h2>Searching for paths...</h2> :
                <h2>No paths found. Catch more pals or run compute with other settings!</h2>
            }
        </div>
    }
}

function PathCalcTab() {
    const [candidatePaths, setCandidatePaths] = useState([]);
    const [suggestedPals, setSuggestedPals] = useState(null);
    const [passives, setPassives] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const workerRef = useRef(null);

    const handleCompute = (targetPalId, passives, profileData, searchThoroughness, preferredBreedLimit) => {
        // remove nulls
        // const cleanPassives = passives.filter(p => p);
        // setPassives(cleanPassives);
        // const { candidatePaths, suggestedPals } = findPaths(targetPalId, cleanPassives, profileData, searchThoroughness, preferredBreedLimit);
        // setCandidatePaths(candidatePaths)
        // setSuggestedPals(suggestedPals.slice(0, 5));

        if (isRunning) {
            workerRef.current.postMessage({ command: "cancel" });
            setIsRunning(false);
        } else {
            // remove nulls
            const cleanPassives = passives.filter(p => p);
            setPassives(cleanPassives);
            setCandidatePaths([]);
            setSuggestedPals(null);
            const worker = new Worker(new URL("../palLogic/findPathsWorker.js", import.meta.url));
            workerRef.current = worker;
            setIsRunning(true);

            worker.onmessage = (e) => {
                if (e.data.type === "batch") {
                    setCandidatePaths(prev => {
                        const merged = [...prev, ...e.data.results];
                        return merged.sort((a, b) => a.cost - b.cost);
                    });
                }
                if (e.data.type === "done") {
                    setIsRunning(false);
                    setCandidatePaths(e.data.results.candidatePaths);
                    setSuggestedPals(e.data.results.suggestedPals.slice(0, 5));
                    worker.terminate();
                    workerRef.current = null;
                }
            };

            worker.postMessage({
                command: "start", params: {
                    targetChildId: targetPalId,
                    targetPassives: cleanPassives,
                    profileData: profileData,
                    searchBeamSize: searchThoroughness,
                    costThreshold: preferredBreedLimit
                }
            });
        }
    }

    // Cleanup when tab unmounts
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    return <div style={{ height: "100%", width: "100%", display: "flex" }}>
        <div style={{ height: "100%", width: "30%" }}>
            <SidePanel suggestedPals={suggestedPals} handleCompute={handleCompute} isRunning={isRunning} />
        </div>
        <div style={{ height: "100%", width: "70%" }}>
            <PathsDisplay candidatePaths={candidatePaths} passives={passives} isRunning={isRunning} />
        </div>
    </div>;
}

export default PathCalcTab;