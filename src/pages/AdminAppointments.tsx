import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { mockAppointments, mockUsers } from "../data/mockData";
import { PROFILE_NAMES, PROFILE_COLORS, ProfileType } from "../types";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import { profilesService } from "../services/profiles.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export const AdminAppointments: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | "all">("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [viewMode, setViewMode] = useState<"week" | "day">("week");

  const managedProfiles = useMemo(() => {
    if (currentUser?.role !== "manager") {
      return [] as ProfileType[];
    }

    const managedServiceIds = profilesService.getManagedServiceIds(currentUser.id);
    const managedProfileIds = managedServiceIds.filter((serviceId): serviceId is ProfileType =>
      profilesService.isValidProfile(serviceId)
    );

    if (managedProfileIds.length > 0) {
      return managedProfileIds;
    }

    return currentUser.profiles;
  }, [currentUser]);

  const profileOptions = currentUser?.role === "manager" ? managedProfiles : profilesService.getAllProfiles();

  useEffect(() => {
    if (currentUser?.role !== "manager") {
      return;
    }

    if (managedProfiles.length === 1) {
      setSelectedProfile(managedProfiles[0]);
    }
  }, [currentUser?.role, managedProfiles]);

  // Filtrar professores
  const teachers = mockUsers.filter((user) => {
    if (user.role !== "teacher") {
      return false;
    }

    if (currentUser?.role !== "manager") {
      return true;
    }

    return user.profiles.some((profile) => managedProfiles.includes(profile));
  });

  // Aplicar filtros
  const filteredAppointments = mockAppointments.filter((apt) => {
    if (currentUser?.role === "manager" && !managedProfiles.includes(apt.profile)) {
      return false;
    }
    if (selectedProfile !== "all" && apt.profile !== selectedProfile) {return false;}
    if (selectedTeacher !== "all" && apt.teacherId !== selectedTeacher) {return false;}
    return true;
  });

  // Horários da agenda (6h às 22h)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // Dias da semana
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Função para pegar agendamentos de um horário específico
  const getAppointmentsForSlot = (date: Date, timeSlot: string) => {
    return filteredAppointments.filter((apt) => {
      if (!isSameDay(apt.date, date)) {return false;}
      return apt.time.startsWith(timeSlot.split(":")[0]);
    });
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "border-l-blue-500 bg-blue-50";
      case "completed":
        return "border-l-green-500 bg-green-50";
      case "cancelled":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Agenda de Aulas</h1>
        <p className="text-gray-600">
          {currentUser?.role === "manager"
            ? "Gerencie a agenda dos seus serviços associados"
            : "Visualize os agendamentos em formato de agenda"}
        </p>
      </div>

      {/* Controles e Filtros */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Navegação de Semana */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="ml-4">
                <p className="font-semibold text-lg">
                  {format(currentWeekStart, "dd 'de' MMMM", { locale: ptBR })} -{" "}
                  {format(addDays(currentWeekStart, 6), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold">Filtros:</h3>

            <div className="flex gap-3 flex-1">
              {/* Filtro de Serviço */}
              <Select
                value={selectedProfile}
                onValueChange={(value) => setSelectedProfile(value as ProfileType | "all")}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  {profileOptions.length > 1 && <SelectItem value="all">Todos os serviços</SelectItem>}
                  {profileOptions.map((profile) => (
                    <SelectItem key={profile} value={profile}>
                      {PROFILE_NAMES[profile]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro de Professor */}
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todos os professores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os professores</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Botão para limpar filtros */}
              {(selectedProfile !== "all" || selectedTeacher !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProfile("all");
                    setSelectedTeacher("all");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Agenda Semanal */}
      <Card className="p-6 overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="text-sm font-semibold text-gray-600 p-2">Horário</div>
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg ${isToday ? "bg-[#22c55e] text-white" : "bg-gray-100"}`}
                >
                  <div className="text-xs font-medium">
                    {format(day, "EEE", { locale: ptBR }).toUpperCase()}
                  </div>
                  <div className="text-lg font-bold">{format(day, "dd", { locale: ptBR })}</div>
                  <div className="text-xs">{format(day, "MMM", { locale: ptBR })}</div>
                </div>
              );
            })}
          </div>

          {/* Grid de horários */}
          <div className="space-y-1">
            {timeSlots.map((timeSlot, slotIndex) => (
              <div key={slotIndex} className="grid grid-cols-8 gap-2">
                {/* Coluna de horário */}
                <div className="text-sm text-gray-600 font-medium p-2 text-right">{timeSlot}</div>

                {/* Colunas dos dias */}
                {weekDays.map((day, dayIndex) => {
                  const appointments = getAppointmentsForSlot(day, timeSlot);

                  return (
                    <div
                      key={dayIndex}
                      className="min-h-[80px] border border-gray-200 rounded p-1 bg-white hover:bg-gray-50 transition-colors"
                    >
                      {appointments.length > 0 ? (
                        <div className="space-y-1">
                          {appointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={`text-xs p-2 rounded border-l-4 ${getStatusColor(apt.status)} cursor-pointer hover:shadow-md transition-shadow`}
                              title={`${apt.studentName} - ${apt.teacherName}`}
                            >
                              <div className="font-semibold truncate">{apt.time}</div>
                              <div className="truncate text-gray-700">{apt.studentName}</div>
                              <div className="truncate text-gray-600 text-[10px]">
                                {apt.teacherName}
                              </div>
                              <Badge
                                className="text-[10px] px-1 py-0 mt-1"
                                style={{
                                  backgroundColor: `${PROFILE_COLORS[apt.profile]}20`,
                                  color: PROFILE_COLORS[apt.profile],
                                }}
                              >
                                {PROFILE_NAMES[apt.profile]}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Legenda */}
      <Card className="p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-blue-500 bg-blue-50 rounded"></div>
            <span className="text-sm text-gray-600">Agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-green-500 bg-green-50 rounded"></div>
            <span className="text-sm text-gray-600">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-red-500 bg-red-50 rounded"></div>
            <span className="text-sm text-gray-600">Cancelado</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
