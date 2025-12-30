import { Route, Routes as Switch } from "react-router-dom";
import { NotFoundPage } from "../pages/not-found";
import { routes } from "./RouteIndex";
import { UserPage } from "../pages/user-pages/user-page";
import { GroupPage } from "../pages/group-pages/group-page";

export const Routes = () => {
  return (
    <>
      <Switch>
        <Route path={routes.user} element={<UserPage />} />
        <Route path={routes.groupPage} element={<GroupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Switch>
    </>
  );
};
