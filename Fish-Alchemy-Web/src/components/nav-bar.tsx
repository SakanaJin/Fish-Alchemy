import React from "react";
import { UserRole, type UserGetDto } from "../constants/types";
import {
  Avatar,
  useMantineColorScheme,
  Paper,
  Menu,
  Burger,
  Button,
  Flex,
  Space,
} from "@mantine/core";
import { useAuth, useRole } from "../authentication/use-auth";
import { useNavigate } from "react-router-dom";
import { routes } from "../routes/RouteIndex";
import { EnvVars } from "../config/env-vars";
import { useDisclosure } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faMoon,
  faSignOut,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { modals } from "@mantine/modals";

interface NavBarProps {
  user?: UserGetDto;
}
const baseurl = EnvVars.apiBaseUrl;

export const NavBar: React.FC<NavBarProps> = ({ user }) => {
  const { logout } = useAuth();
  const role = useRole();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();

  return (
    <header style={{ height: "56px", marginBottom: "20px" }}>
      <Paper
        shadow="sm"
        radius="md"
        withBorder
        p="xl"
        style={{
          height: "56px",
          marginLeft: "10px",
          marginRight: "10px",
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Flex align="center">
          <Avatar
            src={`${baseurl}${user?.pfp_path}`}
            onClick={() => navigate(routes.user.replace(":id", `${user?.id}`))}
            style={{ cursor: "pointer" }}
          />
          <Space w="sm" />
          <Button
            variant="subtle"
            size="lg"
            onClick={() => navigate(routes.home)}
          >
            Home
          </Button>
          {role === UserRole.ADMIN && (
            <>
              <Space w="sm" />
              <Button
                variant="subtle"
                size="lg"
                onClick={() => navigate(routes.admin)}
              >
                Admin
              </Button>
            </>
          )}
        </Flex>
        <Menu onChange={toggle}>
          <Menu.Target>
            <Burger opened={opened} onClick={toggle} />
          </Menu.Target>
          <Menu.Dropdown>
            {dark ? (
              <Menu.Item
                leftSection={<FontAwesomeIcon icon={faMoon} />}
                onClick={() => toggleColorScheme()}
              >
                Dark Mode
              </Menu.Item>
            ) : (
              <Menu.Item
                leftSection={<FontAwesomeIcon icon={faSun} />}
                onClick={() => toggleColorScheme()}
              >
                Light Mode
              </Menu.Item>
            )}
            <Menu.Item
              leftSection={<FontAwesomeIcon icon={faKey} />}
              onClick={() => {
                modals.openContextModal({
                  modal: "changepass",
                  title: "Change Password",
                  centered: true,
                  innerProps: {},
                });
              }}
            >
              Change Password
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<FontAwesomeIcon icon={faSignOut} />}
              onClick={() => logout()}
              color="red"
            >
              Sign Out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Paper>
    </header>
  );
};
