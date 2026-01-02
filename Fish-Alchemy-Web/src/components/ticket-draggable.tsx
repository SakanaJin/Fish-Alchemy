import type React from "react";
import { EnvVars } from "../config/env-vars";
import type { TicketShallowDto } from "../constants/types";
import { useSortable } from "@dnd-kit/sortable";
import { Text, Card, UnstyledButton, Overlay } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrip } from "@fortawesome/free-solid-svg-icons";
import { CSS } from "@dnd-kit/utilities";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface TicketDraggableProps {
  ticket: TicketShallowDto;
  id: UniqueIdentifier;
}

// interface TicketDraggingProps {
//   ticketname: string;
// }

const baseurl = EnvVars.apiBaseUrl;

export const TicketDraggable: React.FC<TicketDraggableProps> = ({
  ticket,
  id,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
  });

  return (
    <Card
      withBorder
      shadow="sm"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        marginTop: "10px",
      }}
      {...attributes}
    >
      <Text>{ticket.name}</Text>
      <UnstyledButton ref={setActivatorNodeRef} {...listeners}>
        <FontAwesomeIcon icon={faGrip} />
      </UnstyledButton>
      {isDragging && (
        <Overlay color="var(--mantine-color-body)" backgroundOpacity={0.85} />
      )}
    </Card>
  );
};

// export const TicketDragging: React.FC<TicketDraggingProps> = ({
//   ticketname,
// }) => {
//   return (
//     <Card>
//       <Text>{ticketname}</Text>
//       <UnstyledButton>
//         <FontAwesomeIcon icon={faGrip} />
//       </UnstyledButton>
//     </Card>
//   );
// };
