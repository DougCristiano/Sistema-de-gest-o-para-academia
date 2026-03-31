import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Home, Calendar, User, Newspaper, LogOut } from "lucide-react";
import { mobileTheme } from "../theme";
import { useAuth } from "../../context/AuthContext";

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/mobile/dashboard", icon: Home, label: "Home" },
    { path: "/mobile/booking", icon: Calendar, label: "Aulas" },
    { path: "/mobile/profile", icon: User, label: "Perfil" },
    { path: "/mobile/news", icon: Newspaper, label: "Notícias" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: mobileTheme.colors.surface,
        borderTop: `1px solid ${mobileTheme.colors.border}`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        height: "64px",
        boxShadow: mobileTheme.shadows.lg,
        zIndex: 50,
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: mobileTheme.spacing.sm,
              color: active ? mobileTheme.colors.primary : mobileTheme.colors.textSecondary,
              transition: "color 0.2s",
              flex: 1,
              height: "100%",
              justifyContent: "center",
            }}
          >
            <Icon size={24} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          padding: mobileTheme.spacing.sm,
          color: mobileTheme.colors.error,
          transition: "color 0.2s",
          flex: 1,
          height: "100%",
          justifyContent: "center",
        }}
      >
        <LogOut size={24} />
        <span style={{ fontSize: "12px" }}>Sair</span>
      </button>
    </div>
  );
};
