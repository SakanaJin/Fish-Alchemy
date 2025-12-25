import { useParams } from "react-router-dom";
import api from "../../config/axios";
import type { ApiResponse, UserGetDto } from "../../constants/types";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import {
  AspectRatio,
  Avatar,
  Center,
  Loader,
  Image,
  Container,
  Title,
} from "@mantine/core";
import { EnvVars } from "../../config/env-vars";

const baseurl = EnvVars.apiBaseUrl;
const sideMargin = "100px";

export const UserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState<UserGetDto>();

  const fetchUser = async () => {
    const response = await api.get<ApiResponse<UserGetDto>>(`/api/users/${id}`);

    if (response.data.hasErrors) {
      notifications.show({
        title: "Error",
        message: "Error fetching user",
        color: "red",
      });
    }

    if (response.data.data) {
      setUser(response.data.data);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      {user ? (
        <div style={{ marginLeft: sideMargin, marginRight: sideMargin }}>
          <AspectRatio ratio={7}>
            <Image src={baseurl + user.banner_path} radius="md" />
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
              <Avatar src={baseurl + user.pfp_path} size="80" />{" "}
            </Avatar>
          </AspectRatio>
          <Title style={{ transform: "translateY(-35px)", marginLeft: "30px" }}>
            {user.username}
          </Title>
        </div>
      ) : (
        <Center style={{ height: "100vh", width: "100vw" }}>
          <Loader />
        </Center>
      )}
    </>
  );
};
