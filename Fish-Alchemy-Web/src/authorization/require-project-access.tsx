import { Navigate, Outlet, useParams } from "react-router-dom";
import { useUser } from "../authentication/use-auth";
import { useEffect, useState } from "react";
import api from "../config/axios";
import type { ApiResponse, ProjectGetDto } from "../constants/types";
import { Loader } from "@mantine/core";
import { routes } from "../routes/RouteIndex";

export const RequireProjectAccess = () => {
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const projectid = Number(id);
    if (!Number.isInteger(projectid)) {
      setAllowed(false);
      return;
    }
    api
      .get<ApiResponse<ProjectGetDto>>(`/api/projects/${projectid}`)
      .then((response) => {
        if (response.data.has_errors || !response.data.data) {
          setAllowed(false);
          return;
        }
        const groupid = response.data.data.group.id;
        setAllowed(user.groups.some((group) => group.id === groupid));
      })
      .catch(() => setAllowed(false));
  }, [id, user.groups]);

  if (allowed === null) {
    return <Loader />;
  }

  return allowed ? <Outlet /> : <Navigate to={routes.home} />;
};
