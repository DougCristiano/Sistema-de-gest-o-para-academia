import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente ProtectedRoute com HOC pattern
 * Garante que o usuário está autenticado antes de acessar a rota
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
