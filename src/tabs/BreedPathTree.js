import Dagre from '@dagrejs/dagre';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    useReactFlow,
    useNodesInitialized,
    Handle,
    Position,
    getBezierPath,
    BaseEdge,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { deconstructPalMaskId, getPalMaskId } from '../palLogic/palLogic';
import { PalIcon, PassiveComponent } from '@eldritchtools/palworld-shared-library';

function PalNode({ data: nodeData }) {
    const { pal, passives } = nodeData;
    const borderColor = nodeData && nodeData.color ? nodeData.color : "#aaa";

    return <div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5px", border: `2px ${borderColor} solid`, borderRadius: "5px" }}>
            <PalIcon pal={pal} showName={true} circle={true} />
            {passives.map(passive => <PassiveComponent name={passive} />)}
        </div>
        <Handle className="handle" type="target" position={Position.Bottom} />
        <Handle className="handle" type="source" position={Position.Top} />
    </div>
}

function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
    const curvature = 0.25;
    let [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature });
    const style = { strokeWidth: 3 };

    if (data && data.color) {
        style["stroke"] = data.color;
    } else {
        style["stroke"] = 'grey';
    }

    return (
        <>
            <BaseEdge id={id} path={edgePath} style={style} />
        </>
    );
};

const nodeTypes = { "pal": PalNode };
const edgeTypes = { "custom": CustomEdge };

function FlowChart({ breedCount, nodeList, edgeList, coloredEdges, showPanel }) {
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(nodeList);
    const [edges, setEdges, onEdgesChange] = useEdgesState(edgeList);
    const [firstLayout, setFirstLayout] = useState(true);

    const nodesInitialized = useNodesInitialized();

    const layoutElements = (nodes, edges, handleColoring = false) => {
        const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
        g.setGraph({ rankdir: "BT", ranksep: 100, nodesep: 5 });

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

        if (handleColoring) {
            const palColors = nodes.reduce((acc, node) => { acc[node.id] = null; return acc; }, {});
            const palCount = Object.keys(palColors).length;
            if (palCount > 1) {
                var iwanthue = require('iwanthue');
                const palette = iwanthue(palCount);

                let permutation = Array.from({ length: palCount }, (_, i) => i);

                for (let i = palCount - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
                }

                var index = 0;
                Object.keys(palColors).forEach(key => {
                    palColors[key] = palette[permutation[index]];
                    index += 1;
                })
            } else {
                Object.keys(palColors).forEach(key => {
                    palColors[key] = 'grey';
                })
            }

            const newNodes = layoutedNodes.map((node) => {
                return { ...node, data: { ...node.data, color: palColors[node.id] } }
            });
            const newEdges = edges.map((edge) => {
                return { ...edge, data: { color: palColors[edge.target] } }
            });
            return [newNodes, newEdges];
        } else {
            const newNodes = layoutedNodes.map((node) => {
                return { ...node, data: { ...node.data, color: null } }
            });
            const newEdges = edges.map((edge) => {
                return { ...edge, data: { color: null } }
            });
            return [newNodes, newEdges];
        }
    }

    useEffect(() => {
        const [layoutedNodes, layoutedEdges] = layoutElements(nodeList, edgeList);

        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
        setFirstLayout(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeList, edgeList]);

    useLayoutEffect(() => {
        if (nodesInitialized && firstLayout) {
            // ignore if nodes have not yet been measured
            if (!nodes[0].measured) return;
            const [layoutedNodes, layoutedEdges] = layoutElements(nodes, edges, coloredEdges);
            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
            setFirstLayout(false);
            fitView();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodes, edges, nodesInitialized, firstLayout, coloredEdges]);

    return <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
    >
        {showPanel ?
            <Panel position="top-left" style={{ background: "rgba(0, 0, 0, 0.5)", padding: "5px" }}>Breed count: {breedCount}</Panel> :
            null}
    </ReactFlow>;
}

function BreedPathTree({ breedPath, passives, coloredEdges, showPanel = true }) {
    const [nodes, edges] = useMemo(() => {
        const nodes = {};
        const edges = [];

        const addNode = (pal, mask) => {
            const palMaskId = getPalMaskId(pal, mask, passives);
            if (palMaskId in nodes) return;
            nodes[palMaskId] = ({
                id: `${palMaskId}`,
                type: "pal",
                data: {
                    pal: pal,
                    passives: passives.filter((_, index) => (mask & (1 << index)) !== 0)
                },
                position: { x: 0, y: 0 }
            })
        }

        const addEdge = (source, sourceMask, targetPalMaskId) => {
            const sourcePalMaskId = getPalMaskId(source, sourceMask, passives);
            edges.push({
                id: `${sourcePalMaskId}-${targetPalMaskId}`,
                source: `${sourcePalMaskId}`,
                target: `${targetPalMaskId}`,
                type: "custom",
                animated: true,
                selectable: false
            })
        }

        Object.entries(breedPath).forEach(([childPalMaskId, [[p1, p1Mask], [p2, p2Mask]]]) => {
            const [child, childMask] = deconstructPalMaskId(childPalMaskId, passives);

            addNode(child, childMask);
            addNode(p1, p1Mask);
            addNode(p2, p2Mask);

            addEdge(p1, p1Mask, childPalMaskId);
            addEdge(p2, p2Mask, childPalMaskId);
        });

        return [nodes, edges]
    }, [breedPath, passives]);

    return <ReactFlowProvider>
        <FlowChart breedCount={Object.keys(breedPath).length} nodeList={Object.values(nodes)} edgeList={edges} coloredEdges={coloredEdges} showPanel={showPanel} />
    </ReactFlowProvider>
}

export default BreedPathTree;
