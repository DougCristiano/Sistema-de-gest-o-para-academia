import React from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Calendar,
  CalendarCheck,
  Flame,
  Clock,
  Target,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import { PROFILE_NAMES, PROFILE_COLORS } from "../types";
import { mockAthletes, mockAppointments } from "../data/mockData";
import { useNavigate } from "react-router";

const PLAN_LABELS: Record<string, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

const PLAN_CHECKIN_LIMITS: Record<string, number> = {
  mensal: 20,
  trimestral: 20,
  semestral: 22,
  anual: 24,
};

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Find athlete data for current user
  const myAthleteData = mockAthletes.find((a) => a.email === currentUser?.email);
  const userProfiles = currentUser?.profiles || [];

  // Get upcoming appointments
  const myAppointments = mockAppointments
    .filter((apt) => apt.studentId === currentUser?.id && apt.status === "scheduled")
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  if (!myAthleteData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Meu Painel</h1>
        <Card className="p-8 text-center">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Bem-vindo à Huron!</h2>
          <p className="text-gray-600 mb-6">
            Seus dados de treino aparecerão aqui assim que começar.
          </p>
          <Button onClick={() => navigate("/student/booking")}>Agendar Primeira Aula</Button>
        </Card>
      </div>
    );
  }

  const limit = PLAN_CHECKIN_LIMITS[myAthleteData.plan] || 20;
  const remaining = Math.max(0, limit - myAthleteData.checkInsThisMonth);
  const checkinPct = Math.min(100, Math.round((myAthleteData.checkInsThisMonth / limit) * 100));
  const completionRate =
    myAthleteData.totalSessions > 0
      ? Math.round((myAthleteData.completedSessions / myAthleteData.totalSessions) * 100)
      : 0;
  const profileColor = PROFILE_COLORS[myAthleteData.profile];

  const formatDate = (d: Date) =>
    d.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Olá, {currentUser?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">Veja seu progresso e próximas aulas</p>
      </div>

      {/* Enrolled Services */}
      <Card className="p-5 bg-gradient-to-r from-primary/10 to-[#3b82f6]/10 border-l-4 border-primary">
        <h3 className="font-semibold mb-3 text-sm text-foreground">Seus Serviços Matriculados</h3>
        <div className="flex flex-wrap gap-2">
          {userProfiles.map((profile) => (
            <Badge
              key={profile}
              style={{
                backgroundColor: `${PROFILE_COLORS[profile]}15`,
                color: PROFILE_COLORS[profile],
                borderColor: PROFILE_COLORS[profile],
              }}
              variant="outline"
              className="text-sm px-3 py-1"
            >
              {PROFILE_NAMES[profile]}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plan & Check-ins */}
        <Card className="p-5 md:col-span-2 border-l-4" style={{ borderLeftColor: profileColor }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg text-foreground">Meu Plano</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  style={{
                    backgroundColor: `${profileColor}15`,
                    color: profileColor,
                  }}
                  className="text-sm"
                >
                  {PLAN_LABELS[myAthleteData.plan]}
                </Badge>
                <span className="text-sm text-gray-500">
                  · {PROFILE_NAMES[myAthleteData.profile]}
                </span>
              </div>
            </div>
            {myAthleteData.goal && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Target className="w-4 h-4" />
                {myAthleteData.goal}
              </div>
            )}
          </div>

          {/* Check-in Progress */}
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Check-ins este mês</span>
              <span className="text-2xl font-bold" style={{ color: profileColor }}>
                {myAthleteData.checkInsThisMonth}{" "}
                <span className="text-sm font-normal text-gray-400">/ {limit}</span>
              </span>
            </div>
            <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${checkinPct}%`,
                  backgroundColor:
                    checkinPct >= 75 ? "#22c55e" : checkinPct >= 50 ? "#eab308" : "#ef4444",
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-semibold ${remaining <= 5 ? "text-red-500" : "text-gray-700"}`}
              >
                {remaining} check-ins restantes
              </span>
              <span className="text-xs text-gray-500">
                Mês anterior: {myAthleteData.checkInsLastMonth}
              </span>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-50">
              <Flame
                className={`w-6 h-6 ${myAthleteData.streak >= 10 ? "text-orange-500" : myAthleteData.streak >= 4 ? "text-amber-400" : "text-gray-400"}`}
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{myAthleteData.streak}</p>
              <p className="text-xs text-gray-500">Semanas consecutivas</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${profileColor}10` }}>
              <TrendingUp className="w-6 h-6" style={{ color: profileColor }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-xs text-gray-500">Aproveitamento</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-50">
              <CalendarCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myAthleteData.completedSessions}</p>
              <p className="text-xs text-gray-500">Sessões realizadas</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Session breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 text-center hover:shadow-lg hover:scale-102 transition-all duration-300 border-t-4 border-t-green-500">
          <p className="text-2xl font-bold text-green-600">{myAthleteData.completedSessions}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Realizadas</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-lg hover:scale-102 transition-all duration-300 border-t-4 border-t-amber-500">
          <p className="text-2xl font-bold text-amber-600">{myAthleteData.cancelledSessions}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Canceladas</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-lg hover:scale-102 transition-all duration-300 border-t-4 border-t-red-500">
          <p className="text-2xl font-bold text-red-500">{myAthleteData.noShowSessions}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Faltas</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-lg hover:scale-102 transition-all duration-300 border-t-4" style={{ borderTopColor: profileColor }}>
          <p className="text-2xl font-bold" style={{ color: profileColor }}>
            {myAthleteData.totalSessions}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Total de sessões</p>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="p-5 border-l-4" style={{ borderLeftColor: profileColor }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5" style={{ color: profileColor }} />
            Próximas Aulas
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={() => navigate("/student/appointments")}
          >
            Ver todas <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {myAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">Nenhuma aula agendada</p>
            <Button onClick={() => navigate("/student/booking")} size="sm">
              Agendar Aula
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {myAppointments.map((apt) => {
              const aptColor = PROFILE_COLORS[apt.profile];
              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-gray-500">{formatDate(apt.date)}</p>
                    <p className="text-lg font-bold">{apt.time}</p>
                  </div>
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: aptColor }} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{apt.teacherName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge
                        style={{
                          backgroundColor: `${aptColor}15`,
                          color: aptColor,
                        }}
                        className="text-xs px-2 py-0"
                      >
                        {PROFILE_NAMES[apt.profile]}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apt.duration}min
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Teacher Info */}
      <Card className="p-5 border-l-4 hover:shadow-lg transition-all duration-300" style={{ borderLeftColor: profileColor }}>
        <h2 className="font-bold text-lg mb-3 text-foreground">Meu Professor</h2>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md hover:shadow-lg transition-shadow"
            style={{ backgroundColor: profileColor }}
          >
            {myAthleteData.teacher.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-lg text-foreground">{myAthleteData.teacher}</p>
            <p className="text-sm text-muted-foreground">{PROFILE_NAMES[myAthleteData.profile]}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
