import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Users,
  Search,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarCheck,
  Flame,
  AlertTriangle,
  Mail,
  Phone,
  Target,
  BarChart3,
  Eye,
  ChevronUp,
  Clock,
} from "lucide-react";
import { PROFILE_NAMES, PROFILE_COLORS } from "../types";
import { mockAthletes, MockAthlete } from "../data/mockData";

const STATUS_CONFIG = {
  ativo: { label: "Ativo", color: "bg-green-100 text-green-800" },
  inativo: { label: "Inativo", color: "bg-red-100 text-red-800" },
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-800" },
};

const PLAN_LABELS: Record<string, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

// Check-in limits per plan per month
const PLAN_CHECKIN_LIMITS: Record<string, number> = {
  mensal: 20,
  trimestral: 20,
  semestral: 22,
  anual: 24,
};

export const TeacherStudents: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showOnlyLowCheckins, setShowOnlyLowCheckins] = useState(false);

  const myStudents = useMemo(() => {
    if (!currentUser) return [];
    const teacherName = currentUser.name;
    let students = mockAthletes.filter((a) => a.teacher === teacherName);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      students = students.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term),
      );
    }

    if (showOnlyLowCheckins) {
      students = students.filter((a) => {
        const limit = PLAN_CHECKIN_LIMITS[a.plan] || 20;
        return a.checkInsThisMonth < limit * 0.5;
      });
    }

    return students;
  }, [currentUser, searchTerm, showOnlyLowCheckins]);

  const totalStudents = currentUser
    ? mockAthletes.filter((a) => a.teacher === currentUser.name).length
    : 0;
  const activeStudents = currentUser
    ? mockAthletes.filter(
        (a) => a.teacher === currentUser.name && a.status === "ativo",
      ).length
    : 0;
  const trainingNow = currentUser
    ? mockAthletes.filter(
        (a) => a.teacher === currentUser.name && a.isTrainingNow,
      ).length
    : 0;
  const lowCheckinStudents = currentUser
    ? mockAthletes.filter((a) => {
        if (a.teacher !== currentUser.name) return false;
        const limit = PLAN_CHECKIN_LIMITS[a.plan] || 20;
        return a.checkInsThisMonth < limit * 0.5 && a.status === "ativo";
      }).length
    : 0;

  const getRemainingCheckins = (athlete: MockAthlete) => {
    const limit = PLAN_CHECKIN_LIMITS[athlete.plan] || 20;
    return Math.max(0, limit - athlete.checkInsThisMonth);
  };

  const getCheckinPercentage = (athlete: MockAthlete) => {
    const limit = PLAN_CHECKIN_LIMITS[athlete.plan] || 20;
    return Math.min(100, Math.round((athlete.checkInsThisMonth / limit) * 100));
  };

  const getCheckInTrend = (current: number, previous: number) => {
    if (current > previous)
      return {
        icon: TrendingUp,
        color: "text-green-600",
        label: `+${current - previous}`,
      };
    if (current < previous)
      return {
        icon: TrendingDown,
        color: "text-red-500",
        label: `${current - previous}`,
      };
    return { icon: Minus, color: "text-gray-400", label: "0" };
  };

  const completionRate = (a: MockAthlete) =>
    a.totalSessions === 0
      ? 0
      : Math.round((a.completedSessions / a.totalSessions) * 100);
  const formatDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "—";
  const formatDateTime = (d: Date | null) =>
    d
      ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
        " às " +
        d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Meus Alunos</h1>
        <p className="text-gray-600">Alunos que você atende diretamente</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold">{totalStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ativos</p>
              <p className="text-xl font-bold">{activeStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-50">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Treinando Agora</p>
              <p className="text-xl font-bold">{trainingNow}</p>
            </div>
          </div>
          {trainingNow > 0 && (
            <div className="absolute top-2 right-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          )}
        </Card>
        <Card
          className={`p-4 ${lowCheckinStudents > 0 ? "border-amber-300 border-2" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Baixa Frequência</p>
              <p className="text-xl font-bold">{lowCheckinStudents}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <button
            onClick={() => setShowOnlyLowCheckins(!showOnlyLowCheckins)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${showOnlyLowCheckins ? "bg-amber-500 text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <AlertTriangle className="w-4 h-4" />
            Baixa Frequência
          </button>
        </div>
      </Card>

      {/* Students List */}
      {myStudents.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Nenhum aluno encontrado</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {myStudents.map((athlete) => {
            const isExpanded = expandedId === athlete.id;
            const trend = getCheckInTrend(
              athlete.checkInsThisMonth,
              athlete.checkInsLastMonth,
            );
            const TrendIcon = trend.icon;
            const profileColor = PROFILE_COLORS[athlete.profile];
            const remaining = getRemainingCheckins(athlete);
            const checkinPct = getCheckinPercentage(athlete);
            const limit = PLAN_CHECKIN_LIMITS[athlete.plan] || 20;
            const isLow =
              athlete.checkInsThisMonth < limit * 0.5 &&
              athlete.status === "ativo";
            const rate = completionRate(athlete);
            const statusCfg = STATUS_CONFIG[athlete.status];

            return (
              <Card
                key={athlete.id}
                className={`overflow-hidden ${isLow ? "border-l-4 border-l-amber-400" : ""}`}
              >
                {/* Main row */}
                <div className="p-4 flex items-center gap-4">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: profileColor }}
                    >
                      {athlete.name.charAt(0)}
                    </div>
                    {athlete.isTrainingNow && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white"></span>
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{athlete.name}</p>
                      <Badge className={`${statusCfg.color} text-xs`}>
                        {statusCfg.label}
                      </Badge>
                      <Badge
                        style={{
                          backgroundColor: `${profileColor}15`,
                          color: profileColor,
                        }}
                        className="text-xs"
                      >
                        {PROFILE_NAMES[athlete.profile]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {PLAN_LABELS[athlete.plan]} ·{" "}
                      {athlete.goal || "Sem objetivo definido"}
                    </p>
                  </div>

                  {/* Check-in progress */}
                  <div className="hidden md:block w-48">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Check-ins</span>
                      <span className="font-semibold">
                        {athlete.checkInsThisMonth}/{limit}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${checkinPct}%`,
                          backgroundColor:
                            checkinPct >= 75
                              ? "#22c55e"
                              : checkinPct >= 50
                                ? "#eab308"
                                : "#ef4444",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span
                        className={`flex items-center gap-0.5 ${trend.color}`}
                      >
                        <TrendIcon className="w-3 h-3" />
                        {trend.label}
                      </span>
                      <span
                        className={`font-medium ${remaining <= 5 ? "text-red-500" : "text-gray-500"}`}
                      >
                        {remaining} restantes
                      </span>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="hidden lg:flex items-center gap-1.5">
                    <Flame
                      className={`w-5 h-5 ${athlete.streak >= 10 ? "text-orange-500" : athlete.streak >= 4 ? "text-amber-400" : "text-gray-300"}`}
                    />
                    <div>
                      <p className="font-bold text-sm">{athlete.streak}</p>
                      <p className="text-xs text-gray-400">semanas</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : athlete.id)
                    }
                    className="h-9 px-3"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="space-y-2 text-sm">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> Contato
                        </h4>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {athlete.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {athlete.phone}
                        </div>
                        {athlete.goal && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Target className="w-3.5 h-3.5 text-gray-400" />
                            {athlete.goal}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarCheck className="w-3.5 h-3.5 text-gray-400" />
                          Desde {formatDate(athlete.enrolledSince)}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {PLAN_LABELS[athlete.plan]}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <Activity className="w-4 h-4" /> Sessões
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-white border text-center">
                            <p className="text-lg font-bold text-green-600">
                              {athlete.completedSessions}
                            </p>
                            <p className="text-xs text-gray-500">Realizadas</p>
                          </div>
                          <div className="p-2 rounded-lg bg-white border text-center">
                            <p className="text-lg font-bold text-amber-600">
                              {athlete.cancelledSessions}
                            </p>
                            <p className="text-xs text-gray-500">Canceladas</p>
                          </div>
                          <div className="p-2 rounded-lg bg-white border text-center">
                            <p className="text-lg font-bold text-red-500">
                              {athlete.noShowSessions}
                            </p>
                            <p className="text-xs text-gray-500">Faltas</p>
                          </div>
                          <div className="p-2 rounded-lg bg-white border text-center">
                            <p
                              className="text-lg font-bold"
                              style={{ color: profileColor }}
                            >
                              {rate}%
                            </p>
                            <p className="text-xs text-gray-500">
                              Aproveitamento
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4" /> Check-ins do Mês
                        </h4>
                        <div className="p-3 rounded-lg bg-white border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              Usados
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: profileColor }}
                            >
                              {athlete.checkInsThisMonth} / {limit}
                            </span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-2">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${checkinPct}%`,
                                backgroundColor:
                                  checkinPct >= 75
                                    ? "#22c55e"
                                    : checkinPct >= 50
                                      ? "#eab308"
                                      : "#ef4444",
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              Restantes:{" "}
                              <strong
                                className={
                                  remaining <= 5
                                    ? "text-red-500"
                                    : "text-gray-700"
                                }
                              >
                                {remaining}
                              </strong>
                            </span>
                            <span>
                              Último: {formatDateTime(athlete.lastCheckIn)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Flame
                            className={`w-4 h-4 ${athlete.streak >= 10 ? "text-orange-500" : "text-gray-400"}`}
                          />
                          <span className="text-gray-600">
                            {athlete.streak} semanas consecutivas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
