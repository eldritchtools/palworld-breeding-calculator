import React, { useRef, useEffect, useState } from "react";

// Node styling
const nodeStyle = {
    background: "transparent",
    padding: "5px",
    border: "1px #aaa solid",
    borderRadius: "5px"
};

function getIntersection(x1, y1, x2, y2, width, height) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const w = width / 2;
    const h = height / 2;

    if (Math.abs(dy) * w > Math.abs(dx) * h) {
        // hit top or bottom edge
        if (dy > 0) {
            return { x: x1 + (h * dx) / dy, y: y1 + h }; // bottom
        } else {
            return { x: x1 - (h * dx) / dy, y: y1 - h }; // top
        }
    } else {
        // hit left or right edge
        if (dx > 0) {
            return { x: x1 + w, y: y1 + (w * dy) / dx }; // right
        } else {
            return { x: x1 - w, y: y1 - (w * dy) / dx }; // left
        }
    }
}

// Compute arrow endpoints at edges of nodes
function getConnectionPoints(aRect, bRect, containerRect) {
    const aCenter = {
        x: aRect.left - containerRect.left + aRect.width / 2,
        y: aRect.top - containerRect.top + aRect.height / 2,
    };
    const bCenter = {
        x: bRect.left - containerRect.left + bRect.width / 2,
        y: bRect.top - containerRect.top + bRect.height / 2,
    };

    const start = getIntersection(
        aCenter.x,
        aCenter.y,
        bCenter.x,
        bCenter.y,
        aRect.width,
        aRect.height
    );
    const end = getIntersection(
        bCenter.x,
        bCenter.y,
        aCenter.x,
        aCenter.y,
        bRect.width,
        bRect.height
    );

    return { start, end };
}

function StaticFlowchart({ nodes, edges, rows = null, columns = null, width = null, height = null }) {
    const containerRef = useRef(null);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const updatePositions = () => {
            const containerRect = containerRef.current.getBoundingClientRect();
            const nodeElems = Array.from(
                containerRef.current.querySelectorAll(".node")
            );
            const nodeRects = nodeElems.map((el) => el.getBoundingClientRect());

            const edgePositions = edges.map(([aIdx, bIdx]) => {
                return getConnectionPoints(
                    nodeRects[aIdx],
                    nodeRects[bIdx],
                    containerRect
                );
            });

            setPositions(edgePositions);
        };

        updatePositions();
        window.addEventListener("resize", updatePositions);
        const resizeObserver = new ResizeObserver(updatePositions);
        resizeObserver.observe(containerRef.current);

        return () => {
            window.removeEventListener("resize", updatePositions);
            resizeObserver.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const gridStyle = {
        position: "relative",
        display: "grid",
        gap: "1rem"
    }

    if (width) {
        gridStyle["minWidth"] = width;
        gridStyle["maxWidth"] = width;
    } else {
        gridStyle["width"] = "100%";
    }

    if (height) {
        gridStyle["minHeight"] = height;
        gridStyle["maxHeight"] = height;
    } else {
        gridStyle["height"] = "100%";
    }

    if (rows) gridStyle.gridTemplateRows = `repeat(${rows}, 1fr)`;
    if (columns) gridStyle.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    return (
        <div ref={containerRef} style={gridStyle}>
            {nodes.map(node => <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {node ? <div className="node" style={nodeStyle}>{node}</div> : null}
            </div>)}

            {/* Arrows */}
            <svg
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                }}
            >
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="5"
                        markerHeight="5"
                        refX="5"
                        refY="2.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 5 2.5, 0 5" fill="#aaa" />
                    </marker>
                </defs>

                {positions.map((pos, i) => (
                    <line
                        key={i}
                        x1={pos.start.x}
                        y1={pos.start.y}
                        x2={pos.end.x}
                        y2={pos.end.y}
                        stroke="#aaa"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                    />
                ))}
            </svg>
        </div>
    );
}

export default StaticFlowchart;