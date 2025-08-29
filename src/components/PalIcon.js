import data from '../data/data.json';

const ASSETS_ROOT = `${process.env.PUBLIC_URL}/assets`;

function PalIcon({ id = null, pal = null, circle = false, size = null, scale = null, showName = false, showPalNumber = false, highlighted = false, wrapName = false }) {
    const computedSize = size ? `${size}px` : (scale ? `${512 * scale}px` : "80px");
    const style = { width: computedSize, height: computedSize, borderRadius: circle ? "50%" : "0" };
    if (circle) style["border"] = "1px rgba(255, 255, 255, 0.3) solid";;
    if (highlighted) style["boxShadow"] = "0 0 8px 2px rgba(255, 255, 0, 0.8)";

    if (!id && !pal) {
        return <div style={style} />
    }
    const palData = pal ? pal : data.pals[id];

    const imgComponent = <div style={{ display: "flex", height: computedSize, width: computedSize }}>
        <div style={{ position: "relative", height: computedSize, width: computedSize }}>
            <img src={`${ASSETS_ROOT}/icons/${palData.iconPath}`} alt={palData.name} title={palData.name} style={style} />
            {showPalNumber && palData.no !== "-1" ? <span style={{ fontSize: "1em", color: "#aaa", position: "absolute", top: "0%", left: "0%", fontWeight: "bold" }}>{palData.no}</span> : null}
        </div>
    </div>

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: computedSize }}>
        {imgComponent}
        {showName ? <div style={{ display: "flex", whiteSpace: wrapName ? "wrap" : "nowrap", justifyContent: "center", overflow: "visible" }}>{palData.name}</div> : null}
    </div>
}

export { PalIcon };
