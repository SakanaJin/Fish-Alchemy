import type React from "react";
import {
  type ApiResponse,
  type TicketGetDto,
  TicketState,
  type TicketShallowDto,
  type ColumnType,
} from "../constants/types";
import { useMemo, useState } from "react";
import {
  DndContext,
  type UniqueIdentifier,
  type DragStartEvent,
  type DragEndEvent,
  DragOverlay,
  closestCorners,
  type DragOverEvent,
} from "@dnd-kit/core";
import { TicketDraggable } from "./ticket-draggable";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { ActionIcon, Flex, Menu, SimpleGrid, TextInput } from "@mantine/core";
import api from "../config/axios";
import { notifications } from "@mantine/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faFilter,
  faHashtag,
  faPlus,
  faSearch,
  faSeedling,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { modals } from "@mantine/modals";

interface KanbanBoardProps {
  tickets: TicketShallowDto[];
  projectid: number;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  projectid,
}) => {
  const initialColumns: ColumnType[] = [
    {
      id: "todo",
      title: "To Do",
      state: TicketState.BACKLOG,
      tickets: tickets.filter((ticket) => {
        return ticket.state === TicketState.BACKLOG;
      }),
    },
    {
      id: "inprogress",
      title: "In Progress",
      state: TicketState.INPROGRESS,
      tickets: tickets.filter((ticket) => {
        return ticket.state === TicketState.INPROGRESS;
      }),
    },
    {
      id: "inreview",
      title: "In Review",
      state: TicketState.REVIEW,
      tickets: tickets.filter((ticket) => {
        return ticket.state === TicketState.REVIEW;
      }),
    },
    {
      id: "finished",
      title: "Finished",
      state: TicketState.FINISHED,
      tickets: tickets.filter((ticket) => {
        return ticket.state === TicketState.FINISHED;
      }),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [ascending, setAscending] = useState(true);
  const [search, setSearch] = useState("");
  const filteredColumns = useMemo(() => {
    if (!search.trim()) return columns;

    return columns.map((column) =>
      search[0] === "#"
        ? {
            ...column,
            tickets: column.tickets.filter((ticket) =>
              ticket.ticketnum.toString().includes(search.slice(1))
            ),
          }
        : {
            ...column,
            tickets: column.tickets.filter((ticket) =>
              ticket.name.toLowerCase().includes(search.toLowerCase())
            ),
          }
    );
  }, [columns, search]);

  const addNewTicket = (newTicket: TicketShallowDto) => {
    setColumns((columns) => {
      const next = structuredClone(columns);
      next
        .find((column) => column.state === TicketState.BACKLOG)
        ?.tickets.push(newTicket);
      return next;
    });
  };

  const sortName = () => {
    setColumns((columns) => {
      const next = structuredClone(columns);
      next.forEach((column) => {
        return column.tickets.sort((a, b) => {
          return ascending
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        });
      });
      return next;
    });
  };

  const sortNum = () => {
    setColumns((columns) => {
      const next = structuredClone(columns);
      next.forEach((column) => {
        return column.tickets.sort((a, b) => {
          return ascending
            ? a.ticketnum - b.ticketnum
            : b.ticketnum - a.ticketnum;
        });
      });
      return next;
    });
  };

  const sortUsername = () => {
    setColumns((columns) => {
      const next = structuredClone(columns);
      next.forEach((column) => {
        return column.tickets.sort((a, b) => {
          return ascending
            ? a.user.username.localeCompare(b.user.username)
            : b.user.username.localeCompare(a.user.username);
        });
      });
      return next;
    });
  };

  const reverseColumnArrays = () => {
    setColumns((columns) => {
      const next = structuredClone(columns);
      next.forEach((column) => {
        return column.tickets.reverse();
      })!;
      return next;
    });
    setAscending(!ascending);
  };

  const changeTicketState = async (
    ticket: TicketShallowDto,
    state: TicketState
  ) => {
    const response = await api.patch<ApiResponse<TicketGetDto>>(
      `/api/tickets/${ticket.id}/state`,
      { state: state }
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error changing ticket state",
        color: "red",
      });
      setColumns((columns) => {
        const next = structuredClone(columns);
        const column = next.find((column) => column.state === ticket.state)!;

        const oldIndex = column.tickets.findIndex(
          (tick) => tick.id === ticket.id
        );

        column.tickets = arrayMove(column.tickets, oldIndex, 0);
        return next;
      });
    }

    if (response.data.data) {
      ticket.state = response.data.data.state;
      setColumns((columns) => {
        const next = structuredClone(columns);
        const col = next.find((column) => column.state === state)!;
        const tick = col.tickets.find((t) => t.id === ticket.id)!;
        tick.state = ticket.state;
        return next;
      });
    }
  };

  const findColumnByTicketnum = (ticketnum: UniqueIdentifier) =>
    columns.find((column) =>
      column.tickets.some((ticket) => ticket.ticketnum === ticketnum)
    );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = findColumnByTicketnum(active.id);

    const overColumn = columns.find((column) => column.id === over.id);
    if (activeColumn && overColumn && activeColumn.id !== overColumn.id) {
      setColumns((columns) => {
        const next = structuredClone(columns);
        const from = next.find((column) => column.id === activeColumn.id)!;
        const to = next.find((column) => column.id === overColumn.id)!;
        const ticketIndex = from.tickets.findIndex(
          (ticket) => ticket.ticketnum === active.id
        );
        const [movedTicket] = from.tickets.splice(ticketIndex, 1);
        to.tickets.push(movedTicket);
        return next;
      });
      return;
    }

    const overTicketColumn = findColumnByTicketnum(over.id);

    if (!activeColumn || !overTicketColumn) return;
    if (activeColumn.id === overTicketColumn.id) return;

    setColumns((columns) => {
      const next = structuredClone(columns);

      const from = next.find((column) => column.id === activeColumn.id)!;
      const to = next.find((column) => column.id === overTicketColumn.id)!;

      const ticketIndex = from.tickets.findIndex(
        (ticket) => ticket.ticketnum === active.id
      );
      const [movedTicket] = from.tickets.splice(ticketIndex, 1);

      to.tickets.push(movedTicket);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeColumn = findColumnByTicketnum(active.id);
    if (!activeColumn) {
      setActiveId(null);
      return;
    }

    setColumns((columns) => {
      const next = structuredClone(columns);
      const column = next.find((column) => column.id === activeColumn.id)!;

      const oldIndex = column.tickets.findIndex(
        (ticket) => ticket.ticketnum === active.id
      );
      const newIndex = column.tickets.findIndex(
        (ticket) => ticket.ticketnum === over.id
      );

      column.tickets = arrayMove(column.tickets, oldIndex, newIndex);
      setActiveId(null);
      return next;
    });

    const tick = tickets.find((ticket) => ticket.ticketnum === active.id)!;
    if (activeColumn.state !== tick.state) {
      changeTicketState(tick, activeColumn.state);
    }
  };

  return (
    <Flex direction="column" flex={1}>
      <Flex pt="sm" align="center">
        <TextInput
          placeholder="search"
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
          leftSection={<FontAwesomeIcon icon={faSearch} />}
          style={{ flexGrow: 1 }}
        />
        <ActionIcon.Group pl="sm">
          <ActionIcon
            h="36px"
            w="36px"
            onClick={() => {
              reverseColumnArrays();
            }}
          >
            <FontAwesomeIcon icon={ascending ? faArrowUp : faArrowDown} />
          </ActionIcon>
          <Menu shadow="sm">
            <Menu.Target>
              <ActionIcon h="36px" w="36px">
                <FontAwesomeIcon icon={faFilter} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Sort By</Menu.Label>
              <Menu.Item
                leftSection={<FontAwesomeIcon icon={faSeedling} />}
                onClick={() => sortName()}
              >
                Name
              </Menu.Item>
              <Menu.Item
                leftSection={<FontAwesomeIcon icon={faHashtag} />}
                onClick={() => sortNum()}
              >
                Number
              </Menu.Item>
              <Menu.Item
                leftSection={<FontAwesomeIcon icon={faUser} />}
                onClick={() => sortUsername()}
              >
                User
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <ActionIcon
            h="36px"
            w="36px"
            onClick={() => {
              modals.openContextModal({
                modal: "createticket",
                title: "Create Ticket",
                innerProps: {
                  projectid: projectid,
                  onSubmit: (newTicket) => addNewTicket(newTicket),
                },
              });
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
          </ActionIcon>
        </ActionIcon.Group>
      </Flex>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <SimpleGrid
          cols={4}
          verticalSpacing="100%"
          style={{ marginTop: "10px", flexGrow: 1 }}
        >
          {filteredColumns.map((column) => {
            return (
              <KanbanColumn
                id={column.id}
                key={column.id}
                title={column.title}
                tickets={column.tickets}
              />
            );
          })}
        </SimpleGrid>
        <DragOverlay>
          {activeId ? (
            <TicketDraggable
              key={activeId}
              id={activeId}
              ticket={tickets?.find((ticket) => ticket.ticketnum === activeId)!}
              overlay={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Flex>
  );
};
