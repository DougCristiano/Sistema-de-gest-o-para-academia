import React from "react";
import { MobileHeader, MobileBottomNav } from "../components";
import { mobileTheme } from "../theme";

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showLogout?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title = "Huron",
  showLogout = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: mobileTheme.colors.background,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <MobileHeader title={title} showLogout={showLogout} />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: "80px", // Space for bottom nav
          padding: `${mobileTheme.spacing.lg}`,
          paddingTop: mobileTheme.spacing.lg,
        }}
      >
        {children}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
