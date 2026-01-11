import { Navigate, Route, Routes as Switch } from "react-router-dom";
import { NotFoundPage } from "../pages/not-found";
import { routes } from "./RouteIndex";
import { UserPage } from "../pages/user-pages/user-page";
import { GroupPage } from "../pages/group-pages/group-page";
import { ProjectPage } from "../pages/project-pages/project-page";
import { HomePage } from "../pages/home-page";
import { RequireAdmin } from "../authorization/require-admin";
import { AdminPage } from "../pages/admin-page";

export const Routes = () => {
  return (
    <>
      <Switch>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.user} element={<UserPage />} />
        <Route path={routes.groupPage} element={<GroupPage />} />
        <Route path={routes.projectPage} element={<ProjectPage />} />
        <Route path={routes.root} element={<Navigate to={routes.home} />} />
        <Route element={<RequireAdmin />}>
          <Route path={routes.admin} element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Switch>
    </>
  );
};
