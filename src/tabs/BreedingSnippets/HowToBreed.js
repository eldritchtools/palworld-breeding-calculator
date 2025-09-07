import SnippetContainer from "./SnippetContainer";
import { OtherIcon, OtherIconObjects } from "../../components/OtherIcon";
import { palEquationTextStyle } from "../../styles";
import StaticFlowchart from "./StaticFlowchart";
import { PalIcon } from "@eldritchtools/palworld-shared-library";

const nodeStyle = {
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem"
}

const nodes = [
    // Row 1
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.wheatPlantation} />
        <span style={{ ...palEquationTextStyle, fontWeight: "normal" }}>or</span>
        <OtherIcon object={OtherIconObjects.merchant} />
    </div>,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.wheat} count={15} />
    </div>,
    null,

    // Row 2
    <div style={{ ...nodeStyle, flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
            <PalIcon id={"CowPal"} size={60} circle={true} />
            <span style={palEquationTextStyle}>+</span>
            <OtherIcon object={OtherIconObjects.ranch} />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
            <span style={{ ...palEquationTextStyle, fontWeight: "normal" }}>or</span>
            <OtherIcon object={OtherIconObjects.merchant} />
        </div>
    </div>,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.mill} />
    </div>,
    <div style={{ ...nodeStyle, flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
            <PalIcon id={"ChickenPal"} size={60} circle={true} />
            <span style={palEquationTextStyle}>+</span>
            <OtherIcon object={OtherIconObjects.ranch} />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
            <span style={{ ...palEquationTextStyle, fontWeight: "normal" }}>or</span>
            <OtherIcon object={OtherIconObjects.merchant} />
        </div>
    </div>,

    // Row 3
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.milk} count={7} />
    </div>,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.flour} count={5} />
    </div>,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.egg} count={8} />
    </div>,

    // Row 4
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.berries} count={8} />
    </div>,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.cookingStove} />
        <OtherIcon object={OtherIconObjects.electricKitchen} />
        <OtherIcon object={OtherIconObjects.largeScaleStoneOven} />
    </div>,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.honey} count={2} />
    </div>,

    // Row 5
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.berryPlantation} />
    </div>,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.cake} count={1} />
    </div>,
    <div style={nodeStyle}>
        <PalIcon id={"SoldierBee"} size={60} circle={true} />
        <span style={palEquationTextStyle}>+</span>
        <OtherIcon object={OtherIconObjects.ranch} />
    </div>,

    // Row 6
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.male} />
    </div>,
    null,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.female} />
    </div>,

    // Row 6
    null,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.breedingFarm} />
    </div>,
    <div style={nodeStyle}>
        <OtherIcon object={OtherIconObjects.commonEgg} />
    </div>,
]

// edges by node index (from -> to)
const edges = [
    [0, 1],
    [1, 3],
    [2, 5],
    [3, 6],
    [4, 7],
    [5, 9],
    [6, 9],
    [7, 9],
    [8, 9],
    [10, 9],
    [11, 8],
    [13, 10],
    [9, 12],
    [14, 16],
    [15, 16],
    [12, 16],
    [16, 17]
];

function HowToBreed() {
    return <SnippetContainer title={"How To Breed"}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", height: "fit-content" }}>
            <div>
                <ol>
                    <li>Bake a cake in one of the cooking stations (except campfire). You need the following ingredients:
                        <ul>
                            <li>5x Flour: You need to mill 3 wheat per flour for a total of 15 wheat. You can get wheat from a wheat plantation or a merchant.</li>
                            <li>8x Red Berries: You can get berries from a berry plantation.</li>
                            <li>7x Milk: You can get milk by putting a Mozzarina in a ranch or buying from a merchant.</li>
                            <li>8x Egg: You can get eggs by putting a Chikipi in a ranch or buying from a merchant.</li>
                            <li>2x Honey: You can get honey by putting a Beegarde in a ranch.</li>
                        </ul>
                    </li>
                    <li>Put the cake in the breeding farm chest.</li>
                    <li>Put a male and female pal in the breeding farm.
                        <ul>
                            <li>Pick them up and put them down on the breeding farm (V by default).</li>
                            <li>Assign them to the breeding farm using a monitoring stand.</li>
                        </ul>
                    </li>
                    <li>Do something else for a few minutes.</li>
                    <li>Collect your eggs in the breeding farm.</li>
                </ol>
            </div>
            <StaticFlowchart nodes={nodes} edges={edges} columns={3} width={"610px"} height={"fit-content"} />
        </div>
    </SnippetContainer>
}

export default HowToBreed;