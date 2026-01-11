import { createContext, useContext, useState } from "react";
import { useAsyncRetry, useAsyncFn } from "react-use";
import { UserRole, type ApiResponse } from "../constants/types";
import type { ApiError } from "../constants/types";
import { LoginPage } from "../pages/login-page/login-page";
import type { UserGetDto } from "../constants/types";
import { StatusCodes } from "../constants/status-codes";
import { Loader } from "@mantine/core";
import api from "../config/axios";
import { notifications } from "@mantine/notifications";

type AuthState = {
  user: UserGetDto | null;
  errors: ApiError[];
  role: UserRole;
  refetchUser: () => void;
  logout: () => void;
};

const INITIAL_STATE: AuthState = {
  user: null,
  errors: [],
  role: UserRole.USER,
  refetchUser: undefined as any,
  logout: undefined as any,
};

interface RoleDto {
  role: string;
}

export const AuthContext = createContext<AuthState>(INITIAL_STATE);

export const AuthProvider = (props: any) => {
  const [errors, setErrors] = useState<ApiError[]>(INITIAL_STATE.errors);
  const [user, setUser] = useState<UserGetDto | null>(INITIAL_STATE.user);
  const [role, setRole] = useState<UserRole | null>();

  const fetchCurrentUser = useAsyncRetry(async () => {
    setErrors([]);

    const response = await api.get<GetUserResponse>(
      `/api/auth/get-current-user`
    );

    if (response.data.has_errors) {
      response.data.errors.forEach((err) => {
        console.error(err.message);
      });
      setErrors(response.data.errors);
      return response.data;
    }
    if (response.data.data) {
      setUser(response.data.data);
      await fetchRole();
    }
  }, []);

  const fetchRole = async () => {
    const response = await api.get<ApiResponse<RoleDto>>(`/api/auth/role`);

    if (response.data.has_errors) {
      notifications.show({
        title: "Error",
        message: "Error fetching user role",
        color: "red",
      });
    }

    if (response.data.data) {
      setRole(response.data.data.role as UserRole);
    }
  };

  const [, logoutUser] = useAsyncFn(async () => {
    setErrors([]);

    const response = await api.post(`/api/auth/logout`);

    if (response.status !== StatusCodes.OK) {
      console.log(`Error on logout: ${response.statusText}`);
      return response;
    }

    console.log("Successfully Logged Out!");

    if (response.status === StatusCodes.OK) {
      setUser(null);
    }

    return response;
  }, []);

  if (fetchCurrentUser.loading) {
    return <Loader />;
  }

  if (!user && !fetchCurrentUser.loading) {
    return <LoginPage fetchCurrentUser={fetchCurrentUser.retry} />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        errors,
        refetchUser: fetchCurrentUser.retry,
        logout: logoutUser,
      }}
      {...props}
    />
  );
};

export type GetUserResponse = ApiResponse<UserGetDto>;

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function useUser(): UserGetDto {
  const { user } = useContext(AuthContext);
  if (!user) {
    throw new Error(`useUser must be used within an authenticated app`);
  }
  return user;
}

export function useRole(): UserRole {
  const { role } = useContext(AuthContext);
  if (!role) {
    throw new Error("useRole must be used within an authenticated app");
  }
  return role;
}

export const mapUser = (user: any): UserGetDto => ({
  id: user.id,
  username: user.username,
  pfp_path: user.pfp_path,
  banner_path: user.banner_path,
  groups: user.groups,
  tickets: user.tickets,
});
