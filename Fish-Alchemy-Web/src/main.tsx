import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <MantineProvider defaultColorScheme="dark">
    <Notifications />
    <Router>
      <App />
    </Router>
  </MantineProvider>
);
