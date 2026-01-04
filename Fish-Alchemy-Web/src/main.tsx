import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";
import { TicketCreateModalForm } from "./components/ticket-create-modal.tsx";
import { TicketUpdateDeleteModal } from "./components/ticket-update-delete-modal.tsx";

const modals = {
  createticket: TicketCreateModalForm,
  updatedeleteticket: TicketUpdateDeleteModal,
};
declare module "@mantine/modals" {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}

createRoot(document.getElementById("root")!).render(
  <MantineProvider defaultColorScheme="dark">
    <Notifications />
    <ModalsProvider modals={modals}>
      <Router>
        <App />
      </Router>
    </ModalsProvider>
  </MantineProvider>
);
