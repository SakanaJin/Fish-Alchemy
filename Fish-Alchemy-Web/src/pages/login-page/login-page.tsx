import type { ApiResponse } from "../../constants/types";
import { useAsyncFn } from "react-use";
import { useForm } from "@mantine/form";
import type { FormErrors } from "@mantine/form";
import { Alert, Button, Container, Input, Text } from "@mantine/core";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";

const baseUrl = "http://localhost:8000";

type LoginRequest = {
  username: string;
  password: string;
};

type LoginResponse = ApiResponse<boolean>;

export const LoginPage = ({
  fetchCurrentUser,
}: {
  fetchCurrentUser: () => void;
}) => {
  const form = useForm<LoginRequest>({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value) =>
        value.length <= 0 ? "Username must not be empty" : null,
      password: (value) =>
        value.length <= 0 ? "Password must not be empty" : null,
    },
  });

  const [, submitLogin] = useAsyncFn(async (values: LoginRequest) => {
    if (baseUrl === undefined) {
      return;
    }

    const response = await api.post<LoginResponse>(`/api/authenticate`, values);
    if (response.data.hasErrors) {
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
      showNotification({ message: "Successfully Logged In!", color: "green" });
      fetchCurrentUser();
    }
  }, []);

  return (
    <Container>
      <Container px={0}>
        {form.errors[""] && (
          <Alert color="red">
            <Text>{form.errors[""]}</Text>
          </Alert>
        )}
        <form onSubmit={form.onSubmit(submitLogin)}>
          <Container px={0}>
            <Container px={0}>
              <Container px={0}>
                <label htmlFor="userName">Username</label>
              </Container>
              <Input {...form.getInputProps("userName")} />
              <Text c="red">{form.errors["userName"]}</Text>
            </Container>
            <Container px={0}>
              <Container px={0}>
                <label htmlFor="password">Password</label>
              </Container>
              <Input type="password" {...form.getInputProps("password")} />
              <Text c="red">{form.errors["password"]}</Text>
            </Container>

            <Container px={0}>
              <Button type="submit">Login</Button>
            </Container>
          </Container>
        </form>
      </Container>
    </Container>
  );
};

// const useStyles = createStyles(() => {
//   return {
//     generalErrors: {
//       marginBottom: "8px",
//     },

//     loginButton: {
//       marginTop: "8px",
//     },

//     formField: {
//       marginBottom: "8px",
//     },
//   };
// });
