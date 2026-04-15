import React from "react";
import { Outlet } from "react-router";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { CheckInsProvider } from "../context/CheckInsContext";

export const RootLayout: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CheckInsProvider>
          <Outlet />
        </CheckInsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
