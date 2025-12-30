import { Center, Space, Title } from "@mantine/core";
import { faCrow } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const NotFoundPage = () => {
  return (
    <Center
      style={{
        width: "100vw",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Title>Nothing Here but us... Crows?</Title>
      <Space h="sm" />
      <FontAwesomeIcon icon={faCrow} size="3x" />
    </Center>
  );
};
