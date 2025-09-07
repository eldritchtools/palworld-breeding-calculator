import SnippetContainer from "./SnippetContainer";
import { PalIcon } from "@eldritchtools/palworld-shared-library";

function GettingPassiveYakumo() {
    return <SnippetContainer title={"Getting a Passive on a Pal: Yakumo"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "start", textAlign: "start", width: "100%" }}>
            If you want to get a passive on a difficult to breed but catchable pal, you can breed that passive onto a Yakumo.
            <div style={{marginLeft: "auto", marginRight: "auto"}}><PalIcon id={"GuardianDog"} circle={true} /></div>
            Yakumo's partner skill increases the chance for passives on itself to appear on pals you encounter.
            <br/><br/>
            The added chance increases as you level the Yakumo in the Pal Essence Condenser. It starts at +15%, then +18%, +21%, +24%, and +30% at max condense.
        </div>
    </SnippetContainer>
}

export default GettingPassiveYakumo;