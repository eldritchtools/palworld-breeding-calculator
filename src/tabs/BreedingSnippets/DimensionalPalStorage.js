import { OtherIcon, OtherIconObjects } from "../../components/OtherIcon";
import SnippetContainer from "./SnippetContainer";

function DimensionalPalStorage() {
    return <SnippetContainer title={"Out of Space in the Palbox?"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "start", textAlign: "start", width: "100%" }}>
            If you're breeding a LOT and you're running out of space for your pals, consider using the Dimensional Pal Storage for additional space.
            <div style={{marginLeft: "auto", marginRight: "auto"}}><OtherIcon object={OtherIconObjects.dimensionalPalStorage} /></div>
            It gives you an additional 10 times the space you'd normally have in your regular palbox.
        </div>
    </SnippetContainer>
}

export default DimensionalPalStorage;