import { OtherIcon, OtherIconObjects } from "../../components/OtherIcon";
import SnippetContainer from "./SnippetContainer";

function GettingPassiveSurgery() {
    return <SnippetContainer title={"Getting a Passive on a Pal: Surgery"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "start", textAlign: "start", width: "100%" }}>
            At level 36, you can unlock the Pal Surgery Table where you can implant a passive onto a pal. If you have a Pal Reverser it can also swap the gender of a pal.
            <div style={{marginLeft: "auto", marginRight: "auto"}}><OtherIcon object={OtherIconObjects.palSurgeryTable} /></div>
            Not all passives are available and some are locked behind unlocks like from the Vigilante Bounty Officer and the Arena.
            <br/><br/>
            It costs gold depending on the rank of the passive. 10,000 for rank 1 and -1 and 50,000 for rank 3.
        </div>
    </SnippetContainer>
}

export default GettingPassiveSurgery;