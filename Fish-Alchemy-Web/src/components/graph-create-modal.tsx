import { useForm, type FormErrors } from "@mantine/form";
import type { ContextModalProps } from "@mantine/modals";
import {
  type GraphGetDto,
  type ApiResponse,
  type GraphCreateDto,
} from "../constants/types";
import api from "../config/axios";
import { Button, Flex, Textarea, TextInput } from "@mantine/core";

export const GraphCreateModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  projectid: number;
  onSubmit: (newGraph: GraphGetDto) => void;
}>) => {
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: (value) => {
        return value.length === 0 ? "name cannot be empty" : null;
      },
    },
  });

  const handleSubmit = async (values: GraphCreateDto) => {
    const response = await api.post<ApiResponse<GraphGetDto>>(
      `/api/graphs/project/${innerProps.projectid}`,
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
    </form>
  );
};
