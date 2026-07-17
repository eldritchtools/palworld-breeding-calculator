import Braloha from "./BreedingSnippets/Braloha";
import DimensionalPalStorage from "./BreedingSnippets/DimensionalPalStorage";
import Gender from "./BreedingSnippets/Gender";
import GettingPassiveBreed from "./BreedingSnippets/GettingPassiveBreed";
import GettingPassiveDrBrawn from "./BreedingSnippets/GettingPassiveDrBrawn";
import GettingPassiveSurgery from "./BreedingSnippets/GettingPassiveSurgery";
import GettingPassiveYakumo from "./BreedingSnippets/GettingPassiveYakumo";
import HowToBreed from "./BreedingSnippets/HowToBreed";
import InnateValues from "./BreedingSnippets/InnateValues";
import MoreOfAPal from "./BreedingSnippets/MoreOfAPal";

function BreedableCalcTab() {
    return <div style={{ height: "100%", width: "100%", overflowY: "auto" }}>
        <span style={{ fontWeight: "bold" }}>Warning: This page has largely not been updated for 1.0. Any relevant mechanics that are new or changed will not be here.</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(800px, 1fr)", gap: "0.5rem" }}>
            <div><HowToBreed /></div>
            <div><GettingPassiveBreed /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(400px, 1fr)", gap: "0.5rem" }}>
                <div><GettingPassiveSurgery /></div>
                <div><GettingPassiveYakumo /></div>
            </div>
            <div style={{ gridRow: "span 2" }}><MoreOfAPal /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(400px, 1fr)", gap: "0.5rem" }}>
                <div><GettingPassiveDrBrawn /></div>
                <div><InnateValues /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(400px, 1fr)", gap: "0.5rem" }}>
                <div><Braloha /></div>
                <div><DimensionalPalStorage /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(400px, 1fr)", gap: "0.5rem" }}>
                <div><Gender /></div>
            </div>
        </div>
    </div>;
}

export default BreedableCalcTab;