import { useNavigate, useParams } from "react-router-dom";
import { EnvVars } from "../../config/env-vars";
import { useEffect, useMemo, useState } from "react";
import type {
  ApiResponse,
  ProjectGetDto,
  TicketShallowDto,
} from "../../constants/types";
import api from "../../config/axios";
import { notifications } from "@mantine/notifications";
import {
  Avatar,
  Title,
  Text,
  HoverCard,
  Card,
  Skeleton,
  ScrollArea,
  Flex,
  Tabs,
  Anchor,
  TextInput,
  ActionIcon,
  Menu,
  Space,
  SimpleGrid,
} from "@mantine/core";
import { routes } from "../../routes/RouteIndex";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faCalendarDays,
  faCamera,
  faFilter,
  faFlask,
  faHashtag,
  faMap,
  faPlus,
  faSatellite,
  faSearch,
  faSeedling,
  faTree,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { KanbanBoard } from "../../components/kanban-board";
import { TicketBadge } from "../../components/ticket-badge";
import { modals } from "@mantine/modals";
import { useUser } from "../../authentication/use-auth";
import { AvatarOverlay } from "../../components/avatar-overlay";
import { openImageUploadModal } from "../../components/image-upload-modal";

const baseurl = EnvVars.apiBaseUrl;
const sideMargin = "100px";

export const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectGetDto>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ascending, setAscending] = useState(true);
  const user = useUser();
  const isLead = useMemo(() => {
    return project ? user.id === project.lead.id : false;
  }, [project]);
  const filteredTickets = useMemo(() => {
    if (!search.trim()) return project?.tickets;

    return project?.tickets.filter((ticket) => {
      search[0] === "#"
        ? search.at(-1) === " "
          ? ticket.ticketnum.toString() ===
            search.substring(1, search.length - 1)
          : ticket.ticketnum.toString().includes(search.toLowerCase())
        : ticket.name.toString().toLowerCase().includes(search.toLowerCase());
    });
  }, [project, search]);

  const addNewTicket = (newTicket: TicketShallowDto) => {
    setProject((project) => {
      if (!project) return undefined;
      project.tickets.push(newTicket);
      return project;
    });
  };

  const updateTicket = (updatedTicket: TicketShallowDto) => {
    setProject((project) => {
      if (!project) return undefined;
      return {
        ...project,
        tickets: project.tickets.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        ),
      };
    });
  };

  const deleteTicket = (toDelete: TicketShallowDto) => {
    setProject((project) => {
      if (!project) return undefined;
      return {
        ...project,
        tickets: project.tickets.filter((ticket) => ticket.id !== toDelete.id),
      };
    });
  };

  const sortName = () => {
    setProject((project) => {
      if (!project) return;
      const tickets = project.tickets.sort((a, b) => {
        return ascending
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
      return { ...project, tickets: tickets };
    });
  };

  const sortNum = () => {
    setProject((project) => {
      if (!project) return;
      const tickets = project.tickets.sort((a, b) => {
        return ascending
          ? a.ticketnum - b.ticketnum
          : b.ticketnum - a.ticketnum;
      });
      return { ...project, tickets: tickets };
    });
  };

  const sortDuedate = () => {
    setProject((project) => {
      if (!project) return undefined;
      const tickets = project.tickets.sort((a, b) => {
        return ascending
          ? new Date(a.duedate).getTime() - new Date(b.duedate).getTime()
          : new Date(b.duedate).getTime() - new Date(a.duedate).getTime();
      });
      return { ...project, tickets: tickets };
    });
  };

  const sortUsername = () => {
    setProject((project) => {
      if (!project) return undefined;
      const tickets = project.tickets.sort((a, b) => {
        return ascending
          ? a.user.username.localeCompare(b.user.username)
          : b.user.username.localeCompare(a.user.username);
      });
      return { ...project, tickets: tickets };
    });
  };

  const sortState = () => {
    setProject((project) => {
      if (!project) return undefined;
      const tickets = project.tickets.sort((a, b) => {
        return ascending
          ? a.state.localeCompare(b.state)
          : b.state.localeCompare(a.state);
      });
      return { ...project, tickets: tickets };
    });
  };

  const reverseTickets = () => {
    setProject((project) => {
      if (!project) return undefined;
      project.tickets.reverse();
      return project;
    });
    setAscending(!ascending);
  };

  const fetchProject = async () => {
    const response = await api.get<ApiResponse<ProjectGetDto>>(
      `/api/projects/${id}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error fetching project.",
        color: "red",
      });
    }

    if (response.data.data) {
      setProject(response.data.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  return (
    <div
      style={{
        marginLeft: sideMargin,
        marginRight: sideMargin,
      }}
    >
      <Skeleton visible={loading}>
        <Flex direction="row" h="12rem">
          <Flex direction="column" miw="15rem">
            <AvatarOverlay
              src={baseurl + project?.logo_path!}
              size="80"
              overlay={isLead}
              onClick={() => {
                isLead
                  ? openImageUploadModal<ProjectGetDto>({
                      apiurl: `/api/projects/${project?.id}/logo`,
                      onUpload: (updatedProject: ProjectGetDto) =>
                        setProject(updatedProject),
                    })
                  : {};
              }}
            >
              <FontAwesomeIcon icon={faCamera} />
            </AvatarOverlay>
            <HoverCard shadow="sm" openDelay={250}>
              <HoverCard.Target>
                {isLead ? (
                  <Title
                    lineClamp={1}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      modals.openContextModal({
                        modal: "updatedeleteproject",
                        title: "Update Project",
                        centered: true,
                        innerProps: {
                          project: project!,
                          onSubmit: (updatedProject) => {
                            setProject(updatedProject);
                          },
                          onDelete: () =>
                            navigate(
                              routes.groupPage.replace(
                                ":id",
                                `${project?.group.id}`
                              )
                            ),
                        },
                      });
                    }}
                  >
                    {project?.name}
                  </Title>
                ) : (
                  <Title lineClamp={1}>{project?.name}</Title>
                )}
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text>{project?.name}</Text>
              </HoverCard.Dropdown>
            </HoverCard>
            <Flex align="center">
              <Text>Project Lead:</Text>
              <HoverCard shadow="sm" openDelay={250}>
                <HoverCard.Target>
                  <Avatar
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                    src={baseurl + project?.lead.pfp_path!}
                    onClick={() =>
                      navigate(
                        routes.user.replace(":id", `${project?.lead.id}`)
                      )
                    }
                    size="md"
                  />
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Text>{project?.lead.username}</Text>
                </HoverCard.Dropdown>
              </HoverCard>
            </Flex>
            <Anchor href={project?.github_url} truncate="end" w="225px">
              {project?.github_url}
            </Anchor>
          </Flex>
          <Card
            style={{ flexGrow: 1, marginLeft: "10px" }}
            withBorder
            className="descriptionBox"
          >
            <ScrollArea offsetScrollbars overscrollBehavior="contain" h="100%">
              <Text style={{ whiteSpace: "pre-wrap" }}>
                {project?.description}
              </Text>
            </ScrollArea>
          </Card>
        </Flex>
      </Skeleton>
      <Tabs
        style={{
          marginTop: "10px",
          height: "100%",
        }}
        defaultValue="kanban"
      >
        <Tabs.List>
          <Tabs.Tab
            value="kanban"
            leftSection={<FontAwesomeIcon icon={faMap} />}
          >
            Kanban
          </Tabs.Tab>
          <Tabs.Tab
            value="list"
            leftSection={<FontAwesomeIcon icon={faFlask} />}
          >
            List
          </Tabs.Tab>
          <Tabs.Tab
            value="graphs"
            leftSection={<FontAwesomeIcon icon={faTree} />}
          >
            Graphs
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel
          value="kanban"
          style={{
            transform: "none",
          }}
        >
          <Flex h="calc(100vh - 350px)">
            {project?.tickets && (
              <KanbanBoard
                tickets={project.tickets}
                projectid={project.id}
                isLead={isLead}
              />
            )}
          </Flex>
        </Tabs.Panel>
        <Tabs.Panel value="list">
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
                variant="default"
                h="36px"
                w="36px"
                onClick={() => {
                  reverseTickets();
                }}
              >
                <FontAwesomeIcon icon={ascending ? faArrowUp : faArrowDown} />
              </ActionIcon>
              <Menu shadow="sm">
                <Menu.Target>
                  <ActionIcon h="36px" w="36px" variant="default">
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
                  <Menu.Item
                    leftSection={<FontAwesomeIcon icon={faCalendarDays} />}
                    onClick={() => sortDuedate()}
                  >
                    Due Date
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<FontAwesomeIcon icon={faSatellite} />}
                    onClick={() => sortState()}
                  >
                    State
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              <ActionIcon
                variant="default"
                h="36px"
                w="36px"
                onClick={() => {
                  modals.openContextModal({
                    modal: "createticket",
                    title: "Create Ticket",
                    centered: true,
                    innerProps: {
                      projectid: project?.id!,
                      onSubmit: (newTicket) => addNewTicket(newTicket),
                    },
                  });
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </ActionIcon>
            </ActionIcon.Group>
          </Flex>
          <Space h="xs" />
          <SimpleGrid cols={3} spacing="lg" verticalSpacing="lg">
            {filteredTickets?.map((ticket) => {
              return (
                <Card withBorder shadow="sm">
                  <Card.Section
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                    p="sm"
                  >
                    <Flex direction="column">
                      <HoverCard shadow="sm" openDelay={250}>
                        <HoverCard.Target>
                          <Title
                            lineClamp={1}
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              modals.openContextModal({
                                modal: "updatedeleteticket",
                                title: "Update Ticket",
                                centered: true,
                                innerProps: {
                                  ticket: ticket,
                                  onDelete: (toDelete: TicketShallowDto) =>
                                    deleteTicket(toDelete),
                                  onSubmit: (updatedTicket: TicketShallowDto) =>
                                    updateTicket(updatedTicket),
                                },
                              })
                            }
                          >
                            {ticket?.name}
                          </Title>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                          <Text>{ticket?.name}</Text>
                        </HoverCard.Dropdown>
                      </HoverCard>
                      <Text size="xs">Date Created: {ticket?.created_at}</Text>
                      <Text size="xs">Due Date: {ticket?.duedate}</Text>
                    </Flex>
                    <HoverCard shadow="sm" openDelay={250}>
                      <HoverCard.Target>
                        <Avatar
                          src={baseurl + ticket?.user.pfp_path!}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate(
                              routes.user.replace(":id", `${ticket?.user.id}`)
                            )
                          }
                        />
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <Text>{ticket?.user.username}</Text>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  </Card.Section>
                  <Space h="sm" />
                  <ScrollArea overscrollBehavior="contain" h="5em">
                    <Text style={{ whiteSpace: "pre-wrap" }}>
                      {ticket?.description}
                    </Text>
                  </ScrollArea>
                  {ticket?.github_url ? (
                    <Anchor href={ticket?.github_url} size="sm" truncate="end">
                      {ticket.github_url}
                    </Anchor>
                  ) : (
                    <Space h="lg" />
                  )}
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
                    <Text>#{ticket?.ticketnum}</Text>
                    <TicketBadge state={ticket?.state!} />
                  </Card.Section>
                </Card>
              );
            })}
          </SimpleGrid>
        </Tabs.Panel>
        <Tabs.Panel value="graphs">
          <ScrollArea offsetScrollbars overscrollBehavior="contain">
            Nothing here yet
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};
