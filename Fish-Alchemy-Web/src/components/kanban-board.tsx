import type React from "react";
import { EnvVars } from "../config/env-vars";
import type { TicketShallowDto } from "../constants/types";
import { useState } from "react";
import {
  DndContext,
  type UniqueIdentifier,
  type DragStartEvent,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { TicketDraggable } from "./ticket-draggable";

interface KanbanBoardProps {
  tickets?: TicketShallowDto[];
}

const baseurl = EnvVars.apiBaseUrl;

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tickets }) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (_: DragEndEvent) => {
    setActiveId(null);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {tickets?.map((ticket) => {
        return (
          <TicketDraggable
            key={ticket.ticketnum}
            ticket={ticket}
            isDragging={activeId === ticket.ticketnum}
          />
        );
      })}
      <DragOverlay>
        {activeId ? (
          <TicketDraggable
            key={activeId}
            ticket={tickets?.find((ticket) => ticket.ticketnum === activeId)!}
            isDragging={false}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
