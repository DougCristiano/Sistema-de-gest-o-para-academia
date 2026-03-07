import React from "react";
import { Outlet } from "react-router";
import { AuthProvider } from "../context/AuthContext";

export const RootLayout: React.FC = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};
