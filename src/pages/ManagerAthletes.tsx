import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Users,
  Search,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CalendarCheck,
  Flame,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Target,
  Filter,
  CircleDot,
  BarChart3,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { PROFILE_NAMES, PROFILE_COLORS } from "../types";
import { mockAthletes, mockCheckInHistory, MockAthlete } from "../data/mockData";
import { BarChart , XAxis , CartesianGrid , ResponsiveContainer } from "recharts";

type StatusFilter = "todos" | "ativo" | "inativo" | "pendente";
type SortField = "name" | "checkInsThisMonth" | "totalSessions" | "streak" | "lastCheckIn";
type SortDir = "asc" | "desc";

const STATUS_CONFIG = {
  ativo: {
    label: "Ativo",
    color: "bg-green-100 text-green-800",
    dot: "bg-green-500",
  },
  inativo: {
    label: "Inativo",
    color: "bg-red-100 text-red-800",
    dot: "bg-red-500",
  },
  pendente: {
    label: "Pendente",
    color: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
};

const PLAN_LABELS: Record<string, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export const ManagerAthletes: React.FC = () => {
  const { currentProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [expandedAthleteId, setExpandedAthleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const profileColor = currentProfile ? PROFILE_COLORS[currentProfile] : "#92400e";
  const profileName = currentProfile ? PROFILE_NAMES[currentProfile] : "Serviço";

  // Filter athletes for this manager's profile
  const profileAthletes = useMemo(() => {
    let filtered = mockAthletes.filter((a) => a.profile === currentProfile);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.teacher.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "checkInsThisMonth":
          cmp = a.checkInsThisMonth - b.checkInsThisMonth;
          break;
        case "totalSessions":
          cmp = a.totalSessions - b.totalSessions;
          break;
        case "streak":
          cmp = a.streak - b.streak;
          break;
        case "lastCheckIn":
          cmp = (a.lastCheckIn?.getTime() || 0) - (b.lastCheckIn?.getTime() || 0);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return filtered;
  }, [currentProfile, searchTerm, statusFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Stats
  const totalAthletes = profileAthletes.length;
  const activeAthletes = profileAthletes.filter((a) => a.status === "ativo").length;
  const trainingNow = profileAthletes.filter((a) => a.isTrainingNow).length;
  const totalCheckInsMonth = profileAthletes.reduce((sum, a) => sum + a.checkInsThisMonth, 0);
  const avgCheckIns = totalAthletes > 0 ? Math.round(totalCheckInsMonth / totalAthletes) : 0;

  const formatDate = (date: Date | null) => {
    if (!date) {return "—";}
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) {return "—";}
    return (
      date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
      " às " +
      date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getCheckInTrend = (current: number, previous: number) => {
    if (current > previous)
      {return {
        icon: TrendingUp,
        color: "text-green-600",
        label: `+${current - previous}`,
      };}
    if (current < previous)
      {return {
        icon: TrendingDown,
        color: "text-red-500",
        label: `${current - previous}`,
      };}
    return { icon: Minus, color: "text-gray-400", label: "0" };
  };

  const completionRate = (a: MockAthlete) => {
    if (a.totalSessions === 0) {return 0;}
    return Math.round((a.completedSessions / a.totalSessions) * 100);
  };

  if (!currentProfile) {
    return <div>Selecione um serviço</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: profileColor }} />
          <h1 className="text-3xl font-bold">Atletas</h1>
        </div>
        <p className="text-gray-600">
          Gerencie os atletas do{" "}
          <span className="font-semibold" style={{ color: profileColor }}>
            {profileName}
          </span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${profileColor}15` }}>
              <Users className="w-5 h-5" style={{ color: profileColor }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold">{totalAthletes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ativos</p>
              <p className="text-xl font-bold">{activeAthletes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-50">
              <Activity className="w-5 h-5 text-orange-600" />
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
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Check-ins (mês)</p>
              <p className="text-xl font-bold">{totalCheckInsMonth}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Média Check-ins</p>
              <p className="text-xl font-bold">
                {avgCheckIns} <span className="text-sm text-gray-400 font-normal">/ atleta</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Currently Training */}
      {trainingNow > 0 && (
        <Card className="p-5 border-2" style={{ borderColor: `${profileColor}40` }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: profileColor }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ backgroundColor: profileColor }}
              ></span>
            </span>
            <h2 className="font-bold">Treinando Agora</h2>
            <Badge
              style={{
                backgroundColor: `${profileColor}15`,
                color: profileColor,
              }}
            >
              {trainingNow}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            {profileAthletes
              .filter((a) => a.isTrainingNow)
              .map((athlete) => (
                <div
                  key={athlete.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: profileColor }}
                  >
                    {athlete.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{athlete.name}</p>
                    <p className="text-xs text-gray-500">
                      Check-in às {athlete.currentCheckInTime}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Check-in History Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: profileColor }} />
          Check-ins Mensais
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={mockCheckInHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Bar dataKey="checkIns" fill={profileColor} radius={[8, 8, 0, 0]} name="Check-ins" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(["todos", "ativo", "inativo", "pendente"] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  statusFilter === status
                    ? "text-white border-transparent shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                style={statusFilter === status ? { backgroundColor: profileColor } : undefined}
              >
                {status === "todos" ? "Todos" : STATUS_CONFIG[status].label}
                {status !== "todos" && (
                  <span className="ml-1.5 text-xs opacity-80">
                    (
                    {
                      mockAthletes.filter(
                        (a) => a.profile === currentProfile && a.status === status
                      ).length
                    }
                    )
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Athletes Table / List */}
      <Card className="overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div
            className="col-span-3 flex items-center gap-1 cursor-pointer"
            onClick={() => toggleSort("name")}
          >
            Atleta
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="col-span-1 text-center">Status</div>
          <div
            className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer"
            onClick={() => toggleSort("checkInsThisMonth")}
          >
            Check-ins (mês)
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div
            className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer"
            onClick={() => toggleSort("totalSessions")}
          >
            Total sessões
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div
            className="col-span-1 text-center flex items-center justify-center gap-1 cursor-pointer"
            onClick={() => toggleSort("streak")}
          >
            Streak
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div
            className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer"
            onClick={() => toggleSort("lastCheckIn")}
          >
            Último Check-in
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="col-span-1 text-center">Ações</div>
        </div>

        {/* Athlete Rows */}
        {profileAthletes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nenhum atleta encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {profileAthletes.map((athlete) => {
              const isExpanded = expandedAthleteId === athlete.id;
              const trend = getCheckInTrend(athlete.checkInsThisMonth, athlete.checkInsLastMonth);
              const TrendIcon = trend.icon;
              const rate = completionRate(athlete);
              const statusCfg = STATUS_CONFIG[athlete.status];

              return (
                <div key={athlete.id} className="transition-colors hover:bg-gray-50/50">
                  {/* Main Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 px-6 py-4 items-center">
                    {/* Athlete Info */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
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
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{athlete.name}</p>
                        <p className="text-xs text-gray-500 truncate">{athlete.teacher}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 flex justify-center">
                      <Badge className={`${statusCfg.color} text-xs`}>{statusCfg.label}</Badge>
                    </div>

                    {/* Check-ins This Month */}
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg font-bold">{athlete.checkInsThisMonth}</span>
                        <span className={`flex items-center gap-0.5 text-xs ${trend.color}`}>
                          <TrendIcon className="w-3.5 h-3.5" />
                          {trend.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        mês anterior: {athlete.checkInsLastMonth}
                      </p>
                    </div>

                    {/* Total Sessions */}
                    <div className="col-span-2 text-center">
                      <p className="font-bold">{athlete.completedSessions}</p>
                      <p className="text-xs text-gray-400">{rate}% aproveitamento</p>
                    </div>

                    {/* Streak */}
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <Flame
                        className={`w-4 h-4 ${athlete.streak >= 10 ? "text-orange-500" : athlete.streak >= 4 ? "text-amber-400" : "text-gray-300"}`}
                      />
                      <span className="font-bold text-sm">{athlete.streak}</span>
                      <span className="text-xs text-gray-400">sem</span>
                    </div>

                    {/* Last Check-in */}
                    <div className="col-span-2 text-center">
                      <p className="text-sm">{formatDateTime(athlete.lastCheckIn)}</p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedAthleteId(isExpanded ? null : athlete.id)}
                        className="h-8 px-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-1 bg-gray-50/70 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Contact & Plan */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
                            <Users className="w-4 h-4" /> Informações
                          </h4>
                          <div className="space-y-2 text-sm">
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
                              Matriculado em {formatDate(athlete.enrolledSince)}
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {PLAN_LABELS[athlete.plan]}
                            </Badge>
                          </div>
                        </div>

                        {/* Session Stats */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
                            <Activity className="w-4 h-4" /> Sessões
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                              <p className="text-lg font-bold text-green-600">
                                {athlete.completedSessions}
                              </p>
                              <p className="text-xs text-gray-500">Realizadas</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                              <p className="text-lg font-bold text-amber-600">
                                {athlete.cancelledSessions}
                              </p>
                              <p className="text-xs text-gray-500">Canceladas</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                              <p className="text-lg font-bold text-red-500">
                                {athlete.noShowSessions}
                              </p>
                              <p className="text-xs text-gray-500">Faltas</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                              <p className="text-lg font-bold" style={{ color: profileColor }}>
                                {athlete.totalSessions}
                              </p>
                              <p className="text-xs text-gray-500">Total</p>
                            </div>
                          </div>
                        </div>

                        {/* Completion Bar */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4" /> Aproveitamento
                          </h4>
                          <div className="p-4 rounded-lg bg-white border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Taxa de conclusão</span>
                              <span className="text-lg font-bold" style={{ color: profileColor }}>
                                {rate}%
                              </span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${rate}%`,
                                  backgroundColor: profileColor,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <div className="text-center">
                                <div className="flex items-center gap-1">
                                  <Flame
                                    className={`w-4 h-4 ${athlete.streak >= 10 ? "text-orange-500" : "text-gray-400"}`}
                                  />
                                  <span className="text-lg font-bold">{athlete.streak}</span>
                                </div>
                                <p className="text-xs text-gray-500">Semanas seguidas</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold" style={{ color: profileColor }}>
                                  {athlete.checkInsThisMonth}
                                </p>
                                <p className="text-xs text-gray-500">Check-ins este mês</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Summary Footer */}
      <div className="text-center text-sm text-gray-500">
        Exibindo {profileAthletes.length} de{" "}
        {mockAthletes.filter((a) => a.profile === currentProfile).length} atletas do {profileName}
      </div>
    </div>
  );
};
