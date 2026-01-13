import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import api from "../config/axios";
import type { ApiResponse } from "../constants/types";
import { Loader } from "@mantine/core";
import { routes } from "../routes/RouteIndex";

export const RequireGraphAccess = () => {
  const { id } = useParams<{ id: string }>();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const graphid = Number(id);
    if (!Number.isInteger(graphid)) {
      setAllowed(false);
      return;
    }
    api
      .get<ApiResponse<boolean>>(`/graphs/${graphid}/auth`)
      .then((response) => {
        if (response.data.has_errors || !response.data.data) {
          setAllowed(false);
          return;
        }
        setAllowed(true);
      })
      .catch(() => setAllowed(false));
  }, [id]);

  if (allowed === null) {
    return <Loader />;
  }

  return allowed ? <Outlet /> : <Navigate to={routes.home} />;
};
