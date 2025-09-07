import { useMemo, useState } from "react";
import { getParentPairs } from "../palLogic/breedingLogic";
import { sortParentPairs } from "../palLogic/sortLogic";
import { palEquationTextStyle } from "../styles";
import { PalIcon, PalSelect, checkPalSearchMatch } from "@eldritchtools/palworld-shared-library";

function ParentsPanel({ childId, parents }) {
    return <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", border: "1px #666 dotted", padding: "0.2rem" }}>
        <PalIcon pal={parents[0]} circle={true} showName={true} showPalNumber={true} />
        <span style={palEquationTextStyle}>+</span>
        <PalIcon pal={parents[1]} circle={true} showName={true} showPalNumber={true} />
        <span style={palEquationTextStyle}>=</span>
        <PalIcon id={childId} circle={true} showName={true} showPalNumber={true} />
    </div>
}

function ChildCalcTab({ data }) {
    const [childId, setChildId] = useState(null);
    const [searchString, setSearchString] = useState("");

    const handleSetSearchString = (e) => {
        setSearchString(e.target.value);
    }
    
    const parentsList = useMemo(() => getParentPairs(childId), [childId]);
    const filteredParents = useMemo(() => parentsList.filter(parents => {
        if (searchString === "") return true;
        return checkPalSearchMatch(searchString, parents[0]) || checkPalSearchMatch(searchString, parents[1]);
    }), [parentsList, searchString]);

    const filteredParentsOrdered = sortParentPairs(filteredParents);
    const parentsComponents = filteredParentsOrdered.map(parents => <ParentsPanel childId={childId} parents={parents} />);

    return <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", gap: "2em" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "5rem", justifyContent: "center", height: "fit-content" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2rem 20rem", gap: "1rem", alignItems: "center" }}>
                <span>Child</span>
                <PalSelect value={childId} onChange={setChildId} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", height: "100%" }}>
                <label style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
                    {"Search: "}
                    <input onChange={handleSetSearchString} value={searchString} />
                </label>
            </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", width: "100%", height: "1fr", overflowY: "auto" }}>
            {parentsComponents.map(component => <div style={{ flex: "0 1 330px" }}>{component}</div>)}
        </div>

    </div>
}

export default ChildCalcTab;