import { useMemo, useState } from "react";
import { getChildren } from "../palLogic/breedingLogic";
import { Tooltip } from "react-tooltip";
import { palEquationTextStyle, tooltipStyle } from "../styles";
import { PalIcon, PalSelect, checkIdSearchMatch, checkPalSearchMatch, sortPalIds } from "@eldritchtools/palworld-shared-library";

function ExpandedChildPanel({ childId, parents }) {
    return <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", border: "1px #666 dotted", padding: "0.2rem" }}>
        <PalIcon id={childId} circle={true} showName={true} showPalNumber={true} />
        <span style={palEquationTextStyle}>=</span>
        <PalIcon pal={parents[0]} circle={true} showName={true} showPalNumber={true} />
        <span style={palEquationTextStyle}>+</span>
        <PalIcon pal={parents[1]} circle={true} showName={true} showPalNumber={true} />
    </div>
}

function CollapsedChildPanel({ childId, parentsList }) {
    return <div data-tooltip-id={childId} >
        <PalIcon id={childId} circle={true} showName={true} showPalNumber={true} />
        <Tooltip id={childId} style={tooltipStyle}>
            <div>
                <div style={{ display: "flex", flexDirection: "column", width: "fit-content", gap: "0.2rem" }} >
                    {parentsList.map(parents => <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.2rem" }}>
                        <PalIcon pal={parents[0]} circle={true} showName={true} showPalNumber={true} />
                        <span style={palEquationTextStyle}>+</span>
                        <PalIcon pal={parents[1]} circle={true} showName={true} showPalNumber={true} />
                    </div>)}
                </div>
            </div>
        </Tooltip>
    </div>
}

function ParentCalcTab() {
    const [parents, setParents] = useState([null, null]);
    const [collapseSameChild, setCollapseSameChild] = useState(true);
    const [searchString, setSearchString] = useState("");

    const setParent = (parent, num) => {
        if (num === 0) setParents(parents => [parent, parents[1]]);
        else setParents(parents => [parents[0], parent]);
    }

    const handleCollapseSameChildToggle = () => {
        setCollapseSameChild(v => !v);
    }

    const handleSetSearchString = (e) => {
        setSearchString(e.target.value);
    }

    const children = useMemo(() => getChildren(parents[0], parents[1]), [parents]);
    const filteredChildren = useMemo(() => Object.entries(children).reduce((acc, [childId, parentsList]) => {
        if (searchString === "") {
            acc[childId] = parentsList;
        } else {
            if (checkIdSearchMatch(searchString, childId)) {
                acc[childId] = parentsList;
            } else if (!collapseSameChild) {
                const filteredList = parentsList.filter(parents => checkPalSearchMatch(searchString, parents[0]) || checkPalSearchMatch(searchString, parents[1]));
                if (filteredList.length > 0) acc[childId] = filteredList;
            }
        }
        return acc;
    }, {}), [children, collapseSameChild, searchString]);

    const childrenComponents = [];
    const filteredChildrenOrdered = sortPalIds(Object.keys(filteredChildren));
    if (collapseSameChild) {
        filteredChildrenOrdered.forEach(childId => childrenComponents.push(<CollapsedChildPanel childId={childId} parentsList={filteredChildren[childId]} />));
    } else {
        filteredChildrenOrdered.forEach(childId => {
            filteredChildren[childId].forEach(parents => childrenComponents.push(<ExpandedChildPanel childId={childId} parents={parents} />))
        })
    }

    return <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", gap: "2em" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "5rem", justifyContent: "center", height: "fit-content" }}>
            <div style={{ display: "grid", gridTemplateColumns: "4rem 20rem", gap: "1rem", alignItems: "center" }}>
                <span>Parent 1</span>
                <PalSelect value={parents[0]} onChange={(value) => setParent(value, 0)} />
                <span>Parent 2</span>
                <PalSelect value={parents[1]} onChange={(value) => setParent(value, 1)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", height: "100%" }}>
                <label style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
                    {"Search: "}
                    <input onChange={handleSetSearchString} value={searchString} />
                </label>
                <label style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
                    <input type="checkbox" onChange={handleCollapseSameChildToggle} checked={collapseSameChild} />
                    Collapse entries with the same child?
                </label>
            </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", width: "100%", height: "1fr", overflowY: "auto" }}>
            {collapseSameChild ?
                childrenComponents.map(component => <div style={{ flex: "0 1 100px" }}>{component}</div>) :
                childrenComponents.map(component => <div style={{ flex: "0 1 330px" }}>{component}</div>)
            }
        </div>

    </div>
}

export default ParentCalcTab;