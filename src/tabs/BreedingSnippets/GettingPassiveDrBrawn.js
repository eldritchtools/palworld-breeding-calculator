import SnippetContainer from "./SnippetContainer";

function GettingPassiveDrBrawn() {
    return <SnippetContainer title={"Getting a Passive on a Pal: Dr. Brawn"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "start", textAlign: "start", width: "100%" }}>
            You can find an NPC called Dr. Brawn out in the world sometimes. Talking to him will allow you to run an "experiment" on one of your pals.
            <br/><br/>
            The experiment will randomly succeed or fail. Successes will add IV stats as well as a random positive passive to your pal. If you have a negative passive on your pal, the positive passive can also replace it. Be careful with this method because a negative result will do the opposite and reduce your pal's IV stats and replace a positive passive with a negative one.
            <br/><br/>
            This method is unreliable because of its randomness, but you can capture Dr. Brawn to summon him in your base, and you'll be able to run the experiment once a day for free.
        </div>
    </SnippetContainer>
}

export default GettingPassiveDrBrawn;