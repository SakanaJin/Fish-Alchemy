import { useUser } from "../authentication/use-auth";

export const NotFoundPage = () => {
  const user = useUser();

  return (
    <>
      <header>page not found</header>
      <text>{user.username}</text>
      <img src={`http://127.0.0.1:8000${user.banner_path}`}></img>
    </>
  );
};
