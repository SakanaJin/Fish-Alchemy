import { Route, Routes as Switch, Navigate } from "react-router-dom";
// import { routes } from "./RouteIndex";
// import { useUser } from "../authentication/use-auth";

import { NotFoundPage } from "../pages/not-found";

export const Routes = () => {
  //   const user = useUser();

  return (
    <>
      <Switch>
        <Route path="*" element={<NotFoundPage />} />
      </Switch>
    </>
  );
};
