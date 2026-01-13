import { useForm, type FormErrors } from "@mantine/form";
import type { ContextModalProps } from "@mantine/modals";
import {
  type ApiResponse,
  type NodeGetDto,
  type NodeUpdateDto,
} from "../constants/types";
import api from "../config/axios";
import { Button, Flex, TextInput } from "@mantine/core";

export const NodeEditModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<{
  id: string;
  name: string;
  onSubmit: (updatedNode: NodeGetDto) => void;
}>) => {
  const form = useForm({
    initialValues: {
      name: innerProps.name,
    },
    validate: {
      name: (value) => {
        return value.length === 0 ? "Name cannot be empty" : null;
      },
    },
  });

  const handleSubmit = async (values: NodeUpdateDto) => {
    const response = await api.patch<ApiResponse<NodeGetDto>>(
      `/nodes/${innerProps.id}`,
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

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        key={form.key("name")}
        label="name"
        autoFocus
        {...form.getInputProps("name")}
      />
      <Flex pt="sm" justify="space-between">
        <Button variant="outline" onClick={() => context.closeModal(id)}>
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </Flex>
    </form>
  );
};
