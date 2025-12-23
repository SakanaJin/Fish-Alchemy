import { useUser } from "../authentication/use-auth";
import { EnvVars } from "../config/env-vars";

export const NotFoundPage = () => {
  const user = useUser();

  const baseurl = EnvVars.apiBaseUrl;

  return (
    <>
      <header>page not found</header>
      <text>{user.username}</text>
      <img src={baseurl + user.banner_path}></img>
    </>
  );
};
