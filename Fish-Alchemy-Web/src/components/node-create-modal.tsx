import { useForm, type FormErrors } from "@mantine/form";
import type { ContextModalProps } from "@mantine/modals";
import {
  type ApiResponse,
  type NodeCreateDto,
  type NodeGetDto,
} from "../constants/types";
import api from "../config/axios";
import { Button, Flex, TextInput } from "@mantine/core";

export const NodeCreateModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  graphid: number;
  onSubmit: (newNode: NodeGetDto) => void;
}>) => {
  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) => {
        return value.length === 0 ? "name cannot be empty" : null;
      },
    },
  });

  const handleSubmit = async (values: NodeCreateDto) => {
    const response = await api.post<ApiResponse<NodeGetDto>>(
      `/nodes/graph/${innerProps.graphid}`,
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
