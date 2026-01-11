import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";
import { ProjectUpdateModal } from "./components/project-update-modal.tsx";
import { TicketCreateModalForm } from "./components/ticket-create-modal.tsx";
import { TicketUpdateDeleteModal } from "./components/ticket-update-delete-modal.tsx";
import { ImageUploadModal } from "./components/image-upload-modal.tsx";
import { ProjectCreateModal } from "./components/project-create-modal.tsx";
import { AddUserModal } from "./components/add-user-modal.tsx";
import { GroupUpdateDeleteModal } from "./components/group-update-delete-modal.tsx";
import { GroupCreateModal } from "./components/group-create-modal.tsx";
import { ChangePassModal } from "./components/change-pass-modal.tsx";

const modals = {
  changepass: ChangePassModal,
  createticket: TicketCreateModalForm,
  updatedeleteticket: TicketUpdateDeleteModal,
  updatedeleteproject: ProjectUpdateModal,
  createproject: ProjectCreateModal,
  updatedeletegroup: GroupUpdateDeleteModal,
  creategroup: GroupCreateModal,
  adduser: AddUserModal,
  uploadimage: ImageUploadModal,
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
