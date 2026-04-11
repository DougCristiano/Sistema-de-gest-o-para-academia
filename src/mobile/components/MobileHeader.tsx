import React from "react";
import { useAuth } from "../../context/AuthContext";
import { mobileTheme } from "../theme";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface MobileHeaderProps {
  title?: string;
  showLogout?: boolean;
  onLogout?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = "Huron",
  showLogout = false,
  onLogout,
}) => {
  const { currentUser, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <div
      style={{
        background: mobileTheme.gradients.primary,
        color: "white",
        padding: `${mobileTheme.spacing.lg} 0`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: mobileTheme.spacing.lg,
        paddingRight: mobileTheme.spacing.lg,
        boxShadow: mobileTheme.shadows.md,
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div>
        <h1
          style={{
            ...mobileTheme.typography.h3,
            color: "white",
            margin: 0,
            marginBottom: "4px",
          }}
        >
          {title}
        </h1>
        {currentUser && (
          <p
            style={{
              ...mobileTheme.typography.caption,
              color: "rgba(255, 255, 255, 0.8)",
              margin: 0,
            }}
          >
            {currentUser.name}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={toggleTheme}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            border: "none",
            borderRadius: mobileTheme.borderRadius.full,
            padding: mobileTheme.spacing.sm,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255, 255, 255, 0.2)";
          }}
          title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        >
          {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {showLogout && (
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: mobileTheme.borderRadius.full,
              padding: mobileTheme.spacing.sm,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255, 255, 255, 0.2)";
            }}
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
