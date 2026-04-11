import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Calendar, User } from "lucide-react";
import { Appointment, PROFILE_NAMES, PROFILE_COLORS } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentCardProps {
  appointment: Appointment;
  showStudent?: boolean;
  showTeacher?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showStudent = true,
  showTeacher = false,
}) => {
  const profileColor = PROFILE_COLORS[appointment.profile];

  return (
    <Card
      className="p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-l-4"
      style={{ borderLeftColor: profileColor }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline">{PROFILE_NAMES[appointment.profile]}</Badge>
            <Badge
              variant={
                appointment.status === "scheduled"
                  ? "default"
                  : appointment.status === "completed"
                    ? "secondary"
                    : "destructive"
              }
            >
              {appointment.status === "scheduled"
                ? "Agendado"
                : appointment.status === "completed"
                  ? "Concluído"
                  : "Cancelado"}
            </Badge>
          </div>
          {showStudent && (
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{appointment.studentName}</span>
            </div>
          )}
          {showTeacher && (
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Prof. {appointment.teacherName}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{format(appointment.date, "dd 'de' MMMM", { locale: ptBR })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>
            {appointment.time} ({appointment.duration}min)
          </span>
        </div>
      </div>
    </Card>
  );
};
