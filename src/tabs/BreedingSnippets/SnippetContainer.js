const style = {
    display: "flex",
    flexDirection: "column",
    textAlign: "start",
    gap: "0.5rem",
    border: "1px #aaa solid",
    borderRadius: "15px",
    padding: "1rem",
    width: "100%",
    height: "100%",
    boxSizing: "border-box"
}

function SnippetContainer({ title, children }) {
    return <div style={style}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {title}
        </div>
        <div style={{ display: "flex", width: "98%" }}>
            {children}
        </div>
    </div>
}

export default SnippetContainer;