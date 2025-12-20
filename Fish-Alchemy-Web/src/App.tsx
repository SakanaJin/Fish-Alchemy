import { MantineProvider, Container } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "./authentication/use-auth";
import { Routes } from "./routes/RouteConfig";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

function App() {
  return (
    <MantineProvider forceColorScheme="dark">
      <Notifications />
      <Container fluid px={0} className="App">
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </Container>
    </MantineProvider>
  );
}

export default App;
