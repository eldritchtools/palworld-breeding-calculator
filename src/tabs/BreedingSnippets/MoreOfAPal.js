import { useEffect, useRef, useState } from "react";
import SnippetContainer from "./SnippetContainer";
import { getChildren } from "../../palLogic/breedingLogic";
import { palEquationTextStyle } from "../../styles";
import { pals, PalIcon, PalSelect } from "@eldritchtools/palworld-shared-library";

function MoreOfAPal() {
    const [selectedPalId, setSelectedPalId] = useState(null);
    const [seedPalList, setSeedPalList] = useState([]);
    const [seedPalId, setSeedPalId] = useState(null);
    const [breedPath, setBreedPath] = useState([]);

    const handleSetPalId = (x) => {
        setSelectedPalId(x);
        setSeedPalId(null);
        if (x) {
            const breedingPower = pals[x].breedingPower;
            setSeedPalList(Object.values(pals).filter((pal) => pal.breedingPower > breedingPower));
            const pal = pals[x];
            if (pal.unique) {
                setBreedPath(pal.parents.map(([a, b]) => [pal, pals[a], pals[b]]));
            } else {
                setBreedPath([]);
            }
        } else {
            setSeedPalList([]);
            setBreedPath([]);
        }
    }

    const handleSetSeedPalId = (x) => {
        setSeedPalId(x);
        if (x) {
            const pal = pals[selectedPalId];
            let currentChild = pals[x];
            const breedPath = [];
            while (true) {
                const result = Object.entries(getChildren(selectedPalId, currentChild.id))[0];
                let newChild = pals[result[0]];
                breedPath.push([newChild, pal, currentChild]);
                if (newChild.id === selectedPalId || newChild.id === currentChild.id) break;
                currentChild = newChild;
            }
            setBreedPath(breedPath);
        } else {
            setBreedPath([]);
        }
    }

    const textRef = useRef(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (textRef.current) {
            setHeight(textRef.current.offsetHeight);
        }

        const handleResize = () => {
            if (textRef.current) {
                setHeight(textRef.current.offsetHeight);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return <SnippetContainer title={"A Way To Get More of a Specific Pal"}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
            <div ref={textRef}>
                If you already have a breeding pair that produces the pal you want, then just keep breeding using them.
                <br /><br />
                Unfortunately, some pals can only be bred using specific pal combinations, but for some of the remaining pals the following process could work once you have at least one copy of that pal.
                <br /><br />
                All pals in the game have a hidden "breeding power" value, with stronger/rarer pals generally having lower breeding power. The child of two parents is based on the average of their breeding power. You can see more details in the <a href="https://palworld.wiki.gg/wiki/Breeding">Palworld wiki</a>.
                <br /><br />
                Because of this, you can breed a pal with another pal of higher breeding power, then repeatedly breed it with the child, and so on. Eventually you'll reach a point where you'll either get more of the original pal or the pal nearest to it in breeding power. These two pals will be tied in terms of how the game chooses the child, and the tie is broken by the order of the pals in the game's files.
                <br /><br />
                You can choose a pal below to see if this method will work with it and which pals have a higher breeding power than the selected pal. Note that, because of how the computation works internally, different starting partners can have different results for the same starting pal (try checking Penking with Foxparks vs Lamball).
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", paddingTop: "0.5rem" }}>
                    <PalSelect value={selectedPalId} onChange={handleSetPalId} />
                    {selectedPalId ?
                        (pals[selectedPalId].unique ?
                            "This pal can only be bred with unique combinations" :
                            [
                                "Higher breeding power pals",
                                <PalSelect value={seedPalId} onChange={handleSetSeedPalId} optionsOverride={seedPalList} />
                            ]) :
                        "No pal selected"}
                </div>
            </div>

            <div style={{ minWidth: "350px", height: height*0.98 || "98%", padding: "5px", border: "1px #aaa solid", borderRadius: "20px", overflowY: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {breedPath.map(([child, p1, p2]) => <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
                        <PalIcon pal={p1} circle={true} showName={true} />
                        <span style={palEquationTextStyle}>+</span>
                        <PalIcon pal={p2} circle={true} showName={true} />
                        <span style={palEquationTextStyle}>=</span>
                        <PalIcon pal={child} circle={true} showName={true} />
                    </div>)}
                </div>
            </div>
        </div>
    </SnippetContainer>
}

export default MoreOfAPal;