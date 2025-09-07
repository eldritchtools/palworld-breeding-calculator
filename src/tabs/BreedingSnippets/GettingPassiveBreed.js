import SnippetContainer from "./SnippetContainer";
import StaticFlowchart from "./StaticFlowchart";
import { PalIcon, PassiveComponent } from "@eldritchtools/palworld-shared-library";

const nodeStyle = {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.2rem"
}

const nodes = [
    // Row 1
    <div style={nodeStyle}>
        <PalIcon id={"SheepBall"} circle={true} />
        <PassiveComponent name={"Passive 1"} rank={1} />
        <PassiveComponent name={"Passive 2"} rank={2} />
        <PassiveComponent name={"Passive 3"} rank={4} />
    </div>,
    null,
    <div style={nodeStyle}>
        <PalIcon id={"SheepBall"} circle={true} />
        <PassiveComponent name={"Passive 1"} rank={1} />
        <PassiveComponent name={"Passive 2"} rank={2} />
        <PassiveComponent name={"Passive 4"} rank={-1} />
        <PassiveComponent name={"Passive 5"} rank={-1} />
    </div>,

    // Row 2
    <div style={nodeStyle}>
        <PalIcon id={"SheepBall"} circle={true} />
        <PassiveComponent name={"Passive 1"} rank={1} />
        <PassiveComponent name={"Passive 3"} rank={4} />
        <PassiveComponent name={"Passive 4"} rank={-1} />
        <PassiveComponent name={"Passive 6"} rank={1} />
    </div>,
    <div style={nodeStyle}>
        <PassiveComponent name={"Passive 1"} rank={1} />
        <PassiveComponent name={"Passive 2"} rank={2} />
        <PassiveComponent name={"Passive 3"} rank={4} />
        <PassiveComponent name={"Passive 4"} rank={-1} />
        <PassiveComponent name={"Passive 5"} rank={-1} />
    </div>,
    <div style={nodeStyle}>
        <PalIcon id={"SheepBall"} circle={true} />
        <PassiveComponent name={"Passive 1"} rank={1} />
        <PassiveComponent name={"Passive 3"} rank={4} />
        <PassiveComponent name={"Passive 4"} rank={-1} />
        <PassiveComponent name={"Passive 5"} rank={-1} />
    </div>,

    // Row 3
    <div style={nodeStyle}>
        <PalIcon id={"SheepBall"} circle={true} />
        <PassiveComponent name={"Passive 2"} rank={2} />
        <PassiveComponent name={"Passive 3"} rank={4} />
    </div>,
    <div style={nodeStyle}>
        <PalIcon id={"SheepBall"} circle={true} />
        <PassiveComponent name={"Passive 3"} rank={4} />
        <PassiveComponent name={"Passive 5"} rank={-1} />
        <PassiveComponent name={"Passive 7"} rank={3} />
    </div>,
    <div style={nodeStyle}>
        <PalIcon id={"SheepBall"} circle={true} />
        <PassiveComponent name={"Passive 1"} rank={1} />
    </div>
]

// edges by node index (from -> to)
const edges = [
    [0, 3],
    [1, 3],
    [3, 2],
    [3, 4],
    [3, 5],
    [3, 6],
    [3, 7]
];

function GettingPassiveBreed() {
    return <SnippetContainer title={"Getting a Passive on a Pal: Breeding"}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
            <div>
                If you breed a pal, it can inherit passive skills from its parents.
                <br/><br/>
                Passives are inherited using the process below:
                <ul>
                    <li>The game will combine the passive list of both parents (removing duplicates).</li>
                    <li>It then randomly decides how many and which of those passives will be inherited (smaller chances for more passives inherited).</li>
                    <li>After that it adds random passives at a randomized chance.</li>
                </ul>
                Because of this, it is always better to use parents that only have the passives you want. This is to prevent any extra passives from taking the slots that would have gone to passives you actually want. Pals with 0 passives are also useful in certain situations, so you might want to keep or even purposely breed some of them.
                <br/><br/>
                Exact numbers and probabilities can be found in the <a href="https://palworld.wiki.gg/wiki/Breeding">Palworld wiki</a>.
            </div>
            <StaticFlowchart nodes={nodes} edges={edges} columns={3} width={"500px"} height={"fit-content"} />
        </div>
    </SnippetContainer>
}

export default GettingPassiveBreed;