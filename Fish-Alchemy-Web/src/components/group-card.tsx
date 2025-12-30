import type React from "react";
import { EnvVars } from "../config/env-vars";
import type { GroupShallowDto } from "../constants/types";
import { useNavigate } from "react-router-dom";
import { Avatar, Paper, Title } from "@mantine/core";
import { routes } from "../routes/RouteIndex";

interface GroupCardProps {
  group: GroupShallowDto;
}

const baseurl = EnvVars.apiBaseUrl;

export const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const navigate = useNavigate();

  return (
    <Paper
      withBorder
      shadow="sm"
      p="xl"
      onClick={() => navigate(routes.groupPage.replace(":id", `${group.id}`))}
      style={{ cursor: "pointer" }}
    >
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Avatar src={baseurl + group.logo_path} size="lg"></Avatar>
        <Title style={{ paddingLeft: "20px" }}>{group.name}</Title>
      </div>
    </Paper>
  );
};
