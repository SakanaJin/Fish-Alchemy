import { modals, type ContextModalProps } from "@mantine/modals";
import {
  type ApiResponse,
  type TicketShallowDto,
  type TicketUpdateDto,
  type TicketGetDto,
  type UserShallowDto,
} from "../constants/types";
import { useForm, type FormErrors } from "@mantine/form";
import { Button, Flex, Select, Text, Textarea, TextInput } from "@mantine/core";
import api from "../config/axios";
import { notifications } from "@mantine/notifications";
import { DateTimePicker } from "@mantine/dates";
import { useEffect, useState } from "react";

export const TicketUpdateDeleteModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  onSubmit: (updatedTicket: TicketShallowDto) => void;
  onDelete: (toDelete: TicketShallowDto) => void;
  ticket: TicketShallowDto;
}>) => {
  const [date, setDate] = useState<string | null>(innerProps.ticket.duedate);
  const [users, setUsers] = useState<UserShallowDto[]>();
  const [dirty, setDirty] = useState(false);
  const form = useForm({
    initialValues: {
      name: innerProps.ticket.name,
      description: innerProps.ticket.description
        ? innerProps.ticket.description
        : "",
      github_url: innerProps.ticket.github_url
        ? innerProps.ticket.github_url
        : "",
    },
  });

  const handleSubmit = async (values: TicketUpdateDto) => {
    const response = await api.patch<ApiResponse<TicketGetDto>>(
      `/api/tickets/${innerProps.ticket.id}`,
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
      innerProps.onSubmit({
        ...response.data.data,
        projectid: response.data.data.project.id,
        projectname: response.data.data.project.name,
      });
      context.closeModal(id);
    }
  };

  const handleDelete = async () => {
    const response = await api.delete<ApiResponse<boolean>>(
      `/api/tickets/${innerProps.ticket.id}`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error deleting ticket",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onDelete(innerProps.ticket);
      context.closeAll();
    }
  };

  const handleDuedateChange = async (date: string | null) => {
    const response = await api.patch<ApiResponse<TicketGetDto>>(
      `/api/tickets/${innerProps.ticket.id}/duedate`,
      { date: date?.replace(" ", "T") }
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error changing duedate",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onSubmit({
        ...response.data.data,
        projectid: response.data.data.project.id,
        projectname: response.data.data.project.name,
      });
    }
  };

  const fetchUsers = async () => {
    const response = await api.get<ApiResponse<UserShallowDto[]>>(
      `/api/projects/${innerProps.ticket.projectid}/users`
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
    if (!username?.trim()) return;
    const response = await api.patchnd<ApiResponse<TicketGetDto>>(
      `/api/tickets/${innerProps.ticket.id}/user/${
        users?.find((user) => user.username === username)?.id
      }`
    );

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Only lead can assign user.",
        color: "red",
      });
    }

    if (response.data.data) {
      innerProps.onSubmit({
        ...response.data.data,
        projectid: response.data.data.project.id,
        projectname: response.data.data.project.name,
      });
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
      <DateTimePicker
        valueFormat="YYYY-MM-DDTHH:mm:ss"
        pt="md"
        label="Due Date"
        clearable
        defaultValue={innerProps.ticket.duedate}
        value={date}
        onChange={(d) => {
          setDate(d);
          setDirty(true);
        }}
        onDropdownClose={() => {
          if (dirty) {
            handleDuedateChange(date);
            setDirty(false);
          }
        }}
      />
      <Select
        pt="md"
        searchable
        allowDeselect={false}
        label="Assign User"
        data={users?.flatMap((user) => user.username)}
        defaultValue={innerProps.ticket.user.username}
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
                Are you sure you want to delete the ticket{" "}
                {innerProps.ticket.name}?
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
