import { modals, type ContextModalProps } from "@mantine/modals";
import {
  type ApiResponse,
  type GroupGetDto,
  type GroupUpdateDto,
} from "../constants/types";
import { useForm, type FormErrors } from "@mantine/form";
import api from "../config/axios";
import { notifications } from "@mantine/notifications";
import { Button, Flex, Text, TextInput } from "@mantine/core";

export const GroupUpdateDeleteModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  group: GroupGetDto;
  onSubmit: (updatedGroup: GroupGetDto) => void;
  onDelete: () => void;
}>) => {
  const form = useForm({
    initialValues: {
      name: innerProps.group.name,
    },
  });

  const handleSubmit = async (values: GroupUpdateDto) => {
    const response = await api.patch<ApiResponse<GroupGetDto>>(
      `/api/groups/${innerProps.group.id}/name`,
      values
    );

    if (response.data.has_errors) {
      const formerrors = response.data.errors.reduce((obj, err) => {
        obj[err.property] = err.message;
        return obj;
      }, {} as FormErrors);
      form.setErrors(formerrors);
    }

    if (response.data.data) {
      innerProps.onSubmit(response.data.data);
      form.reset();
      context.closeModal(id);
    }
  };

  const handleDelete = async () => {
    const response = await api.delete<ApiResponse<boolean>>(
      `/api/groups/${innerProps.group.id}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error deleting group",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onDelete();
      form.reset();
      context.closeAll();
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
      <Button
        color="red"
        style={{ marginTop: "10px" }}
        onClick={() => {
          modals.openConfirmModal({
            title: "Confirm Delete",
            centered: true,
            children: (
              <Text>
                Are you sure you want to delete the group{" "}
                {innerProps.group.name}?
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
