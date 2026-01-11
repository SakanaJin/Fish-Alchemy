import type { ContextModalProps } from "@mantine/modals";
import { matchesField, useForm, type FormErrors } from "@mantine/form";
import api from "../config/axios";
import type { ApiResponse } from "../constants/types";
import { notifications } from "@mantine/notifications";
import { Button, Flex, PasswordInput } from "@mantine/core";

interface ChangePassDto {
  current_password: string;
  new_password: string;
  confirm_new: string;
}

export const ChangePassModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{}>) => {
  const form = useForm({
    validateInputOnChange: ["confirm_new"],
    initialValues: {
      current_password: "",
      new_password: "",
      confirm_new: "",
    },
    validate: {
      confirm_new: matchesField("new_password", "fields do not match"),
    },
  });

  const handleSubmit = async (values: ChangePassDto) => {
    const response = await api.post<ApiResponse<boolean>>(
      `/api/auth/password`,
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
      notifications.show({
        title: "Success",
        message: "Password changed successfully.",
        color: "green",
      });
      form.reset();
      context.closeModal(id);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <PasswordInput
        pt="sm"
        key={form.key("current_password")}
        label="Current Password"
        autoFocus
        {...form.getInputProps("current_password")}
      />
      <PasswordInput
        pt="sm"
        key={form.key("new_password")}
        label="New Password"
        {...form.getInputProps("new_password")}
      />
      <PasswordInput
        pt="sm"
        key={form.key("confirm_new")}
        label="Confirm Password"
        {...form.getInputProps("confirm_new")}
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
