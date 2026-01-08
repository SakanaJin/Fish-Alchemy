import { notifications } from "@mantine/notifications";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../constants/types";
import { EnvVars } from "./env-vars";
import type { FileWithPath } from "@mantine/dropzone";

const baseurl = EnvVars.apiBaseUrl;

const axiosInstance = axios.create({
  baseURL: baseurl,
  withCredentials: true,
});

type ErrorHandler = (response?: AxiosResponse) => Promise<any> | void;

const errorHandlers: Record<number, ErrorHandler> = {
  "400": (response) => {
    console.log("Bad Request. Check your validation for possible errors");
    return Promise.resolve(response);
  },
  "401": () => {
    console.log("Unauthenticated. Make sure you are signed in.");
    return Promise.resolve({
      data: null,
      has_errors: true,
      errors: [
        {
          property: "",
          message: "Sign in.",
        },
      ],
    } as ApiResponse<any>);
  },
  "403": () => {
    notifications.show({
      title: "Error",
      message: "You are not authorized to perform this action",
      color: "red",
    });
  },
  "404": (response) => {
    console.log(
      "Endpoint Not Found. Check the route you are hitting on your front end matches the route on the backend."
    );
    return Promise.resolve(response);
  },
  "500": (response) => {
    console.log(
      "Server Error. Check your backend for null reference exceptions or similar errors."
    );
    notifications.show({
      title: "Error",
      message: "Internal Server Error",
      color: "red",
    });
    return Promise.resolve(response);
  },
};

export async function handleResponseError(error: AxiosError) {
  if (error.response) {
    const response: AxiosResponse = error.response;
    const handler = errorHandlers[response.status];
    if (handler) {
      const result = await handler(error.response);
      if (result) {
        return result;
      }
    }
  }
}

axiosInstance.interceptors.response.use((x: any) => x, handleResponseError);

function post<T>(route: string, data: any) {
  var url = baseurl + route;
  return axiosInstance.post<T>(url, data, { withCredentials: true });
}

function get<T>(route: string) {
  var url = baseurl + route;
  return axiosInstance.get<T>(url, { withCredentials: true });
}

function put<T>(route: string, data: any) {
  var url = baseurl + route;
  return axiosInstance.put<T>(url, data, { withCredentials: true });
}

function patch<T>(route: string, data: any) {
  var url = baseurl + route;
  return axiosInstance.patch<T>(url, data, { withCredentials: true });
}

function remove<T>(route: string) {
  var url = baseurl + route;
  return axiosInstance.delete<T>(url, { withCredentials: true });
}

function patchnd<T>(route: string) {
  var url = baseurl + route;
  return axiosInstance.patch<T>(url, null, { withCredentials: true });
}

function patchf<T>(route: string, file: FileWithPath) {
  var url = baseurl + route;
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.patch<T>(url, formData, { withCredentials: true });
}

type Api = {
  post<T>(route: string, data?: any): Promise<AxiosResponse<T>>;
  get<T>(url: string): Promise<AxiosResponse<T>>;
  delete<T>(route: string): Promise<AxiosResponse<T>>;
  put<T>(route: string, data: any): Promise<AxiosResponse<T>>;
  patch<T>(route: string, data: any): Promise<AxiosResponse<T>>;
  patchnd<T>(route: string): Promise<AxiosResponse<T>>;
  patchf<T>(route: string, file: FileWithPath): Promise<AxiosResponse<T>>;
};

const api = {} as Api;

api.get = get;
api.put = put;
api.patch = patch;
api.post = post;
api.delete = remove;
api.patchnd = patchnd;
api.patchf = patchf;

export default api;
