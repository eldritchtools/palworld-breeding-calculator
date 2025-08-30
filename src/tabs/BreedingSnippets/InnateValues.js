import SnippetContainer from "./SnippetContainer";

function InnateValues() {
    return <SnippetContainer title={"What are IVs?"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "start", textAlign: "start", width: "100%" }}>
            <div>
                IVs are randomized stats that affect how much ATK, DEF, and HP your pal has. Each stat has its own corresponding IV for each pal.
                <br/><br/>
                IVs can be inherited from the child's parents at a 30% chance for each parent. The remaining 40% chance is random.
                <br/><br/>
                You can find more details from the <a href="https://palworld.wiki.gg/wiki/Breeding">Palworld wiki</a>.
            </div>
        </div>
    </SnippetContainer>
}

export default InnateValues;