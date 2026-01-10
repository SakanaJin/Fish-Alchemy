import { useForm } from "@mantine/form";
import type { ContextModalProps } from "@mantine/modals";
import {
  type ApiResponse,
  type GroupGetDto,
  type GroupCreateDto,
} from "../constants/types";
import api from "../config/axios";
import { notifications } from "@mantine/notifications";
import { Button, Flex, TextInput } from "@mantine/core";

export const GroupCreateModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ onSubmit: (newGroup: GroupGetDto) => void }>) => {
  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  const handleSubmit = async (values: GroupCreateDto) => {
    const response = await api.post<ApiResponse<GroupGetDto>>(
      `/api/groups`,
      values
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error creating group",
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
      <Flex justify="space-between" pt="md">
        <Button onClick={() => context.closeModal(id)} variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </Flex>
    </form>
  );
};
