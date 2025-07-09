import { useState, useEffect, useCallback } from 'react'
import dagre from '@dagrejs/dagre';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from 'reactflow';

// N'oubliez pas d'importer le CSS de React Flow
import 'reactflow/dist/style.css';
import './App.css'

// --- Logique de mise en page avec Dagre ---

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250; // Largeur de nos nœuds
const nodeHeight = 50; // Hauteur de nos nœuds

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // On décale la position pour que le point d'ancrage (haut-gauche) de React Flow corresponde
        // au centre du nœud calculé par Dagre.
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
};

// Fonction pour transformer les données de l'API en nœuds et arêtes
const transformDataForReactFlow = (employees) => {
    const nodes = employees.map((emp) => ({
        id: emp.id.toString(),
        data: { label: `${emp.name} - ${emp.position}` },
        position: { x: 0, y: 0 }, // Position initiale, sera écrasée par Dagre
    }));

    const edges = employees
        .filter(emp => emp.manager_id !== null) // On ne crée des arêtes que pour ceux qui ont un manager
        .map(emp => ({
            id: `e${emp.manager_id}-${emp.id}`,
            source: emp.manager_id.toString(),
            target: emp.id.toString(),
            type: 'smoothstep', // Un type d'arête plus joli
            animated: true,
        }));

    return { initialNodes: nodes, initialEdges: edges };
};

function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    useEffect(() => {
        // Le proxy Nginx redirige /api vers le backend
        fetch('/api/organization-chart')
            .then(response => {
                if (!response.ok) {
                    throw new Error('La réponse du réseau n\'était pas bonne');
                }
                return response.json();
            })
            .then(apiData => {
                const { initialNodes, initialEdges } = transformDataForReactFlow(apiData, 'TB');
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            })
            .catch(error => {
                console.error("Fetch error:", error);
                setError("Impossible de charger les données de l'organigramme.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [setNodes, setEdges]); // Dépendances du useEffect

    if (loading) return <div>Chargement de l'organigramme...</div>;
    if (error) return <div style={{ color: 'red' }}>Erreur : {error}</div>;

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView // Centre et zoome automatiquement pour tout voir
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    )
}

export default App
