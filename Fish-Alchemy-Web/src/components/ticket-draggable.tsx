import type React from "react";
import { EnvVars } from "../config/env-vars";
import type { TicketShallowDto } from "../constants/types";
import { useSortable } from "@dnd-kit/sortable";
import {
  Text,
  Card,
  UnstyledButton,
  Overlay,
  Title,
  Space,
  Avatar,
  HoverCard,
  ScrollArea,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrip } from "@fortawesome/free-solid-svg-icons";
import { CSS } from "@dnd-kit/utilities";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { TicketBadge } from "./ticket-badge";
import { useNavigate } from "react-router-dom";
import { routes } from "../routes/RouteIndex";

export interface TicketDraggableProps {
  ticket: TicketShallowDto;
  id: UniqueIdentifier;
  overlay: boolean;
}

const baseurl = EnvVars.apiBaseUrl;

export const TicketDraggable: React.FC<TicketDraggableProps> = ({
  ticket,
  id,
  overlay,
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
  const navigate = useNavigate();

  return (
    <Card
      withBorder
      shadow="sm"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        marginTop: "10px",
        cursor: overlay ? "grab" : "auto",
      }}
      {...attributes}
    >
      <Card.Section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        p="sm"
      >
        <HoverCard shadow="sm" openDelay={250}>
          <HoverCard.Target>
            <Title lineClamp={1}>{ticket.name}</Title>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text>{ticket.name}</Text>
          </HoverCard.Dropdown>
        </HoverCard>
        <HoverCard shadow="sm" openDelay={250}>
          <HoverCard.Target>
            <Avatar
              src={baseurl + ticket.user.pfp_path}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(routes.user.replace(":id", `${ticket.user.id}`))
              }
            />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text>{ticket.user.username}</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Card.Section>
      <Space h="sm" />
      <ScrollArea overscrollBehavior="contain" h="5em">
        <Text style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</Text>
      </ScrollArea>
      <Space h="sm" />
      <Card.Section
        withBorder
        py="sm"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginLeft: "5px",
          marginRight: "5px",
        }}
      >
        <Text>#{ticket.ticketnum}</Text>
        <UnstyledButton
          ref={setActivatorNodeRef}
          {...listeners}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: overlay ? "grab" : "pointer",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          w="100px"
          h="50px"
        >
          <FontAwesomeIcon icon={faGrip} />
        </UnstyledButton>
        <TicketBadge state={ticket.state} />
      </Card.Section>
      {isDragging && (
        <Overlay color="var(--mantine-color-body)" backgroundOpacity={0.85} />
      )}
    </Card>
  );
};
