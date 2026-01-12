import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Title } from "@mantine/core";
import { Handle, Position } from "@xyflow/react";

interface EditableNodeProps {
  id: string;
  data: {
    label: string;
    bgcol: string;
    onEdit: (id: string, name: string) => void;
  };
}

export const EditableNode = ({ id, data }: EditableNodeProps) => {
  return (
    <div
      style={{
        padding: 10,
        border: "2px solid var(--mantine-color-dark-9)",
        borderRadius: 5,
        background: data.bgcol,
        minWidth: 150,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title lineClamp={1} order={4} c="var(--mantine-color-dark-9)">
          {data.label}
        </Title>
        <ActionIcon
          variant="transparent"
          color="var(--mantine-color-dark-9)"
          onClick={() => data.onEdit(id, data.label)}
        >
          <FontAwesomeIcon icon={faPencil} />
        </ActionIcon>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
