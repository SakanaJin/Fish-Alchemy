import { Button, Flex, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { ContextModalProps } from "@mantine/modals";
import {
  type ApiResponse,
  type ProjectGetDto,
  type ProjectCreateDto,
} from "../constants/types";
import api from "../config/axios";
import { notifications } from "@mantine/notifications";

export const ProjectCreateModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  groupid: number;
  onSubmit: (newProject: ProjectGetDto) => void;
}>) => {
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      github_url: "",
      discord_webhook_url: "",
    },
  });

  const handleSubmit = async (values: ProjectCreateDto) => {
    const response = await api.post<ApiResponse<ProjectGetDto>>(
      `/api/projects/groupid/${innerProps.groupid}`,
      values
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error creating project",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onSubmit(response.data.data);
      form.reset();
      context.closeModal(id);
    }
  };

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
      <Flex justify="space-between" pt="md">
        <Button onClick={() => context.closeModal(id)} variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </Flex>
    </form>
  );
};
