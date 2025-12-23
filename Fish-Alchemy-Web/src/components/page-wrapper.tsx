import type React from "react";
import { useUser } from "../authentication/use-auth";
import { NavBar } from "./nav-bar";
import { Container } from "@mantine/core";

interface PageWrapperProps {
  children?: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const user = useUser();

  return (
    <div className="content">
      <NavBar user={user} />
      <Container px={0} fluid style={{ marginTop: "10px" }}>
        {children}
      </Container>
    </div>
  );
};
