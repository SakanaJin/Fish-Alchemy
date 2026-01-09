import { Select } from "@mantine/core";
import type { ContextModalProps } from "@mantine/modals";
import api from "../config/axios";
import {
  type GroupGetDto,
  type ApiResponse,
  type UserGetDto,
} from "../constants/types";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";

export const AddUserModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  groupid: number;
  onSubmit: (updatedGroup: GroupGetDto) => void;
}>) => {
  const [users, setUsers] = useState<UserGetDto[]>();
  const usernames = useMemo(() => {
    return users?.flatMap((user) => user.username);
  }, [users]);

  const handleUserSelect = async (username: string | null) => {
    const response = await api.post<ApiResponse<GroupGetDto>>(
      `/api/groups/${innerProps.groupid}/user/${
        users?.find((user) => user.username === username)?.id
      }`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error adding user",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onSubmit(response.data.data);
      context.closeModal(id);
    }
  };

  const fetchUsers = async () => {
    const response = await api.get<ApiResponse<UserGetDto[]>>(`/api/users`);

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error fetching users",
        color: "red",
      });
    }

    if (response.data.data) {
      setUsers(response.data.data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Select
      searchable
      allowDeselect={false}
      data={usernames}
      onChange={(value) => handleUserSelect(value)}
    />
  );
};
