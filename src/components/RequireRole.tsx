import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";
import { UserRole } from "../types";

interface RequireRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente RequireRole
 * Valida se o usuário tem um dos roles permitidos
 * Se não autorizado, redireciona para login
 */
export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAuthorized = roles.includes(currentUser.role);

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Redireciona baseado no role do usuário
    const defaultPaths: Record<UserRole, string> = {
      admin: "/admin",
      manager: "/manager",
      teacher: "/teacher",
      student: "/student",
    };
    return <Navigate to={defaultPaths[currentUser.role]} replace />;
  }

  return <>{children}</>;
}
