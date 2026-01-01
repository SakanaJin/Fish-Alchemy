import type React from "react";
import { EnvVars } from "../config/env-vars";
import type { TicketShallowDto } from "../constants/types";
import { useSortable } from "@dnd-kit/sortable";
import { Text, Card, UnstyledButton, Overlay } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrip } from "@fortawesome/free-solid-svg-icons";
import { CSS } from "@dnd-kit/utilities";

interface TicketDraggableProps {
  ticket: TicketShallowDto;
  isDragging: boolean;
}

// interface TicketDraggingProps {
//   ticketname: string;
// }

const baseurl = EnvVars.apiBaseUrl;

export const TicketDraggable: React.FC<TicketDraggableProps> = ({
  ticket,
  isDragging,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id: ticket.ticketnum,
  });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
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
