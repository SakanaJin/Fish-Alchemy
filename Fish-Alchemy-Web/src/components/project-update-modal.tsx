import { modals, type ContextModalProps } from "@mantine/modals";
import {
  type ApiResponse,
  type ProjectGetDto,
  type ProjectUpdateDto,
  type UserShallowDto,
} from "../constants/types";
import { useForm } from "@mantine/form";
import api from "../config/axios";
import { notifications } from "@mantine/notifications";
import { Button, Flex, Select, Text, Textarea, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";

export const ProjectUpdateModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  project: ProjectGetDto;
  onSubmit: (updatedProject: ProjectGetDto) => void;
  onDelete: () => void;
}>) => {
  const [users, setUsers] = useState<UserShallowDto[]>();
  const form = useForm({
    initialValues: {
      name: innerProps.project.name,
      description: innerProps.project.description,
      github_url: innerProps.project.github_url
        ? innerProps.project.github_url
        : "",
      discord_webhook_url: innerProps.project.discord_webhook_url
        ? innerProps.project.discord_webhook_url
        : "",
    },
  });

  const handleSubmit = async (values: ProjectUpdateDto) => {
    const response = await api.patch<ApiResponse<ProjectGetDto>>(
      `/api/projects/${innerProps.project.id}`,
      values
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error updating project",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onSubmit(response.data.data);
      form.reset();
      context.closeModal(id);
    }
  };

  const handleDelete = async () => {
    const response = await api.delete<ApiResponse<boolean>>(
      `/api/projects/${innerProps.project.id}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error deleting project",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onDelete();
      form.reset();
      context.closeAll();
    }
  };

  const fetchUsers = async () => {
    const response = await api.get<ApiResponse<UserShallowDto[]>>(
      `/api/projects/${innerProps.project.id}/users`
    );

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

  const handleUserSelect = async (username: string | null) => {
    const response = await api.patchnd<ApiResponse<ProjectGetDto>>(
      `/api/projects/${innerProps.project.id}/user/${
        users?.find((user) => user.username === username)?.id
      }`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error changing lead",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onSubmit(response.data.data);
      form.reset();
      context.closeModal(id);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        label="name"
        autoFocus
        withAsterisk
        {...form.getInputProps("name")}
      />
      <Textarea
        label="description"
        minRows={4}
        maxRows={4}
        autosize
        pt="md"
        {...form.getInputProps("description")}
      />
      <TextInput
        label="github url"
        pt="md"
        {...form.getInputProps("github_url")}
      />
      <TextInput
        label="discord webhook"
        pt="md"
        {...form.getInputProps("discord_webhook_url")}
      />
      <Select
        pt="md"
        searchable
        allowDeselect={false}
        label="Assign User"
        data={users?.flatMap((user) => user.username)}
        defaultValue={innerProps.project.lead.username}
        onChange={(value) => handleUserSelect(value)}
      />
      <Flex justify="space-between" pt="md">
        <Button onClick={() => context.closeModal(id)} variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </Flex>
      <Button
        color="red"
        style={{ marginTop: "10px" }}
        onClick={() => {
          modals.openConfirmModal({
            title: "Confirm Delete",
            centered: true,
            children: (
              <Text>
                Are you sure you want to delete the project{" "}
                {innerProps.project.name}?
              </Text>
            ),
            labels: { confirm: "Confirm", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onCancel: () => {},
            onConfirm: () => handleDelete(),
          });
        }}
      >
        Delete
      </Button>
    </form>
  );
};
