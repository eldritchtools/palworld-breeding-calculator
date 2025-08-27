import data from '../data/data.json';

const ASSETS_ROOT = `${process.env.PUBLIC_URL}/assets`;

const rankColors = {
    4: "#0DFF9E",
    3: "#FFFF00",
    2: "#FFFF00",
    1: "#FFFFFF",
    [-1]: "#FF0000",
    [-2]: "#FF0000",
    [-3]: "#FF0000"
};

const ranks = data.passives.reduce((acc, {name, rank}) => {acc[name] = rank; return acc}, {});

function PassiveComponent({ name, rank=null, addBorder=false }) {
    rank = rank ?? ranks[name];
    const style = { display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "0.2rem" };
    if (addBorder) style.border = `1px ${rankColors[rank]} solid`;
    return <div style={style}>
        <div style={{ textAlign: "start", color: rankColors[rank] }}>{name}</div>
        <div
            style={{
                width: "24px",
                height: "24px",
                backgroundColor: rankColors[rank],
                WebkitMask: `url(${ASSETS_ROOT}/passive_ranks/${Math.abs(rank)}.png) no-repeat center / contain`,
                mask: `url(${ASSETS_ROOT}/passive_ranks/${Math.abs(rank)}.png) no-repeat center / contain`,
                transform: `rotate(${rank < 0 ? 180 : 0}deg)`
            }}
        />
    </div>
}

export default PassiveComponent;