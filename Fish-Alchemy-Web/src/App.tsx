import { Container } from "@mantine/core";
import { AuthProvider } from "./authentication/use-auth";
import { Routes } from "./routes/RouteConfig";
import { PageWrapper } from "./components/page-wrapper";

function App() {
  return (
    <Container fluid px={0} className="App">
      <AuthProvider>
        <PageWrapper>
          <Routes />
        </PageWrapper>
      </AuthProvider>
    </Container>
  );
}

export default App;
