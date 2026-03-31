import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MobileLayout } from "../layouts/MobileLayout";
import { MobileCard } from "../components/MobileCard";
import { MobileButton } from "../components/MobileButton";
import { mobileTheme } from "../theme";
import { Calendar, Clock, MapPin, User, Check, X } from "lucide-react";
import { mockAppointments } from "../../data/mockData";
import { format, isToday, isTomorrow, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  date: Date;
  time: string;
  location: string;
  teacher: string;
  discipline: string;
  isBooked: boolean;
}

export const MobileBooking: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<"today" | "tomorrow" | "week">("today");
  const [bookedAppointments, setBookedAppointments] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Mock appointments
  const allAppointments: Appointment[] = [
    {
      id: "1",
      date: new Date(),
      time: "07:00",
      location: "Quadra 1",
      teacher: "João Silva",
      discipline: "Voleibol",
      isBooked: bookedAppointments.includes("1"),
    },
    {
      id: "2",
      date: new Date(),
      time: "09:00",
      location: "Quadra 2",
      teacher: "Maria Santos",
      discipline: "Futsal",
      isBooked: bookedAppointments.includes("2"),
    },
    {
      id: "3",
      date: new Date(),
      time: "14:00",
      location: "Piscina",
      teacher: "Carlos Oliveira",
      discipline: "Natação",
      isBooked: bookedAppointments.includes("3"),
    },
    {
      id: "4",
      date: addDays(new Date(), 1),
      time: "08:00",
      location: "Academia",
      teacher: "Ana Costa",
      discipline: "Musculação",
      isBooked: bookedAppointments.includes("4"),
    },
  ];

  const filterAppointments = () => {
    if (selectedDate === "today") {
      return allAppointments.filter((apt) => isToday(apt.date));
    }
    if (selectedDate === "tomorrow") {
      return allAppointments.filter((apt) => isTomorrow(apt.date));
    }
    return allAppointments;
  };

  const handleBooking = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const confirmBooking = () => {
    if (selectedAppointment) {
      if (bookedAppointments.includes(selectedAppointment.id)) {
        setBookedAppointments((prev) =>
          prev.filter((id) => id !== selectedAppointment.id)
        );
      } else {
        setBookedAppointments((prev) => [...prev, selectedAppointment.id]);
      }
      setShowModal(false);
      setSelectedAppointment(null);
    }
  };

  const appointments = filterAppointments();
  const isBooked = selectedAppointment
    ? bookedAppointments.includes(selectedAppointment.id)
    : false;

  return (
    <MobileLayout title="Aulas" showLogout>
      {/* Date Filter */}
      <div style={{ display: "flex", gap: mobileTheme.spacing.md, marginBottom: mobileTheme.spacing.lg }}>
        {["today", "tomorrow", "week"].map((option) => (
          <MobileButton
            key={option}
            variant={selectedDate === option ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedDate(option as any)}
            style={{ flex: 1 }}
          >
            {option === "today"
              ? "Hoje"
              : option === "tomorrow"
              ? "Amanhã"
              : "Semana"}
          </MobileButton>
        ))}
      </div>

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <div>
          {appointments.map((appointment) => (
            <MobileCard
              key={appointment.id}
              interactive
              onClick={() => handleBooking(appointment)}
              style={{
                opacity: appointment.isBooked ? 0.7 : 1,
                borderLeft: `4px solid ${
                  appointment.isBooked ? mobileTheme.colors.success : mobileTheme.colors.primary
                }`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: mobileTheme.spacing.md }}>
                <div>
                  <h3
                    style={{
                      ...mobileTheme.typography.h4,
                      margin: 0,
                      marginBottom: "8px",
                      color: mobileTheme.colors.textPrimary,
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
                {appointment.isBooked && (
                  <div
                    style={{
                      background: mobileTheme.colors.success + "20",
                      color: mobileTheme.colors.success,
                      padding: `${mobileTheme.spacing.sm} ${mobileTheme.spacing.md}`,
                      borderRadius: mobileTheme.borderRadius.full,
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Check size={14} />
                    Inscrito
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: mobileTheme.spacing.md,
                  marginTop: mobileTheme.spacing.md,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock
                    size={16}
                    color={mobileTheme.colors.textSecondary}
                  />
                  <span style={{ ...mobileTheme.typography.bodySmall, color: mobileTheme.colors.textSecondary }}>
                    {appointment.time}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin
                    size={16}
                    color={mobileTheme.colors.textSecondary}
                  />
                  <span style={{ ...mobileTheme.typography.bodySmall, color: mobileTheme.colors.textSecondary }}>
                    {appointment.location}
                  </span>
                </div>
              </div>
            </MobileCard>
          ))}
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
          <p style={{ ...mobileTheme.typography.body }}>Nenhuma aula disponível</p>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedAppointment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 100,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: mobileTheme.colors.surface,
              borderTopLeftRadius: mobileTheme.borderRadius.xl,
              borderTopRightRadius: mobileTheme.borderRadius.xl,
              padding: mobileTheme.spacing.xl,
              width: "100%",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                ...mobileTheme.typography.h2,
                marginTop: 0,
                marginBottom: mobileTheme.spacing.lg,
                color: mobileTheme.colors.textPrimary,
              }}
            >
              {selectedAppointment.discipline}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: mobileTheme.spacing.lg,
                marginBottom: mobileTheme.spacing.xl,
              }}
            >
              <div>
                <p
                  style={{
                    ...mobileTheme.typography.caption,
                    color: mobileTheme.colors.textSecondary,
                    marginBottom: "4px",
                  }}
                >
                  Horário
                </p>
                <p
                  style={{
                    ...mobileTheme.typography.h4,
                    margin: 0,
                    color: mobileTheme.colors.primary,
                  }}
                >
                  {selectedAppointment.time}
                </p>
              </div>

              <div>
                <p
                  style={{
                    ...mobileTheme.typography.caption,
                    color: mobileTheme.colors.textSecondary,
                    marginBottom: "4px",
                  }}
                >
                  Local
                </p>
                <p
                  style={{
                    ...mobileTheme.typography.h4,
                    margin: 0,
                    color: mobileTheme.colors.primary,
                  }}
                >
                  {selectedAppointment.location}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: mobileTheme.spacing.xl }}>
              <p
                style={{
                  ...mobileTheme.typography.caption,
                  color: mobileTheme.colors.textSecondary,
                  marginBottom: "4px",
                }}
              >
                Professor
              </p>
              <p
                style={{
                  ...mobileTheme.typography.body,
                  margin: 0,
                  color: mobileTheme.colors.textPrimary,
                }}
              >
                {selectedAppointment.teacher}
              </p>
            </div>

            <div style={{ display: "flex", gap: mobileTheme.spacing.md }}>
              <MobileButton
                variant="outline"
                fullWidth
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </MobileButton>
              <MobileButton
                variant={isBooked ? "ghost" : "primary"}
                fullWidth
                onClick={confirmBooking}
              >
                {isBooked ? (
                  <>
                    <X size={16} /> Cancelar inscrição
                  </>
                ) : (
                  <>
                    <Check size={16} /> Confirmar inscrição
                  </>
                )}
              </MobileButton>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};
