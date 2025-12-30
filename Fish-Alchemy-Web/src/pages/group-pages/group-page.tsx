import { useNavigate, useParams } from "react-router-dom";
import { EnvVars } from "../../config/env-vars";
import { useEffect, useState } from "react";
import type {
  ProjectShallowDto,
  UserShallowDto,
  ApiResponse,
  GroupGetDto,
} from "../../constants/types";
import api from "../../config/axios";
import { notifications } from "@mantine/notifications";
import {
  AspectRatio,
  Skeleton,
  Image,
  Avatar,
  Title,
  Tabs,
  ScrollArea,
  Space,
  TextInput,
  Paper,
  SimpleGrid,
  Card,
  Group,
  useMantineColorScheme,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSailboat,
  faSearch,
  faWater,
} from "@fortawesome/free-solid-svg-icons";
import { routes } from "../../routes/RouteIndex";

const baseurl = EnvVars.apiBaseUrl;
const sideMargin = "100px";

export const GroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupGetDto>();
  const [loading, setLoading] = useState(true);
  const [projectsFiltered, setProjectsFiltered] =
    useState<ProjectShallowDto[]>();
  const [usersFiltered, setUsersFiltered] = useState<UserShallowDto[]>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const handleProjectsChange = (search: string) => {
    setProjectsFiltered(
      group?.projects.filter((project) => {
        return project.name.toLowerCase().includes(search.toLowerCase());
      })
    );
  };

  const handleUsersChange = (search: string) => {
    setUsersFiltered(
      group?.users.filter((user) => {
        return user.username.toLowerCase().includes(search.toLowerCase());
      })
    );
  };

  const fetchGroup = async () => {
    const response = await api.get<ApiResponse<GroupGetDto>>(
      `/api/groups/${id}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error fetching group.",
        color: "red",
      });
    }

    if (response.data.data) {
      setGroup(response.data.data);
      setProjectsFiltered(response.data.data.projects);
      setUsersFiltered(response.data.data.users);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  return (
    <div style={{ marginLeft: sideMargin, marginRight: sideMargin }}>
      <Skeleton visible={loading}>
        <AspectRatio ratio={7}>
          <Image src={baseurl + group?.banner_path!} radius="md" />
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
            <Avatar src={baseurl + group?.logo_path!} size="80" />{" "}
          </Avatar>
        </AspectRatio>
      </Skeleton>
      <Title style={{ transform: "translateY(-35px)", marginLeft: "30px" }}>
        {group?.name}
      </Title>
      <Tabs defaultValue="projects">
        <Tabs.List>
          <Tabs.Tab
            value="projects"
            leftSection={<FontAwesomeIcon icon={faSailboat} />}
          >
            Projects
          </Tabs.Tab>
          <Tabs.Tab
            value="users"
            leftSection={<FontAwesomeIcon icon={faWater} />}
          >
            Users
          </Tabs.Tab>
        </Tabs.List>
        <ScrollArea offsetScrollbars overscrollBehavior="contain">
          <Tabs.Panel value="projects">
            <Space h="sm" />
            <TextInput
              placeholder="search"
              onChange={(event) =>
                handleProjectsChange(event.currentTarget.value)
              }
              leftSection={<FontAwesomeIcon icon={faSearch} />}
            />
            {projectsFiltered?.map((project) => {
              return (
                <>
                  <Space h="lg" />
                  <Paper
                    withBorder
                    shadow="sm"
                    p="xl"
                    onClick={() =>
                      navigate(
                        routes.projectPage.replace(":id", `${project.id}`)
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        src={baseurl + project.logo_path}
                        size="lg"
                      ></Avatar>
                      <Title style={{ paddingLeft: "20px" }}>
                        {project.name}
                      </Title>
                    </div>
                  </Paper>
                </>
              );
            })}
          </Tabs.Panel>
          <Tabs.Panel value="users">
            <Space h="sm" />
            <TextInput
              placeholder="search"
              onChange={(event) => handleUsersChange(event.currentTarget.value)}
              leftSection={<FontAwesomeIcon icon={faSearch} />}
            />
            <Space h="lg" />
            <SimpleGrid cols={5} verticalSpacing="lg" spacing="lg">
              {usersFiltered?.map((user) => {
                return (
                  <Card
                    withBorder
                    shadow="sm"
                    onClick={() =>
                      navigate(routes.user.replace(":id", `${user.id}`))
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Section>
                      <Image src={baseurl + user.banner_path} height={160} />
                    </Card.Section>
                    <Group
                      style={{
                        zIndex: 10,
                        transform: "translateY(-35px)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Avatar
                        size="100"
                        color={
                          dark
                            ? "var(--mantine-color-dark-6)"
                            : "var(--mantine-color-white)"
                        }
                        bg={
                          dark
                            ? "var(--mantine-color-dark-6)"
                            : "var(--mantine-color-white)"
                        }
                      >
                        <Avatar src={baseurl + user.pfp_path} size="80" />
                      </Avatar>
                      <Title>{user.username}</Title>
                    </Group>
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
