import SnippetContainer from "./SnippetContainer";
import { PalIcon } from "@eldritchtools/palworld-shared-library";

function Braloha() {
    return <SnippetContainer title={"Braloha"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "start", textAlign: "start", width: "100%" }}>
            If you're breeding a lot, you'll want a Braloha in your breeding base.
            <div style={{marginLeft: "auto", marginRight: "auto"}}><PalIcon id={"Plesiosaur"} circle={true} /></div>
            Braloha's partner skill speeds up breeding time if it's in your base.
            <br/><br/>
            The speed up increases as you level the Braloha in the Pal Essence Condenser. It starts at +20%, then +26%, +32%, +38%, and +50% at max condense.
        </div>
    </SnippetContainer>
}

export default Braloha;