import { modals, type ContextModalProps } from "@mantine/modals";
import {
  type ApiResponse,
  type GraphGetDto,
  type GraphUpdateDto,
} from "../constants/types";
import { useForm, type FormErrors } from "@mantine/form";
import api from "../config/axios";
import { Button, Flex, Space, Text, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export const GraphEditModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  graph: GraphGetDto;
  onSubmit: (updatedGraph: GraphGetDto) => void;
  onDelete: () => void;
}>) => {
  const form = useForm({
    initialValues: {
      name: innerProps.graph.name,
      description: innerProps.graph.description
        ? innerProps.graph.description
        : "",
    },
    validate: {
      name: (value) => {
        return value.length === 0 ? "name cannot be empty" : null;
      },
    },
  });

  const handleSubmit = async (values: GraphUpdateDto) => {
    const response = await api.patch<ApiResponse<GraphGetDto>>(
      `/graphs/${innerProps.graph.id}`,
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
      context.closeModal(id);
    }
  };

  const handleDelete = async () => {
    const response = await api.delete<ApiResponse<boolean>>(
      `/graphs/${innerProps.graph.id}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error deleting graph",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onDelete();
      context.closeAll();
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        key={form.key("name")}
        label="name"
        {...form.getInputProps("name")}
      />
      <Textarea
        pt="sm"
        minRows={4}
        maxRows={4}
        autosize
        key={form.key("name")}
        label="description"
        {...form.getInputProps("description")}
      />
      <Flex justify="space-between" pt="sm">
        <Button variant="outline" onClick={() => context.closeModal(id)}>
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </Flex>
      <Space h="sm" />
      <Button
        color="red"
        onClick={() => {
          modals.openConfirmModal({
            title: "Confirm Delete",
            centered: true,
            children: (
              <Text>
                Are you sure you want to delete the project{" "}
                {innerProps.graph.name}?
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
