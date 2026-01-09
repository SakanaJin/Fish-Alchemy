import { useNavigate, useParams } from "react-router-dom";
import { EnvVars } from "../../config/env-vars";
import { useEffect, useMemo, useState } from "react";
import type {
  ApiResponse,
  GroupGetDto,
  ProjectGetDto,
  ProjectShallowDto,
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
  Space,
  TextInput,
  Paper,
  SimpleGrid,
  Card,
  Group,
  useMantineColorScheme,
  Flex,
  ActionIcon,
  Text,
  Overlay,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faPlus,
  faSailboat,
  faSearch,
  faTrash,
  faWater,
} from "@fortawesome/free-solid-svg-icons";
import { routes } from "../../routes/RouteIndex";
import { useUser } from "../../authentication/use-auth";
import { modals } from "@mantine/modals";
import { AvatarOverlay } from "../../components/avatar-overlay";
import { openImageUploadModal } from "../../components/image-upload-modal";
import { useHover } from "@mantine/hooks";

const baseurl = EnvVars.apiBaseUrl;
const sideMargin = "100px";

export const GroupPage = () => {
  const { hovered, ref } = useHover();
  const user = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupGetDto>();
  const [loading, setLoading] = useState(true);
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const [isOwner, setIsOwner] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const usersFiltered = useMemo(() => {
    if (!userSearch.trim()) return group?.users;
    return group?.users.filter((user) =>
      user.username.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [group, userSearch]);
  const projectsFiltered = useMemo(() => {
    if (!projectSearch.trim()) return group?.projects;
    return group?.projects.filter((project) =>
      project.name.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [group, projectSearch]);

  const addProject = (newProject: ProjectShallowDto) => {
    setGroup((group) => {
      if (!group) return undefined;
      group.projects.push(newProject);
      return group;
    });
  };

  const removeUser = async (userid: number) => {
    const response = await api.delete<ApiResponse<GroupGetDto>>(
      `/api/groups/${group?.id}/user/${userid}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error removing user",
        color: "red",
      });
    }

    if (response.data.data) {
      setGroup(response.data.data);
    }
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
      setIsOwner(response.data.data.creator.id === user.id);
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
          <Image
            src={baseurl + group?.banner_path!}
            radius="md"
            ref={ref}
            style={{ cursor: isOwner ? "pointer" : "default" }}
            onClick={() => {
              isOwner
                ? openImageUploadModal<GroupGetDto>({
                    apiurl: `/api/groups/${group?.id}/banner`,
                    onUpload: (updatedGroup: GroupGetDto) =>
                      setGroup(updatedGroup),
                  })
                : {};
            }}
          />
          {isOwner && hovered && (
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
              src={baseurl + group?.logo_path!}
              size="80"
              overlay={isOwner}
              onClick={() => {
                isOwner
                  ? openImageUploadModal<GroupGetDto>({
                      apiurl: `/api/groups/${group?.id}/logo`,
                      onUpload: (updatedGroup: GroupGetDto) =>
                        setGroup(updatedGroup),
                    })
                  : {};
              }}
            >
              <FontAwesomeIcon icon={faCamera} />
            </AvatarOverlay>
          </Avatar>
        </AspectRatio>
      </Skeleton>
      {isOwner ? (
        <Title
          style={{
            transform: "translateY(-35px)",
            marginLeft: "30px",
            cursor: "pointer",
          }}
          onClick={() => {
            modals.openContextModal({
              modal: "updatedeletegroup",
              title: "Update Group",
              centered: true,
              innerProps: {
                group: group!,
                onDelete: () =>
                  navigate(routes.user.replace(":id", `${user.id}`)),
                onSubmit: (updatedGroup) => setGroup(updatedGroup),
              },
            });
          }}
        >
          {group?.name}
        </Title>
      ) : (
        <Title
          style={{
            transform: "translateY(-35px)",
            marginLeft: "30px",
          }}
        >
          {group?.name}
        </Title>
      )}
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
        <Tabs.Panel value="projects">
          <Flex pt="sm" align="center">
            <TextInput
              placeholder="search"
              onChange={(event) => setProjectSearch(event.currentTarget.value)}
              leftSection={<FontAwesomeIcon icon={faSearch} />}
              style={{ flexGrow: 1 }}
            />
            {isOwner && (
              <>
                <Space w="sm" />
                <ActionIcon
                  variant="default"
                  h="36px"
                  w="36px"
                  onClick={() => {
                    modals.openContextModal({
                      modal: "createproject",
                      title: "Create Project",
                      centered: true,
                      innerProps: {
                        groupid: group?.id!,
                        onSubmit: (newProject: ProjectGetDto) =>
                          addProject({ ...newProject }),
                      },
                    });
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </ActionIcon>
              </>
            )}
          </Flex>
          {projectsFiltered?.map((project) => {
            return (
              <>
                <Space h="sm" />
                <Paper
                  withBorder
                  shadow="sm"
                  p="xl"
                  onClick={() =>
                    navigate(routes.projectPage.replace(":id", `${project.id}`))
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
          <Flex pt="sm" align="center">
            <TextInput
              placeholder="search"
              onChange={(event) => setUserSearch(event.currentTarget.value)}
              leftSection={<FontAwesomeIcon icon={faSearch} />}
              style={{ flexGrow: 1 }}
            />
            {isOwner && (
              <>
                <Space w="sm" />
                <ActionIcon
                  variant="default"
                  h="36px"
                  w="36px"
                  onClick={() => {
                    modals.openContextModal({
                      modal: "adduser",
                      title: "Add User",
                      centered: true,
                      innerProps: {
                        groupid: group?.id!,
                        onSubmit: (updatedGroup) => {
                          setGroup(updatedGroup);
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
          <SimpleGrid cols={5} verticalSpacing="lg" spacing="lg" pt="sm">
            {usersFiltered?.map((cuser) => {
              return (
                <Card withBorder shadow="sm">
                  <Card.Section>
                    <Image src={baseurl + cuser.banner_path} height={160} />
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
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(routes.user.replace(":id", `${cuser.id}`))
                      }
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
                      <Avatar src={baseurl + cuser.pfp_path} size="80" />
                    </Avatar>
                    <Title>{cuser.username}</Title>
                  </Group>
                  {isOwner && user.id !== cuser.id && (
                    <Card.Section
                      style={{ display: "flex", justifyContent: "flex-start" }}
                    >
                      <ActionIcon
                        variant="transparent"
                        color="red"
                        onClick={() => {
                          modals.openConfirmModal({
                            title: "Confirm Delete",
                            centered: true,
                            children: (
                              <Text>
                                Are you sure you want to remove the user{" "}
                                {cuser.username}?
                              </Text>
                            ),
                            labels: { confirm: "Confirm", cancel: "Cancel" },
                            confirmProps: { color: "red" },
                            onCancel: () => {},
                            onConfirm: () => removeUser(cuser.id),
                          });
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </ActionIcon>
                    </Card.Section>
                  )}
                </Card>
              );
            })}
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};
