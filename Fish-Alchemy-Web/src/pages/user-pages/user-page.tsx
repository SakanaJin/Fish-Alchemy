import { useNavigate, useParams } from "react-router-dom";
import api from "../../config/axios";
import type {
  GroupShallowDto,
  ApiResponse,
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
} from "@mantine/core";
import { EnvVars } from "../../config/env-vars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faCalendarDays,
  faDiagramProject,
  faFilter,
  faFish,
  faHashtag,
  faSatellite,
  faSearch,
  faSeedling,
  faShrimp,
} from "@fortawesome/free-solid-svg-icons";
import { GroupCard } from "../../components/group-card";
import { TicketBadge } from "../../components/ticket-badge";
import { routes } from "../../routes/RouteIndex";

const baseurl = EnvVars.apiBaseUrl;
const sideMargin = "100px";

export const UserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState<UserGetDto>();
  const [loading, setLoading] = useState(true);
  const [groupsFiltered, setGroupsFiltered] = useState<GroupShallowDto[]>();
  const [search, setSearch] = useState("");
  const [ascending, setAscending] = useState(true);
  const navigate = useNavigate();
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

  const handleGroupsChange = (search: string) => {
    setGroupsFiltered(
      user?.groups.filter((group) => {
        return group.name.toLowerCase().includes(search.toLowerCase());
      })
    );
  };

  const fetchUser = async () => {
    const response = await api.get<ApiResponse<UserGetDto>>(`/api/users/${id}`);

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error fetching user",
        color: "red",
      });
    }

    if (response.data.data) {
      setUser(response.data.data);
      setGroupsFiltered(response.data.data.groups);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div style={{ marginLeft: sideMargin, marginRight: sideMargin }}>
      <Skeleton visible={loading}>
        <AspectRatio ratio={7}>
          <Image src={baseurl + user?.banner_path!} radius="md" />
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
            <Avatar src={baseurl + user?.pfp_path!} size="80" />{" "}
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
          <Tabs.Tab
            value="tickets"
            leftSection={<FontAwesomeIcon icon={faShrimp} />}
          >
            Tickets
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="groups">
          <Space h="sm" />
          <TextInput
            placeholder="search"
            onChange={(event) => handleGroupsChange(event.currentTarget.value)}
            leftSection={<FontAwesomeIcon icon={faSearch} />}
          />
          {groupsFiltered?.map((group) => {
            return (
              <>
                <Space h="lg" /> <GroupCard group={group} />
              </>
            );
          })}
        </Tabs.Panel>
        <Tabs.Panel value="tickets">
          <Space h="sm" />
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
                      <Text size="xs">Date Created: {ticket?.created_at}</Text>
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
      </Tabs>
    </div>
  );
};
