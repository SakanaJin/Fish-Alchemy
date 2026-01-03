import { useParams } from "react-router-dom";
import api from "../../config/axios";
import type {
  GroupShallowDto,
  TicketShallowDto,
  ApiResponse,
  UserGetDto,
} from "../../constants/types";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
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
} from "@mantine/core";
import { EnvVars } from "../../config/env-vars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish, faSearch, faShrimp } from "@fortawesome/free-solid-svg-icons";
import { GroupCard } from "../../components/group-card";
import { TicketBadge } from "../../components/ticket-badge";

const baseurl = EnvVars.apiBaseUrl;
const sideMargin = "100px";

export const UserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState<UserGetDto>();
  const [loading, setLoading] = useState(true);
  const [groupsFiltered, setGroupsFiltered] = useState<GroupShallowDto[]>();
  const [ticketsFiltered, setTicketsFiltered] = useState<TicketShallowDto[]>();

  const handleGroupsChange = (search: string) => {
    setGroupsFiltered(
      user?.groups.filter((group) => {
        return group.name.toLowerCase().includes(search.toLowerCase());
      })
    );
  };

  const handleTicketsChange = (search: string) => {
    setTicketsFiltered(
      user?.tickets.filter((ticket) => {
        return ticket.name.toLowerCase().includes(search.toLowerCase());
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
      setTicketsFiltered(response.data.data.tickets);
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
        <ScrollArea offsetScrollbars overscrollBehavior="contain">
          <Tabs.Panel value="groups">
            <Space h="sm" />
            <TextInput
              placeholder="search"
              onChange={(event) =>
                handleGroupsChange(event.currentTarget.value)
              }
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
            <TextInput
              placeholder="search"
              onChange={(event) =>
                handleTicketsChange(event.currentTarget.value)
              }
              leftSection={<FontAwesomeIcon icon={faSearch} />}
            />
            <Space h="lg" />
            <SimpleGrid cols={3} spacing="lg" verticalSpacing="lg">
              {ticketsFiltered?.map((ticket) => {
                return (
                  <Card withBorder shadow="sm">
                    <Title>{ticket.name}</Title>
                    <Space h="sm" />
                    <ScrollArea h="5em">
                      <Text>{ticket.description}</Text>
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
                      <Text>
                        {ticket.projectname} #{ticket.ticketnum}
                      </Text>
                      <TicketBadge state={ticket.state} />
                    </Card.Section>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Tabs.Panel>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
