import { modals, type ContextModalProps } from "@mantine/modals";
import { useEffect, useMemo, useState } from "react";
import type { ApiResponse, UserGetDto } from "../constants/types";
import api from "../config/axios";
import { notifications } from "@mantine/notifications";
import { Button, Flex, Select, Text } from "@mantine/core";

export const UserDeleteModal = ({ context, id }: ContextModalProps<{}>) => {
  const [users, setUsers] = useState<UserGetDto[]>();
  const usernames = useMemo(() => {
    return users?.flatMap((user) => user.username);
  }, [users]);
  const [selectedUsername, setSelectedUsername] = useState<string | null>("");

  const handleSubmit = async () => {
    const response = await api.delete<ApiResponse<boolean>>(
      `/api/users/${
        users?.find((user) => user.username === selectedUsername)?.id
      }`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error deleting user",
        color: "red",
      });
    }

    if (response.data.data) {
      notifications.show({
        title: "Success",
        message: "Successfully deleted user",
        color: "green",
      });
      context.closeAll();
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
    <>
      <Select
        searchable
        allowDeselect={false}
        data={usernames}
        onChange={(value) => setSelectedUsername(value)}
      />
      <Flex pt="sm" justify="space-between">
        <Button variant="cancel" onClick={() => context.closeModal(id)}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={() => {
            modals.openConfirmModal({
              title: "Confirm Delete",
              centered: true,
              children: (
                <Text>
                  Are you sure you want to delete the ticket {selectedUsername}?
                </Text>
              ),
              labels: { confirm: "Confirm", cancel: "Cancel" },
              confirmProps: { color: "red" },
              onCancel: () => {},
              onConfirm: () => handleSubmit(),
            });
          }}
        >
          Delete
        </Button>
      </Flex>
    </>
  );
};
