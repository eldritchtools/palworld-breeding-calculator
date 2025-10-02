function MigrationTab() {
    return <div style={{ height: "95%", width: "80%", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
        <span>
            I'm migrating my tools to a new domain. The old link should have brought you here directly.
            <br /> <br />
            Unfortunately I can't automatically migrate the data from the previous domain due to how it's stored, but I've made the <a href={"https://eldritchtools.github.io/palworld-breeding-calculator-old/"}>old page accessible here</a>.
            <br /> <br />
            You can export your data from there and import it here using the Settings and Profiles tab.
            <br /> <br />
            For now the old version will remain live indefinitely, but it will not receive updates (if any) and may eventually be removed.
        </span>
    </div>;
}

export default MigrationTab;
