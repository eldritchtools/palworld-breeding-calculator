import { useMemo, useState } from "react";
import { getPalsByLayer } from "../palLogic/breedingLogic";

import { Tooltip } from "react-tooltip";
import { palEquationTextStyle, tooltipStyle } from "../styles";
import { useProfiles } from "@eldritchtools/shared-components";
import { pals, PalIcon, checkIdSearchMatch, palIdSortFunc } from "@eldritchtools/palworld-shared-library";

function SidePanel({ handleCompute }) {
    const { profileData, setProfileData } = useProfiles();

    const components = [];
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
        if (ownedSearch === "") return true;
        return checkIdSearchMatch(ownedSearch, palId);
    }).sort((a, b) => palIdSortFunc(a[0], b[0])).map(([palId, _]) => palId), [profileData.pals, ownedSearch]);

    components.push(<div style={{ display: "flex", flexDirection: "column", width: "95%", height: "45%", padding: "2px", borderRadius: "5px", border: "2px #aaa solid" }}>
        <div>
            {"Owned Pals "}
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
            const newPals = unownedSelected.reduce((acc, id) => {
                acc[id] = [];
                return acc;
            }, { ...prev.pals })
            return { ...prev, pals: newPals };
        });
        setUnownedSelected([]);
    }

    const removePals = () => {
        setProfileData(prev => {
            const newPals = Object.entries(prev.pals).filter(([id, _]) => !ownedSelected.includes(id)).reduce((acc, [id, passives]) => {
                acc[id] = passives;
                return acc;
            }, {});
            return { ...prev, pals: newPals };
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
        return Object.keys(pals).filter(palId => {
            if (palId in profileData.pals) return false;
            if (unownedSearch === "") return true;
            return checkIdSearchMatch(unownedSearch, palId);
        }).sort((a, b) => palIdSortFunc(a, b))
    }, [profileData.pals, unownedSearch]);

    components.push(<div style={{ display: "flex", flexDirection: "column", width: "95%", height: "48%", padding: "2px", borderRadius: "5px", border: "2px #aaa solid" }}>
        <div>
            {"Unowned Pals "}
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
        <button onClick={() => handleCompute(profileData)} style={{ fontSize: "1.5rem" }}>Compute!</button>
    </div>)


    return <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", alignItems: "center", gap: "0.2rem" }}>
        {components}
    </div>
}

function SpreadDisplay({ palsByLayer }) {
    const { profileData } = useProfiles();
    if (palsByLayer && Object.keys(palsByLayer).length > 0) {
        const steps = Object.keys(palsByLayer);
        steps.sort((a, b) => a - b);

        return <div style={{ height: "100%", width: "98%", padding: "0.2rem", }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflowY: "auto", gap: "0.2rem" }}>
                {steps.map(step => {
                    return <div style={{ display: "flex", flexDirection: "column", textAlign: "start", gap: "0.5rem", border: "1px #aaa solid", borderRadius: "15px", padding: "0.5rem", flex: "0 0 auto" }}>
                        <div style={{ display: "flex" }}>
                            <div data-tooltip-id={`Layer${step}`} style={{ fontSize: "1.2rem", fontWeight: "bold", borderBottom: "1px #aaa dashed" }}>
                                Layer {step}
                                <Tooltip id={`Layer${step}`} style={{ ...tooltipStyle, fontSize: "1rem", fontWeight: "normal" }}>
                                    {step === "1" ? "Layer 1 pals can be bred immediately." : `Layer ${step} pals need at least one layer ${step - 1} pal to be bred first.`}
                                </Tooltip>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", width: "98%", flexWrap: "wrap", gap: "1rem" }}>
                            {Object.entries(palsByLayer[step]).map(([id, parents]) => {
                                return <div data-tooltip-id={id} >
                                    <PalIcon id={id} circle={true} showName={true} showPalNumber={true} wrapName={true} />
                                    <Tooltip id={id} style={tooltipStyle}>
                                        <div>
                                            <div style={{ display: "flex", flexDirection: "column", width: "fit-content", gap: "0.2rem" }} >
                                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.2rem" }}>
                                                    <PalIcon pal={parents[0]} circle={true} showName={true} showPalNumber={true} />
                                                    <span style={palEquationTextStyle}>+</span>
                                                    <PalIcon pal={parents[1]} circle={true} showName={true} showPalNumber={true} />
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </div>
                            })}
                        </div>
                    </div>
                })}
                <div style={{ display: "flex", flexDirection: "column", textAlign: "start", gap: "0.5rem", border: "1px #aaa solid", borderRadius: "15px", padding: "0.5rem", flex: "0 0 auto" }}>
                        <div style={{ display: "flex" }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                                Remaining Unbreedable Pals
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", width: "98%", flexWrap: "wrap", gap: "1rem" }}>
                            {Object.keys(pals).filter(id => {
                                if(id in profileData.pals) return false;
                                if(Object.values(palsByLayer).some(layer => id in layer)) return false;
                                return true
                            }).map(id => {
                                return <PalIcon id={id} circle={true} showName={true} showPalNumber={true} wrapName={true} />
                            })}
                        </div>
                    </div>
            </div>
        </div>
    } else {
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <h2>No pals found. Catch more pals!</h2>
        </div>
    }
}

function BreedableCalcTab() {
    const [palsByLayer, setPalsByLayer] = useState([]);

    const handleCompute = (profileData) => {
        const palsByLayer = getPalsByLayer(profileData);
        setPalsByLayer(palsByLayer);
    }

    return <div style={{ height: "100%", width: "100%", display: "flex" }}>
        <div style={{ height: "100%", width: "30%" }}>
            <SidePanel handleCompute={handleCompute} />
        </div>
        <div style={{ height: "100%", width: "70%" }}>
            <SpreadDisplay palsByLayer={palsByLayer} />
        </div>
    </div>;
}

export default BreedableCalcTab;