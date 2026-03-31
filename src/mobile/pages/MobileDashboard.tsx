import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { MobileLayout } from "../layouts/MobileLayout";
import { MobileCard } from "../components/MobileCard";
import { MobileButton } from "../components/MobileButton";
import { mobileTheme } from "../theme";
import {
  Calendar,
  Newspaper,
  User,
  TrendingUp,
  Award,
  Flame,
  ArrowRight,
} from "lucide-react";

export const MobileDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: "Próximas Aulas", value: "3", icon: Calendar, color: mobileTheme.colors.primary },
    { label: "Sequência", value: "12", icon: Award, color: mobileTheme.colors.success },
  ];

  const quickActions = [
    { label: "Inscrever em Aula", icon: Calendar, color: "#6366f1", path: "/mobile/booking" },
    { label: "Minhas Aulas", icon: TrendingUp, color: "#8b5cf6", path: "/mobile/appointments" },
    { label: "Notícias", icon: Newspaper, color: "#ec4899", path: "/mobile/news" },
    { label: "Perfil", icon: User, color: "#10b981", path: "/mobile/profile" },
  ];

  return (
    <MobileLayout title="Dashboard" showLogout>
      {/* Welcome Card */}
      <MobileCard gradient style={{ marginBottom: mobileTheme.spacing.lg }}>
        <h2
          style={{
            ...mobileTheme.typography.h3,
            color: "white",
            margin: 0,
            marginBottom: "8px",
          }}
        >
          Bem-vindo, {currentUser?.name.split(" ")[0]}!
        </h2>
        <p
          style={{
            ...mobileTheme.typography.bodySmall,
            color: "rgba(255, 255, 255, 0.9)",
            margin: 0,
          }}
        >
          Vamos continuar seu treino de hoje?
        </p>
      </MobileCard>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: mobileTheme.spacing.md,
          marginBottom: mobileTheme.spacing.lg,
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <MobileCard key={stat.label}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: mobileTheme.spacing.md,
                  marginBottom: mobileTheme.spacing.sm,
                }}
              >
                <div
                  style={{
                    background: stat.color + "20",
                    padding: mobileTheme.spacing.md,
                    borderRadius: mobileTheme.borderRadius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={stat.color} />
                </div>
              </div>
              <p
                style={{
                  ...mobileTheme.typography.h3,
                  margin: 0,
                  marginBottom: "4px",
                  color: stat.color,
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  ...mobileTheme.typography.caption,
                  margin: 0,
                  color: mobileTheme.colors.textSecondary,
                }}
              >
                {stat.label}
              </p>
            </MobileCard>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: mobileTheme.spacing.lg }}>
        <h3
          style={{
            ...mobileTheme.typography.h4,
            margin: 0,
            marginBottom: mobileTheme.spacing.md,
            color: mobileTheme.colors.textPrimary,
          }}
        >
          Ações Rápidas
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: mobileTheme.spacing.md }}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                style={{
                  background: "white",
                  border: `1px solid ${mobileTheme.colors.border}`,
                  borderRadius: mobileTheme.borderRadius.lg,
                  padding: mobileTheme.spacing.lg,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: mobileTheme.spacing.md,
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    mobileTheme.shadows.md;
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLButtonElement).style.transform = "none";
                }}
              >
                <div
                  style={{
                    background: action.color + "20",
                    padding: mobileTheme.spacing.md,
                    borderRadius: mobileTheme.borderRadius.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color={action.color} />
                </div>
                <p
                  style={{
                    ...mobileTheme.typography.bodySmall,
                    margin: 0,
                    color: mobileTheme.colors.textPrimary,
                    fontWeight: 600,
                  }}
                >
                  {action.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <MobileCard>
        <h3
          style={{
            ...mobileTheme.typography.h4,
            margin: 0,
            marginBottom: mobileTheme.spacing.md,
            color: mobileTheme.colors.textPrimary,
          }}
        >
          Atividade Recente
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: mobileTheme.spacing.md }}>
          {[
            { activity: "Aula de Voleibol concluída", time: "Hoje às 10:00" },
            { activity: "Nova promoção em Natação", time: "Ontem" },
            { activity: "Ganhou badge 🏆", time: "2 dias atrás" },
          ].map((item, index) => (
            <div key={index} style={{ paddingBottom: mobileTheme.spacing.md, borderBottom: index < 2 ? `1px solid ${mobileTheme.colors.border}` : "none" }}>
              <p
                style={{
                  ...mobileTheme.typography.bodySmall,
                  margin: 0,
                  marginBottom: "4px",
                  color: mobileTheme.colors.textPrimary,
                }}
              >
                {item.activity}
              </p>
              <p
                style={{
                  ...mobileTheme.typography.caption,
                  margin: 0,
                  color: mobileTheme.colors.textSecondary,
                }}
              >
                {item.time}
              </p>
            </div>
          ))}
        </div>
      </MobileCard>
    </MobileLayout>
  );
};
