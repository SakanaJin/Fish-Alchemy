import { MantineProvider, Container } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "./authentication/use-auth";
import { Routes } from "./routes/RouteConfig";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { PageWrapper } from "./components/page-wrapper";

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <Notifications />
      <Container fluid px={0} className="App">
        <AuthProvider>
          <PageWrapper>
            <Routes />
          </PageWrapper>
        </AuthProvider>
      </Container>
    </MantineProvider>
  );
}

export default App;
