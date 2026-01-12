import { useNavigate, useParams } from "react-router-dom";
import api from "../../config/axios";
import {
  type NodeGetDto,
  type ApiResponse,
  type GraphGetDto,
} from "../../constants/types";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  ScrollArea,
  Space,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import dagre from "dagre";
import {
  ReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  applyNodeChanges,
  type OnEdgesChange,
  applyEdgeChanges,
  type OnConnect,
  addEdge,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { EditableNode } from "../../components/editable-node";
import { modals } from "@mantine/modals";
import { routes } from "../../routes/RouteIndex";

const sideMargin = "100px";
const nodetypes = {
  editable: EditableNode,
};
const nodebg = "var(--mantine-color-teal-6)";

export const GraphPage = () => {
  const { id } = useParams();
  const { colorScheme } = useMantineColorScheme();
  const [graph, setGraph] = useState<GraphGetDto>();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const navigate = useNavigate();
  const dark = colorScheme === "dark";

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      changes.forEach((change) => {
        if (change.type === "remove") {
          removeNode(change.id);
        }
      });
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        changes.forEach((change) => {
          if (change.type === "remove") {
            const edgeToDelete = eds.find((e) => e.id === change.id);
            if (edgeToDelete) removeEdge(edgeToDelete);
          }
        });
        return applyEdgeChanges(changes, eds);
      });
    },
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      Edging(connection.source, connection.target);
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const openNodeEditModal = (id: string, name: string) => {
    modals.openContextModal({
      modal: "editnode",
      title: "Edit Node",
      centered: true,
      innerProps: {
        id: id,
        name: name,
        onSubmit: (updatedNode) => updateNode(updatedNode),
      },
    });
  };

  const addNewNode = (newNode: NodeGetDto) => {
    setNodes((nodes) => [
      ...nodes,
      {
        id: newNode.id.toString(),
        type: "editable",
        data: {
          label: newNode.name,
          bgcol: nodebg,
          onEdit: (id: string, name: string) => openNodeEditModal(id, name),
        },
        position: { x: 100, y: 50 },
      },
    ]);
  };

  const updateNode = (updatedNode: NodeGetDto) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === updatedNode.id.toString()
          ? {
              id: updatedNode.id.toString(),
              type: "editable",
              data: {
                label: updatedNode.name,
                bgcol: nodebg,
                onEdit: (id: string, name: string) =>
                  openNodeEditModal(id, name),
              },
              position: { x: node.position.x, y: node.position.y },
            }
          : node
      )
    );
  };

  const removeNode = async (id: string) => {
    const response = await api.delete<ApiResponse<boolean>>(`/api/nodes/${id}`);

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error deleting node",
        color: "red",
      });
    }
  };

  const Edging = async (dependencyid: string, dependentid: string) => {
    const response = await api.post<ApiResponse<boolean>>(
      `/api/nodes/dependent/${dependentid}/dependency/${dependencyid}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error edging",
        color: "red",
      });
    }
  };

  const removeEdge = async (edge: Edge) => {
    const response = await api.delete<ApiResponse<boolean>>(
      `/api/nodes/dependent/${edge.target}/dependency/${edge.source}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error removing edge",
        color: "red",
      });
    }
  };

  const fetchGraph = async () => {
    const response = await api.get<ApiResponse<GraphGetDto>>(
      `/api/graphs/${id}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error fetching graph",
        color: "red",
      });
    }

    if (response.data.data) {
      setGraph(response.data.data);
    }
  };

  const fetchNodes = async () => {
    const response = await api.get<ApiResponse<NodeGetDto[]>>(
      `/api/nodes/graph/${id}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error fetching nodes",
        color: "red",
      });
    }

    if (response.data.data) {
      const nodes = response.data.data.map((node, index) => ({
        id: node.id.toString(),
        type: "editable",
        data: {
          label: node.name,
          bgcol: nodebg,
          onEdit: (id: string, name: string) => openNodeEditModal(id, name),
        },
        position: { x: 100 * index, y: 50 * index },
      }));
      const edges = response.data.data.flatMap((node) =>
        node.dependencies.map((dependency) => ({
          id: `${dependency.id}-${node.id}`,
          source: dependency.id.toString(),
          target: node.id.toString(),
        }))
      );
      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: "TB" });
      g.setDefaultEdgeLabel(() => ({}));
      nodes.forEach((n) => g.setNode(n.id, { width: 172, height: 36 }));
      edges.forEach((e) => g.setEdge(e.source, e.target));
      dagre.layout(g);
      nodes.forEach((n) => {
        const nodeWithPos = g.node(n.id);
        n.position = { x: nodeWithPos.x, y: nodeWithPos.y };
      });
      setNodes(nodes);
      setEdges(edges);
    }
  };

  useEffect(() => {
    fetchGraph();
    fetchNodes();
  }, [id]);

  return (
    <div style={{ marginLeft: sideMargin, marginRight: sideMargin }}>
      <Title
        style={{ cursor: "pointer" }}
        onClick={() => {
          modals.openContextModal({
            modal: "updategraph",
            title: "Edit Graph",
            centered: true,
            innerProps: {
              graph: graph!,
              onDelete: () =>
                navigate(
                  routes.projectPage.replace(":id", `${graph?.project.id}`)
                ),
              onSubmit: (updatedGraph) => setGraph(updatedGraph),
            },
          });
        }}
      >
        {graph?.name}
      </Title>
      <Card
        h="100px"
        withBorder
        className="descriptionBox"
        bg={
          dark ? "var(--mantine-color-default)" : "var(--mantine-color-gray-1)"
        }
      >
        <ScrollArea offsetScrollbars overscrollBehavior="contain" h="100%">
          <Text style={{ whiteSpace: "pre-wrap" }}>{graph?.description}</Text>
        </ScrollArea>
      </Card>
      <Space h="lg" />
      <Card
        h="calc(100vh - 300px)"
        bg={
          dark ? "var(--mantine-color-default)" : "var(--mantine-color-gray-1)"
        }
        withBorder
      >
        <ReactFlow
          fitView
          nodes={nodes}
          edges={edges}
          nodeTypes={nodetypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          style={{
            background: dark
              ? "var(--mantine-color-default)"
              : "var(--mantine-color-gray-1)",
          }}
          deleteKeyCode="Delete"
        >
          <Background />
        </ReactFlow>
      </Card>
      <Button
        onClick={() => {
          modals.openContextModal({
            modal: "createnode",
            title: "Create Node",
            centered: true,
            innerProps: {
              graphid: graph?.id!,
              onSubmit: (newNode) => addNewNode(newNode),
            },
          });
        }}
      >
        New Node
      </Button>
    </div>
  );
};
