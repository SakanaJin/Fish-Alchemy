import { useNavigate, useParams } from "react-router-dom";
import { EnvVars } from "../../config/env-vars";
import { useEffect, useState } from "react";
import type { ApiResponse, ProjectGetDto } from "../../constants/types";
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
} from "@mantine/core";
import { routes } from "../../routes/RouteIndex";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask, faMap, faTree } from "@fortawesome/free-solid-svg-icons";
import { KanbanBoard } from "../../components/kanban-board";

const baseurl = EnvVars.apiBaseUrl;
const sideMargin = "100px";

export const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectGetDto>();
  const [loading, setLoading] = useState(true);

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
        <Flex direction="row" h="10rem">
          <Flex direction="column" miw="15rem">
            <Avatar src={baseurl + project?.logo_path!} size="80" />
            <HoverCard shadow="sm" openDelay={250}>
              <HoverCard.Target>
                <Title lineClamp={1}>{project?.name}</Title>
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
                  />
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Text>{project?.lead.username}</Text>
                </HoverCard.Dropdown>
              </HoverCard>
            </Flex>
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
          <Flex h="calc(100vh - 320px">
            {project?.tickets && (
              <KanbanBoard tickets={project?.tickets!} projectid={project.id} />
            )}
          </Flex>
        </Tabs.Panel>
        <Tabs.Panel value="list">
          <ScrollArea
            offsetScrollbars
            overscrollBehavior="contain"
          ></ScrollArea>
        </Tabs.Panel>
        <Tabs.Panel value="graphs">
          <ScrollArea
            offsetScrollbars
            overscrollBehavior="contain"
          ></ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};
