import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, User, Calendar } from "lucide-react";
import { Appointment, PROFILE_NAMES } from "../types";
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
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">
              {PROFILE_NAMES[appointment.profile]}
            </Badge>
            <Badge
              variant={
                appointment.status === "scheduled" ? "default" : "secondary"
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
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">
                {appointment.studentName}
              </span>
            </div>
          )}
          {showTeacher && (
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">
                Prof. {appointment.teacherName}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>
            {format(appointment.date, "dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
            {appointment.time} ({appointment.duration}min)
          </span>
        </div>
      </div>
    </Card>
  );
};
