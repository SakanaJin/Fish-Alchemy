import { useParams } from "react-router-dom";
import api from "../../config/axios";
import type { ApiResponse, UserGetDto } from "../../constants/types";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { Center, Loader } from "@mantine/core";

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
        <header>{user.username}</header>
      ) : (
        <Center style={{ height: "100vh", width: "100vw" }}>
          <Loader />
        </Center>
      )}
    </>
  );
};
