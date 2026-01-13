import { Navigate, Outlet, useParams } from "react-router-dom";
import { useUser } from "../authentication/use-auth";
import { routes } from "../routes/RouteIndex";

export const RequireInGroup = () => {
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const groupid = Number(id);
  if (!Number.isInteger(groupid)) {
    return <Navigate to={routes.home} />;
  }
  const isMember = user.groups.some(
    (group) => group.id === groupid || group.creatorid === user.id
  );
  return isMember ? <Outlet /> : <Navigate to={routes.home} />;
};
