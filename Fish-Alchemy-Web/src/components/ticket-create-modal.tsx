import { useForm, type FormErrors } from "@mantine/form";
import {
  type ApiResponse,
  type TicketGetDto,
  type TicketCreateDto,
  type TicketShallowDto,
} from "../constants/types";
import api from "../config/axios";
import { type ContextModalProps } from "@mantine/modals";
import { Button, Flex, Textarea, TextInput } from "@mantine/core";

// interface TicketCreateModalFormProps {
//   modalId: string;
// }

export const TicketCreateModalForm = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  projectid: number;
  onSubmit: (newTicket: TicketShallowDto) => void;
}>) => {
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      github_url: "",
    },
  });

  const handleSubmit = async (values: TicketCreateDto) => {
    const response = await api.post<ApiResponse<TicketGetDto>>(
      `/api/tickets/project/${innerProps.projectid}`,
      values
    );

    if (response.data.has_errors) {
      const formErrors: FormErrors = response.data.errors.reduce(
        (prev, curr) => {
          Object.assign(prev, { [curr.property]: curr.message });
          return prev;
        },
        {} as FormErrors
      );
      form.setErrors(formErrors);
    }

    if (response.data.data) {
      innerProps.onSubmit({
        ...response.data.data,
        projectname: response.data.data.project.name,
      });
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
      <Flex justify="space-between" pt="md">
        <Button onClick={() => context.closeModal(id)} variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </Flex>
    </form>
  );
};
