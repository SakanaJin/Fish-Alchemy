import {
  Card,
  Text,
  Title,
  Paper,
  ScrollArea,
  useMantineColorScheme,
} from "@mantine/core";
import type React from "react";
import type { TicketShallowDto } from "../constants/types";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TicketDraggable } from "./ticket-draggable";
import { useDroppable } from "@dnd-kit/core";

interface KanbanColumnProps {
  id: string;
  title: string;
  tickets: TicketShallowDto[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tickets,
}) => {
  const { setNodeRef } = useDroppable({ id: id });
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  return (
    <Card withBorder shadow="sm" style={{ height: "100%" }}>
      <Title style={{ marginBottom: "5px" }}>{title}</Title>
      <Paper
        p="xs"
        pt="0"
        radius="md"
        withBorder
        shadow="xs"
        mih="100px"
        ref={setNodeRef}
        style={{ height: "100%" }}
        bg={dark ? "var(--mantine-color-body)" : "var(--mantine-color-gray-1)"}
      >
        <ScrollArea overscrollBehavior="contain" h="calc(100vh - 475px)">
          {/* <ScrollArea overscrollBehavior="contain" h="100%"> */}
          <SortableContext
            items={tickets.map((ticket) => ticket.id)}
            strategy={verticalListSortingStrategy}
          >
            {tickets.map((ticket) => {
              return (
                <TicketDraggable
                  key={ticket.ticketnum}
                  id={ticket.ticketnum}
                  ticket={ticket}
                  overlay={false}
                />
              );
            })}
          </SortableContext>
        </ScrollArea>
      </Paper>
    </Card>
  );
};
