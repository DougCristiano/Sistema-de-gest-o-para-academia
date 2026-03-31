import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MobileLayout } from "../layouts/MobileLayout";
import { MobileCard } from "../components/MobileCard";
import { MobileButton } from "../components/MobileButton";
import { mobileTheme } from "../theme";
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  date: Date;
  time: string;
  location: string;
  teacher: string;
  discipline: string;
  status: "completed" | "scheduled" | "cancelled";
  notes?: string;
}

export const MobileAppointments: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      time: "07:00",
      location: "Quadra 1",
      teacher: "João Silva",
      discipline: "Voleibol",
      status: "completed",
      notes: "Ótimo desempenho!",
    },
    {
      id: "2",
      date: new Date(),
      time: "09:00",
      location: "Quadra 2",
      teacher: "Maria Santos",
      discipline: "Futsal",
      status: "scheduled",
    },
    {
      id: "3",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: "14:00",
      location: "Piscina",
      teacher: "Carlos Oliveira",
      discipline: "Natação",
      status: "scheduled",
    },
    {
      id: "4",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      time: "08:00",
      location: "Academia",
      teacher: "Ana Costa",
      discipline: "Musculação",
      status: "cancelled",
    },
  ]);

  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    return apt.status === filter;
  });

  const handleCancel = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "cancelled" as const } : apt
      )
    );
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      completed: {
        icon: CheckCircle,
        color: mobileTheme.colors.success,
        label: "Concluída",
        bg: mobileTheme.colors.success + "20",
      },
      scheduled: {
        icon: Calendar,
        color: mobileTheme.colors.primary,
        label: "Agendada",
        bg: mobileTheme.colors.primary + "20",
      },
      cancelled: {
        icon: AlertCircle,
        color: mobileTheme.colors.error,
        label: "Cancelada",
        bg: mobileTheme.colors.error + "20",
      },
    };
    return statusMap[status as keyof typeof statusMap];
  };

  return (
    <MobileLayout title="Aulas" showLogout>
      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: mobileTheme.spacing.md, marginBottom: mobileTheme.spacing.lg }}>
        {["all", "upcoming", "completed", "cancelled"].map((option) => (
          <MobileButton
            key={option}
            variant={filter === option ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(option as any)}
            style={{ flex: 1, fontSize: "12px", padding: "6px 8px" }}
          >
            {option === "all"
              ? "Todas"
              : option === "upcoming"
              ? "Próximas"
              : option === "completed"
              ? "Concluídas"
              : "Canceladas"}
          </MobileButton>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div>
          {filteredAppointments.map((appointment) => {
            const statusInfo = getStatusInfo(appointment.status);
            const StatusIcon = statusInfo.icon;

            return (
              <MobileCard
                key={appointment.id}
                style={{
                  borderLeft: `4px solid ${statusInfo.color}`,
                  opacity: appointment.status === "cancelled" ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: mobileTheme.spacing.md,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        ...mobileTheme.typography.h4,
                        margin: 0,
                        marginBottom: "4px",
                        color: mobileTheme.colors.textPrimary,
                        textDecoration:
                          appointment.status === "cancelled"
                            ? "line-through"
                            : "none",
                      }}
                    >
                      {appointment.discipline}
                    </h3>
                    <p
                      style={{
                        ...mobileTheme.typography.bodySmall,
                        margin: 0,
                        color: mobileTheme.colors.textSecondary,
                      }}
                    >
                      {appointment.teacher}
                    </p>
                  </div>
                  <div
                    style={{
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      padding: `${mobileTheme.spacing.xs} ${mobileTheme.spacing.md}`,
                      borderRadius: mobileTheme.borderRadius.full,
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <StatusIcon size={12} />
                    {statusInfo.label}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: mobileTheme.spacing.md,
                    marginBottom: mobileTheme.spacing.md,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={16} color={mobileTheme.colors.textSecondary} />
                    <span
                      style={{
                        ...mobileTheme.typography.bodySmall,
                        color: mobileTheme.colors.textSecondary,
                      }}
                    >
                      {format(appointment.date, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={16} color={mobileTheme.colors.textSecondary} />
                    <span
                      style={{
                        ...mobileTheme.typography.bodySmall,
                        color: mobileTheme.colors.textSecondary,
                      }}
                    >
                      {appointment.time}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: mobileTheme.spacing.md }}>
                  <MapPin size={16} color={mobileTheme.colors.textSecondary} />
                  <span
                    style={{
                      ...mobileTheme.typography.bodySmall,
                      color: mobileTheme.colors.textSecondary,
                    }}
                  >
                    {appointment.location}
                  </span>
                </div>

                {appointment.notes && (
                  <div
                    style={{
                      background: mobileTheme.colors.backgroundSecondary,
                      padding: mobileTheme.spacing.md,
                      borderRadius: mobileTheme.borderRadius.md,
                      marginBottom: mobileTheme.spacing.md,
                    }}
                  >
                    <p
                      style={{
                        ...mobileTheme.typography.bodySmall,
                        margin: 0,
                        color: mobileTheme.colors.textPrimary,
                      }}
                    >
                      <strong>Feedback:</strong> {appointment.notes}
                    </p>
                  </div>
                )}

                {appointment.status === "scheduled" && (
                  <MobileButton
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleCancel(appointment.id)}
                    style={{ color: mobileTheme.colors.error }}
                  >
                    <Trash2 size={14} />
                    Cancelar
                  </MobileButton>
                )}
              </MobileCard>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: mobileTheme.spacing.xl,
            color: mobileTheme.colors.textSecondary,
          }}
        >
          <Calendar size={48} style={{ opacity: 0.5, marginBottom: mobileTheme.spacing.lg }} />
          <p style={{ ...mobileTheme.typography.body }}>Nenhuma aula encontrada</p>
        </div>
      )}
    </MobileLayout>
  );
};
