import { useNavigate, useParams } from "react-router-dom";
import api from "../../config/axios";
import type {
  ApiResponse,
  GroupShallowDto,
  UserGetDto,
} from "../../constants/types";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import {
  AspectRatio,
  Avatar,
  Image,
  Title,
  Skeleton,
  Tabs,
  ScrollArea,
  Space,
  SimpleGrid,
  Card,
  Text,
  TextInput,
  Flex,
  HoverCard,
  Anchor,
  ActionIcon,
  Menu,
  Paper,
  Overlay,
} from "@mantine/core";
import { EnvVars } from "../../config/env-vars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faCalendarDays,
  faCamera,
  faDiagramProject,
  faFilter,
  faFish,
  faHashtag,
  faPlus,
  faSatellite,
  faSearch,
  faSeedling,
  faShrimp,
} from "@fortawesome/free-solid-svg-icons";
import { TicketBadge } from "../../components/ticket-badge";
import { routes } from "../../routes/RouteIndex";
import { useUser } from "../../authentication/use-auth";
import { modals } from "@mantine/modals";
import { AvatarOverlay } from "../../components/avatar-overlay";
import { openImageUploadModal } from "../../components/image-upload-modal";
import { useHover } from "@mantine/hooks";

const baseurl = EnvVars.apiBaseUrl;
const sideMargin = "100px";

export const UserPage = () => {
  const { hovered, ref } = useHover();
  const { id } = useParams();
  const [user, setUser] = useState<UserGetDto>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [ascending, setAscending] = useState(true);
  const [isUser, setIsUser] = useState(false);
  const navigate = useNavigate();
  const authedUser = useUser();
  const filteredTickets = useMemo(() => {
    if (!search.trim()) return user?.tickets;
    return user?.tickets.filter((ticket) => {
      search[0] === "#"
        ? search.at(-1) === " "
          ? ticket.ticketnum.toString() ===
            search.substring(1, search.length - 1)
          : ticket.ticketnum.toString().includes(search.toLowerCase())
        : ticket.name.toString().toLowerCase().includes(search.toLowerCase());
    });
  }, [user, search]);
  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return user?.groups;
    return user?.groups.filter((group) => {
      group.name.toLowerCase().includes(groupSearch.toLowerCase());
    });
  }, [user, groupSearch]);
  const authUserGroupIds = authedUser.groups.flatMap((group) => group.id);

  const sortName = () => {
    setUser((user) => {
      if (!user) return undefined;
      const tickets = user.tickets.sort((a, b) => {
        return ascending
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
      return { ...user, tickets: tickets };
    });
  };

  const sortNum = () => {
    setUser((user) => {
      if (!user) return undefined;
      const tickets = user.tickets.sort((a, b) => {
        return ascending
          ? a.ticketnum - b.ticketnum
          : b.ticketnum - a.ticketnum;
      });
      return { ...user, tickets: tickets };
    });
  };

  const sortDuedate = () => {
    setUser((user) => {
      if (!user) return undefined;
      const tickets = user.tickets.sort((a, b) => {
        return ascending
          ? new Date(a.duedate).getTime() - new Date(b.duedate).getTime()
          : new Date(b.duedate).getTime() - new Date(a.duedate).getTime();
      });
      return { ...user, tickets: tickets };
    });
  };

  const sortState = () => {
    setUser((user) => {
      if (!user) return undefined;
      const tickets = user.tickets.sort((a, b) => {
        return ascending
          ? a.state.localeCompare(b.state)
          : b.state.localeCompare(a.state);
      });
      return { ...user, tickets: tickets };
    });
  };

  const sortProject = () => {
    setUser((user) => {
      if (!user) return undefined;
      const tickets = user.tickets.sort((a, b) => {
        return ascending
          ? a.projectname.localeCompare(b.projectname)
          : b.projectname.localeCompare(a.projectname);
      });
      return { ...user, tickets: tickets };
    });
  };

  const reverseTickets = () => {
    if (!user?.tickets) return;
    setUser((user) => {
      user?.tickets.reverse();
      return user;
    });
    setAscending(!ascending);
  };

  const fetchUser = async () => {
    const response = await api.get<ApiResponse<UserGetDto>>(`/users/${id}`);

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error fetching user",
        color: "red",
      });
    }

    if (response.data.data) {
      setUser(response.data.data);
      setIsUser(response.data.data.id === authedUser.id);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  return (
    <div style={{ marginLeft: sideMargin, marginRight: sideMargin }}>
      <Skeleton visible={loading}>
        <AspectRatio ratio={7}>
          <Image
            src={baseurl + user?.banner_path!}
            radius="md"
            ref={ref}
            style={{ cursor: isUser ? "pointer" : "default" }}
            onClick={() => {
              isUser
                ? openImageUploadModal<UserGetDto>({
                    apiurl: `/users/${user?.id}/banner`,
                    onUpload: (updatedUser) => setUser(updatedUser),
                  })
                : {};
            }}
          />
          {isUser && hovered && (
            <Overlay
              style={{
                zIndex: 9,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                pointerEvents: "none",
              }}
            >
              <FontAwesomeIcon icon={faCamera} size="8x" />
            </Overlay>
          )}
          <Avatar
            size="100"
            style={{
              marginLeft: "20px",
              zIndex: 10,
              transform: "translateY(-35px)",
            }}
            color="var(--mantine-color-body)"
            bg="var(--mantine-color-body)"
          >
            <AvatarOverlay
              src={baseurl + user?.pfp_path!}
              size="80"
              overlay={isUser}
              onClick={() => {
                isUser
                  ? openImageUploadModal<UserGetDto>({
                      apiurl: `/users/${user?.id}/pfp`,
                      onUpload: (updatedUser: UserGetDto) =>
                        setUser(updatedUser),
                    })
                  : {};
              }}
            >
              <FontAwesomeIcon icon={faCamera} />
            </AvatarOverlay>
          </Avatar>
        </AspectRatio>
      </Skeleton>
      <Title style={{ transform: "translateY(-35px)", marginLeft: "30px" }}>
        {user?.username}
      </Title>
      <Tabs defaultValue="groups">
        <Tabs.List>
          <Tabs.Tab
            value="groups"
            leftSection={<FontAwesomeIcon icon={faFish} />}
          >
            Groups
          </Tabs.Tab>
          {isUser && (
            <Tabs.Tab
              value="tickets"
              leftSection={<FontAwesomeIcon icon={faShrimp} />}
            >
              Tickets
            </Tabs.Tab>
          )}
        </Tabs.List>
        <Tabs.Panel value="groups">
          <Flex pt="sm" align="center">
            <TextInput
              placeholder="search"
              onChange={(event) => setGroupSearch(event.currentTarget.value)}
              leftSection={<FontAwesomeIcon icon={faSearch} />}
              style={{ flexGrow: 1 }}
            />
            {isUser && (
              <>
                <Space w="sm" />
                <ActionIcon
                  variant="default"
                  h="36px"
                  w="36px"
                  onClick={() => {
                    modals.openContextModal({
                      modal: "creategroup",
                      title: "Create Group",
                      centered: true,
                      innerProps: {
                        onSubmit: (newGroup) => {
                          setUser((user) => {
                            if (!user) return undefined;
                            return {
                              ...user,
                              groups: [
                                ...user.groups,
                                {
                                  ...newGroup,
                                  creatorid: user.id,
                                } as GroupShallowDto,
                              ],
                            };
                          });
                        },
                      },
                    });
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </ActionIcon>
              </>
            )}
          </Flex>
          {filteredGroups?.map((group) => {
            return (
              <>
                <Space h="sm" />{" "}
                <Paper
                  withBorder
                  shadow="sm"
                  p="xl"
                  onClick={() => {
                    authUserGroupIds?.includes(group.id) ||
                    group.creatorid === authedUser.id
                      ? navigate(routes.groupPage.replace(":id", `${group.id}`))
                      : notifications.show({
                          title: "Forbidden",
                          message: "You are not in this group",
                          color: "red",
                        });
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Avatar src={baseurl + group.logo_path} size="lg"></Avatar>
                    <Title style={{ paddingLeft: "20px" }}>{group.name}</Title>
                  </div>
                </Paper>
              </>
            );
          })}
        </Tabs.Panel>
        {isUser && (
          <Tabs.Panel value="tickets">
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
                    <Menu.Item
                      leftSection={<FontAwesomeIcon icon={faDiagramProject} />}
                      onClick={() => sortProject()}
                    >
                      Project
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </ActionIcon.Group>
            </Flex>
            <Space h="lg" />
            <SimpleGrid cols={3} spacing="lg" verticalSpacing="lg">
              {filteredTickets?.map((ticket) => {
                return (
                  <Card
                    withBorder
                    shadow="sm"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(
                        routes.projectPage.replace(":id", `${ticket.projectid}`)
                      )
                    }
                  >
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
                              onClick={() => {}}
                            >
                              {ticket?.name}
                            </Title>
                          </HoverCard.Target>
                          <HoverCard.Dropdown>
                            <Text>{ticket?.name}</Text>
                          </HoverCard.Dropdown>
                        </HoverCard>
                        <Text size="xs">
                          Date Created: {ticket?.created_at}
                        </Text>
                        <Text size="xs">Due Date: {ticket?.duedate}</Text>
                      </Flex>
                    </Card.Section>
                    <Space h="sm" />
                    <ScrollArea overscrollBehavior="contain" h="5em">
                      <Text style={{ whiteSpace: "pre-wrap" }}>
                        {ticket?.description}
                      </Text>
                    </ScrollArea>
                    {ticket?.github_url ? (
                      <Anchor
                        href={ticket?.github_url}
                        size="sm"
                        truncate="end"
                      >
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
                      <Text>
                        {ticket.projectname} #{ticket?.ticketnum}
                      </Text>
                      <TicketBadge state={ticket?.state!} />
                    </Card.Section>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Tabs.Panel>
        )}
      </Tabs>
    </div>
  );
};
