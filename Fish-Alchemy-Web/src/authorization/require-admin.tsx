import { UserRole } from "../constants/types";
import { Navigate, Outlet } from "react-router-dom";
import { routes } from "../routes/RouteIndex";
import { useRole } from "../authentication/use-auth";

export const RequireAdmin = () => {
  const role = useRole();

  return role === UserRole.ADMIN ? <Outlet /> : <Navigate to={routes.home} />;
};
