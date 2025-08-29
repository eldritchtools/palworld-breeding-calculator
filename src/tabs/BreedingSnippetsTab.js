import { useEffect, useState } from "react";
import { getPalsByLayer } from "../palLogic/breedingLogic";
import { checkIdSearchMatch } from "../palLogic/searchLogic";
import { PalIcon } from "../components/PalIcon";
import Dagre from '@dagrejs/dagre';
import {
    ReactFlow,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    useReactFlow,
    useNodesInitialized,
    Handle,
    Position,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import data from '../data/data.json';
import { Tooltip } from "react-tooltip";
import { palEquationTextStyle, tooltipStyle } from "../styles";

function Container({ title, children }) {
    return <div style={{ display: "flex", flexDirection: "column", textAlign: "start", gap: "0.5rem", border: "1px #aaa solid", borderRadius: "15px", padding: "0.5rem" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {title}
        </div>
        <div style={{ display: "flex", width: "98%" }}>
            {children}
        </div>
    </div>
}

function CustomNode({ data }) {
    const { children } = data;

    return <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5px", border: `1px #aaa solid`, borderRadius: "5px" }}>
            {children}
        </div>
        <Handle type="target" position={Position.Left} style={{ visibility: "hidden" }} />
        <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
    </div>
}
const nodeTypes = { "custom": CustomNode };

function FlowChart({ nodeList, edgeList }) {
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(nodeList);
    const [edges, setEdges, onEdgesChange] = useEdgesState(edgeList);
    const nodesInitialized = useNodesInitialized();

    useEffect(() => {
        if (nodesInitialized) {
            // ignore if nodes have not yet been measured
            if (!nodes[0].measured) return;

            const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
            g.setGraph({ rankdir: "LR", ranksep: 100, nodesep: 5 });

            edges.forEach((edge) => g.setEdge(edge.source, edge.target));
            nodes.forEach((node) => {
                g.setNode(node.id, {
                    ...node,
                    width: node.measured?.width ?? 0,
                    height: node.measured?.height ?? 0,
                })
            });

            Dagre.layout(g);

            let layoutedNodes = nodes.map((node) => {
                const position = g.node(node.id);
                // We are shifting the dagre node position (anchor=center center) to the top left
                // so it matches the React Flow node anchor point (top left).
                const x = position.x - (node.measured?.width ?? 0) / 2;
                const y = position.y - (node.measured?.height ?? 0) / 2;

                return { ...node, position: { x, y } };
            });

            setNodes([...layoutedNodes]);
            setEdges([...edges]);
            fitView();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodes, edges, nodesInitialized]);

    return <ReactFlowProvider>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            proOptions={{ hideAttribution: true }}
        />
    </ReactFlowProvider>;
}

function HowToBreed() {
    return <Container>
        
    </Container>
}

function BreedableCalcTab() {

    return <div style={{ height: "100%", width: "100%", display: "flex", flexWrap: "wrap" }}>
        <HowToBreed />
    </div>;
}

export default BreedableCalcTab;