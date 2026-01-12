import { Button, Container, Flex, Title } from "@mantine/core";
import { modals } from "@mantine/modals";

export const AdminPage = () => {
  return (
    <Container>
      <Title>This da admin page fr</Title>
      <Flex pt="md" justify="space-between">
        <Button
          onClick={() => {
            modals.openContextModal({
              modal: "createuser",
              title: "Create User",
              centered: true,
              innerProps: {},
            });
          }}
        >
          Create User
        </Button>
        <Button
          color="red"
          onClick={() => {
            modals.openContextModal({
              modal: "deleteuser",
              title: "Delete User",
              centered: true,
              innerProps: {},
            });
          }}
        >
          Delete User
        </Button>
      </Flex>
    </Container>
  );
};
