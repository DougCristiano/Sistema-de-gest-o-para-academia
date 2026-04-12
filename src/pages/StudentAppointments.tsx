import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Calendar, CheckCircle2, Clock, User, XCircle, AlertCircle } from "lucide-react";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckIn,
  CheckInStatus,
  CHECK_IN_STATUS_LABELS,
  CHECK_IN_STATUS_COLORS,
  CHECK_IN_TYPE_LABELS,
  CHECK_IN_TYPE_COLORS,
  PROFILE_NAMES,
  PROFILE_COLORS,
} from "../types";
import { getStudentCheckIns } from "../data/mockData";

const TODAY = "2026-04-12";

function isUpcoming(ci: CheckIn): boolean {
  return ci.status === "agendado" && ci.date >= TODAY;
}

function isHistory(ci: CheckIn): boolean {
  return !isUpcoming(ci);
}

const STATUS_ICONS: Record<CheckInStatus, React.ReactNode> = {
  agendado: <Calendar className="w-4 h-4 text-blue-500" />,
  concluido: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  faltou: <XCircle className="w-4 h-4 text-red-500" />,
  cancelado: <AlertCircle className="w-4 h-4 text-slate-400" />,
};

interface CheckInCardProps {
  checkIn: CheckIn;
}

const CheckInCard: React.FC<CheckInCardProps> = ({ checkIn }) => {
  const parsedDate = parseISO(checkIn.date);
  const dayNum = format(parsedDate, "dd", { locale: ptBR });
  const monthAbbr = format(parsedDate, "MMM", { locale: ptBR }).toUpperCase().replace(".", "");
  const weekday = format(parsedDate, "EEE", { locale: ptBR });
  const serviceColor = PROFILE_COLORS[checkIn.serviceId];

  return (
    <div className="flex items-stretch gap-0 rounded-xl border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      {/* Date column */}
      <div
        className="flex flex-col items-center justify-center px-4 py-3 min-w-[72px] text-white flex-shrink-0"
        style={{ backgroundColor: serviceColor }}
      >
        <span className="text-xs font-medium opacity-80 capitalize">{weekday}</span>
        <span className="text-2xl font-bold leading-tight">{dayNum}</span>
        <span className="text-xs font-semibold uppercase opacity-90">{monthAbbr}</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            {/* Activity + Service */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {checkIn.activityName ? (
                <span className="font-semibold text-sm text-foreground">{checkIn.activityName}</span>
              ) : null}
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0"
                style={{ borderColor: serviceColor, color: serviceColor }}
              >
                {PROFILE_NAMES[checkIn.serviceId]}
              </Badge>
            </div>
            {/* Teacher */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Prof. {checkIn.teacherName}</span>
            </div>
            {/* Time */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{checkIn.time} · {checkIn.duration}min</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {/* Type */}
            <span
              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${CHECK_IN_TYPE_COLORS[checkIn.type]}`}
            >
              {CHECK_IN_TYPE_LABELS[checkIn.type]}
            </span>
            {/* Status */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${CHECK_IN_STATUS_COLORS[checkIn.status]}`}
            >
              {STATUS_ICONS[checkIn.status]}
              {CHECK_IN_STATUS_LABELS[checkIn.status]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HISTORY_FILTER_OPTIONS: { value: CheckInStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "concluido", label: "Concluídas" },
  { value: "faltou", label: "Faltas" },
  { value: "cancelado", label: "Canceladas" },
];

export const StudentAppointments: React.FC = () => {
  const { currentUser } = useAuth();
  const [historyFilter, setHistoryFilter] = useState<CheckInStatus | "todos">("todos");

  const studentId = currentUser?.id ?? "";
  const allCheckIns = useMemo(() => getStudentCheckIns(studentId), [studentId]);

  const upcoming = useMemo(
    () =>
      allCheckIns
        .filter(isUpcoming)
        .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : a.time.localeCompare(b.time))),
    [allCheckIns]
  );

  const history = useMemo(
    () =>
      allCheckIns
        .filter(isHistory)
        .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : b.time.localeCompare(a.time))),
    [allCheckIns]
  );

  const filteredHistory = useMemo(() => {
    if (historyFilter === "todos") { return history; }
    return history.filter((ci) => ci.status === historyFilter);
  }, [history, historyFilter]);

  const concluidas = allCheckIns.filter((ci) => ci.status === "concluido").length;
  const faltas = allCheckIns.filter((ci) => ci.status === "faltou").length;
  const canceladas = allCheckIns.filter((ci) => ci.status === "cancelado").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Minhas Aulas</h1>
        <p className="text-muted-foreground">Acompanhe suas aulas agendadas e seu histórico</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-t-4 border-t-blue-500">
          <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Próximas</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-green-500">
          <p className="text-2xl font-bold text-green-600">{concluidas}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Realizadas</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-red-500">
          <p className="text-2xl font-bold text-red-600">{faltas}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Faltas</p>
        </Card>
        <Card className="p-4 border-t-4 border-t-slate-400">
          <p className="text-2xl font-bold text-slate-500">{canceladas}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Canceladas</p>
        </Card>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Próximas ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Histórico ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-14 h-14 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Nenhuma aula agendada</h3>
              <p className="text-sm text-muted-foreground">Suas próximas aulas aparecerão aqui.</p>
            </Card>
          ) : (
            upcoming.map((ci) => <CheckInCard key={ci.id} checkIn={ci} />)
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {/* Filter pills */}
          {history.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {HISTORY_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHistoryFilter(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    historyFilter === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-14 h-14 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Nenhuma aula no histórico</h3>
              <p className="text-sm text-muted-foreground">Seu histórico de aulas aparecerá aqui.</p>
            </Card>
          ) : (
            filteredHistory.map((ci) => <CheckInCard key={ci.id} checkIn={ci} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
