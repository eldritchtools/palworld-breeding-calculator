import { useMemo, useState } from "react";

import { Modal } from "../components/Modal";
import { useProfiles } from "@eldritchtools/shared-components";
import { pals, PalIcon, PalSelect, PassiveSelect, PassiveComponent, checkIdSearchMatch, palIdSortFunc } from "@eldritchtools/palworld-shared-library";

function ProfilesPanel() {
    const { profiles, currentProfile, addProfile, switchProfile, copyProfile, deleteProfile } = useProfiles();
    const [selected, setSelected] = useState(null);
    const [addProfileIsOpen, setAddProfileIsOpen] = useState(false);
    const [copyProfileIsOpen, setCopyProfileIsOpen] = useState(false);
    const [deleteProfileIsOpen, setDeleteProfileIsOpen] = useState(false);
    const [name, setName] = useState("");

    const handleSwitchProfileButton = () => {
        if (!selected) return;
        switchProfile(selected).catch(err => {
            console.error(err.message);
        });
    }

    const handleCopyProfileButton = () => {
        if (!selected) return;
        setCopyProfileIsOpen(true);
    }

    const handleDeleteProfileButton = () => {
        if (!selected) return;
        setDeleteProfileIsOpen(true);
    }

    const closeAddProfile = () => {
        setAddProfileIsOpen(false);
        setName("");
    }

    const closeCopyProfile = () => {
        setCopyProfileIsOpen(false);
        setName("");
    }

    const handleAddProfile = () => {
        addProfile(name).catch(err => {
            console.error(err.message);
        });
        setName("");
        setAddProfileIsOpen(false);
    }

    const handleCopyProfile = () => {
        copyProfile(selected, name).catch(err => {
            console.error(err.message);
        });
        setName("");
        setCopyProfileIsOpen(false);
    }

    const handleDeleteProfile = () => {
        deleteProfile(selected).catch(err => {
            console.error(err.message);
        });
        setDeleteProfileIsOpen(false);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Profiles</span>
        <div style={{ display: "flex", width: "50%", height: "5rem", justifyContent: "center", overflowY: "scroll", border: "1px #aaa solid" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", width: "100%", height: "100%" }}>
                {profiles.map(profile => {
                    return <div style={selected === profile ? { background: "rgba(255, 255, 255, 0.25)" } : {}} onClick={() => setSelected(profile)}>
                        {profile}
                    </div>
                })}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: "0.5rem" }}>
            <button onClick={() => setAddProfileIsOpen(true)}>Create New Profile</button>
            <button onClick={handleSwitchProfileButton}>Switch to Selected Profile</button>
            <button onClick={handleCopyProfileButton}>Copy Selected Profile</button>
            <button onClick={handleDeleteProfileButton}>Delete Selected Profile</button>
        </div>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Current Profile: {currentProfile}</span>

        <Modal isOpen={addProfileIsOpen} onClose={closeAddProfile}>
            <h3>Input Name:</h3>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <div style={{ display: "flex", justifyContent: "end", gap: "2" }}>
                <button onClick={closeAddProfile}>Cancel</button>
                <button onClick={handleAddProfile}>Create</button>
            </div>
        </Modal>

        <Modal isOpen={copyProfileIsOpen} onClose={closeCopyProfile}>
            <h3>Input Name:</h3>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <div style={{ display: "flex", justifyContent: "end", gap: "2" }}>
                <button onClick={closeCopyProfile}>Cancel</button>
                <button onClick={handleCopyProfile}>Copy</button>
            </div>
        </Modal>

        <Modal isOpen={deleteProfileIsOpen} onClose={() => setDeleteProfileIsOpen(false)}>
            <h3>Are you sure you want to delete '{selected}'?</h3>
            <div style={{ display: "flex", justifyContent: "end", gap: "2" }}>
                <button onClick={() => setDeleteProfileIsOpen(false)}>Cancel</button>
                <button onClick={handleDeleteProfile}>Delete</button>
            </div>
        </Modal>
    </div>
}

function PalsPanel() {
    const { profileData, setProfileData } = useProfiles();
    const [menuSetting, setMenuSetting] = useState(null);

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
    components.push(<div style={{ display: "flex", flexDirection: "column", flex: "0 0 auto", width: "90%", alignItems: "center", gap: "0.5rem" }}>
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

    components.push(<div style={{ display: "flex", flexDirection: "column", width: "95%", flex: "1 1 0", minHeight: "0", padding: "2px", borderRadius: "5px", border: "2px #aaa solid" }}>
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
    components.push(<div style={{ display: "flex", flexDirection: "row", gap: "1rem", flex: "0 0 auto" }}>
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
                if (unownedSearch === "") return true;
                return checkIdSearchMatch(unownedSearch, palId);
            }).sort((a, b) => palIdSortFunc(a, b))
        }
    }, [profileData.pals, unownedSearch, menuSetting]);

    components.push(<div style={{ display: "flex", flexDirection: "column", width: "95%", flex: "1 1 0", minHeight: "0", padding: "2px", borderRadius: "5px", border: "2px #aaa solid" }}>
        <div>
            {menuSetting ? "Pals without this passive " : "Unowned Pals "}
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

    return <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", alignItems: "center", gap: "0.2rem" }}>
        {components}
    </div>
}

function PassivesPanel() {
    const { profileData, setProfileData } = useProfiles();
    const [selectedPalId, setSelectedPalId] = useState(null);

    const addPal = () => {
        setProfileData(prev => {
            const newPals = {...prev.pals, [selectedPalId]: []};
            return { ...prev, pals: newPals };
        });
    }

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "row", width: "80%", alignItems: "center", gap: "1rem" }}>
            <PalIcon id={selectedPalId} circle={true} />
            <div style={{ flex: 1 }}>
                <PalSelect value={selectedPalId} onChange={x => setSelectedPalId(x)} />
            </div>
        </div>
        <div style={{ border: "1px #aaa solid", borderRadius: "5px", flex: 1, minHeight: 0, width: "100%", padding: "0.5rem" }}>
            {
                selectedPalId ?
                    selectedPalId in profileData.pals ?
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                            <span>Passives owned by this type of pal</span>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "0.2rem", width: "100%", height: "100%" }}>
                                {profileData.pals[selectedPalId].sort().map(passive => <PassiveComponent name={passive} addBorder={true} />)}
                            </div>
                        </div> :
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span>Pal not owned</span>
                            <button onClick={addPal}>Add this pal?</button>
                        </div> :
                    ""
            }
        </div>
    </div>;
}

function ProfilesTab() {
    return <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <ProfilesPanel />
        <div style={{ height: "90%", width: "100%", display: "flex", flexDirection: "row" }}>
            <div style={{ height: "100%", width: "50%" }}>
                <PalsPanel />
            </div>
            <div style={{ height: "100%", width: "50%" }}>
                <PassivesPanel />
            </div>
        </div>
    </div>;
}

export default ProfilesTab;