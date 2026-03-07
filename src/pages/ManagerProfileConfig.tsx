import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Clock,
  Users,
  Settings,
  Save,
  RotateCcw,
  CalendarClock,
  Timer,
  UserCheck,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  Plus,
  Trash2,
  Copy,
  ChevronsRight,
} from "lucide-react";
import {
  ProfileConfig,
  DaySchedule,
  TimeBlock,
  PROFILE_NAMES,
  PROFILE_COLORS,
} from "../types";
import { Toaster, toast } from "sonner";

const DAYS_OF_WEEK = [
  { key: "seg", label: "Segunda-feira", short: "Seg" },
  { key: "ter", label: "Terça-feira", short: "Ter" },
  { key: "qua", label: "Quarta-feira", short: "Qua" },
  { key: "qui", label: "Quinta-feira", short: "Qui" },
  { key: "sex", label: "Sexta-feira", short: "Sex" },
  { key: "sab", label: "Sábado", short: "Sáb" },
  { key: "dom", label: "Domingo", short: "Dom" },
];

const DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h 30min" },
  { value: 120, label: "2 horas" },
];

const BREAK_OPTIONS = [
  { value: 0, label: "Sem intervalo" },
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
];

const CANCELLATION_OPTIONS = [
  { value: 1, label: "1 hora antes" },
  { value: 2, label: "2 horas antes" },
  { value: 4, label: "4 horas antes" },
  { value: 6, label: "6 horas antes" },
  { value: 12, label: "12 horas antes" },
  { value: 24, label: "24 horas antes" },
  { value: 48, label: "48 horas antes" },
];

let blockIdCounter = 1;
function newBlockId() {
  return `tb-${Date.now()}-${blockIdCounter++}`;
}

function makeDefaultBlocks(start: string, end: string): TimeBlock[] {
  return [{ id: newBlockId(), startTime: start, endTime: end }];
}

const defaultSchedule: Record<string, DaySchedule> = {
  seg: { enabled: true, timeBlocks: makeDefaultBlocks("06:00", "22:00") },
  ter: { enabled: true, timeBlocks: makeDefaultBlocks("06:00", "22:00") },
  qua: { enabled: true, timeBlocks: makeDefaultBlocks("06:00", "22:00") },
  qui: { enabled: true, timeBlocks: makeDefaultBlocks("06:00", "22:00") },
  sex: { enabled: true, timeBlocks: makeDefaultBlocks("06:00", "22:00") },
  sab: { enabled: true, timeBlocks: makeDefaultBlocks("08:00", "14:00") },
  dom: { enabled: false, timeBlocks: makeDefaultBlocks("08:00", "12:00") },
};

const getDefaultConfig = (profile: string): ProfileConfig => ({
  id: `config-${profile}`,
  profile: profile as any,
  schedule: JSON.parse(JSON.stringify(defaultSchedule)),
  maxStudentsPerSlot: 1,
  classDuration: 60,
  breakBetweenClasses: 10,
  allowGroupClasses: false,
  maxGroupSize: 4,
  autoConfirmBookings: false,
  cancellationDeadline: 2,
  allowWaitlist: false,
  notes: "",
});

// Generate time slots from a single block
function generateTimeSlotsForBlock(
  startTime: string,
  endTime: string,
  duration: number,
  breakTime: number,
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + duration <= endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    currentMinutes += duration + breakTime;
  }
  return slots;
}

// Generate all time slots for a day (multiple blocks)
function generateDaySlots(
  daySchedule: DaySchedule,
  duration: number,
  breakTime: number,
): string[] {
  if (!daySchedule?.enabled) return [];
  const allSlots: string[] = [];
  for (const block of daySchedule.timeBlocks) {
    allSlots.push(
      ...generateTimeSlotsForBlock(
        block.startTime,
        block.endTime,
        duration,
        breakTime,
      ),
    );
  }
  return allSlots;
}

// Format block summary text
function formatBlocksSummary(blocks: TimeBlock[]): string {
  return blocks.map((b) => `${b.startTime}–${b.endTime}`).join(" / ");
}

export const ManagerProfileConfig: React.FC = () => {
  const { currentProfile } = useAuth();

  const [config, setConfig] = useState<ProfileConfig>(
    getDefaultConfig(currentProfile || "htri"),
  );
  const [hasChanges, setHasChanges] = useState(false);

  const profileColor = currentProfile
    ? PROFILE_COLORS[currentProfile]
    : "#92400e";
  const profileName = currentProfile
    ? PROFILE_NAMES[currentProfile]
    : "Serviço";

  const updateConfig = (updates: Partial<ProfileConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateDayEnabled = (dayKey: string, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayKey]: { ...prev.schedule[dayKey], enabled },
      },
    }));
    setHasChanges(true);
  };

  const addTimeBlock = useCallback((dayKey: string) => {
    setConfig((prev) => {
      const day = prev.schedule[dayKey];
      const lastBlock = day.timeBlocks[day.timeBlocks.length - 1];
      // Smart default: start 2h after last block ends
      const [lastEndH, lastEndM] = lastBlock.endTime.split(":").map(Number);
      const newStartMinutes = Math.min(lastEndH * 60 + lastEndM + 120, 23 * 60);
      const newEndMinutes = Math.min(newStartMinutes + 120, 24 * 60);
      const newStart = `${String(Math.floor(newStartMinutes / 60)).padStart(2, "0")}:${String(newStartMinutes % 60).padStart(2, "0")}`;
      const newEnd = `${String(Math.floor(newEndMinutes / 60)).padStart(2, "0")}:${String(newEndMinutes % 60).padStart(2, "0")}`;

      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [dayKey]: {
            ...day,
            timeBlocks: [
              ...day.timeBlocks,
              { id: newBlockId(), startTime: newStart, endTime: newEnd },
            ],
          },
        },
      };
    });
    setHasChanges(true);
  }, []);

  const removeTimeBlock = useCallback((dayKey: string, blockId: string) => {
    setConfig((prev) => {
      const day = prev.schedule[dayKey];
      if (day.timeBlocks.length <= 1) return prev; // keep at least 1
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [dayKey]: {
            ...day,
            timeBlocks: day.timeBlocks.filter((b) => b.id !== blockId),
          },
        },
      };
    });
    setHasChanges(true);
  }, []);

  const updateTimeBlock = useCallback(
    (
      dayKey: string,
      blockId: string,
      field: "startTime" | "endTime",
      value: string,
    ) => {
      setConfig((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [dayKey]: {
            ...prev.schedule[dayKey],
            timeBlocks: prev.schedule[dayKey].timeBlocks.map((b) =>
              b.id === blockId ? { ...b, [field]: value } : b,
            ),
          },
        },
      }));
      setHasChanges(true);
    },
    [],
  );

  const handleSave = () => {
    setHasChanges(false);
    toast.success("Configurações salvas com sucesso!", {
      description: `As configurações do serviço ${profileName} foram atualizadas.`,
    });
  };

  const handleReset = () => {
    setConfig(getDefaultConfig(currentProfile || "htri"));
    setHasChanges(false);
    toast.info("Configurações restauradas para o padrão.");
  };

  const copyScheduleToAll = (sourceDayKey: string) => {
    const sourceSchedule = config.schedule[sourceDayKey];
    const newSchedule = { ...config.schedule };
    DAYS_OF_WEEK.forEach((day) => {
      if (day.key !== sourceDayKey) {
        newSchedule[day.key] = {
          enabled: sourceSchedule.enabled,
          timeBlocks: sourceSchedule.timeBlocks.map((b) => ({
            ...b,
            id: newBlockId(),
          })),
        };
      }
    });
    setConfig((prev) => ({ ...prev, schedule: newSchedule }));
    setHasChanges(true);
    toast.success(
      `Horário de ${DAYS_OF_WEEK.find((d) => d.key === sourceDayKey)?.label} copiado para todos os dias.`,
    );
  };

  // Count active days and total slots
  const activeDays = DAYS_OF_WEEK.filter(
    (d) => config.schedule[d.key]?.enabled,
  ).length;
  const totalWeeklySlots = DAYS_OF_WEEK.reduce((total, day) => {
    return (
      total +
      generateDaySlots(
        config.schedule[day.key],
        config.classDuration,
        config.breakBetweenClasses,
      ).length
    );
  }, 0);
  const maxWeeklyCapacity =
    totalWeeklySlots *
    (config.allowGroupClasses
      ? config.maxGroupSize
      : config.maxStudentsPerSlot);
  const totalBlocks = DAYS_OF_WEEK.reduce((t, d) => {
    const ds = config.schedule[d.key];
    return t + (ds?.enabled ? ds.timeBlocks.length : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: profileColor }}
            />
            <h1 className="text-3xl font-bold">Configurar Serviço</h1>
          </div>
          <p className="text-gray-600">
            Defina horários, capacidade e regras para o{" "}
            <span className="font-semibold" style={{ color: profileColor }}>
              {profileName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrão
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 text-white"
            style={{ backgroundColor: hasChanges ? profileColor : undefined }}
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {hasChanges && (
        <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-amber-300 bg-amber-50">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Você tem alterações não salvas. Clique em "Salvar Configurações"
            para aplicar.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-lg"
              style={{ backgroundColor: `${profileColor}15` }}
            >
              <CalendarClock
                className="w-5 h-5"
                style={{ color: profileColor }}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500">Dias Ativos</p>
              <p className="text-xl font-bold">
                {activeDays}{" "}
                <span className="text-sm text-gray-400 font-normal">/ 7</span>
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-lg"
              style={{ backgroundColor: `${profileColor}15` }}
            >
              <Clock className="w-5 h-5" style={{ color: profileColor }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Blocos de Horário</p>
              <p className="text-xl font-bold">
                {totalBlocks}{" "}
                <span className="text-sm text-gray-400 font-normal">
                  blocos
                </span>
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-lg"
              style={{ backgroundColor: `${profileColor}15` }}
            >
              <Timer className="w-5 h-5" style={{ color: profileColor }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Aulas na Semana</p>
              <p className="text-xl font-bold">
                {totalWeeklySlots}{" "}
                <span className="text-sm text-gray-400 font-normal">
                  horários
                </span>
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-lg"
              style={{ backgroundColor: `${profileColor}15` }}
            >
              <UserCheck className="w-5 h-5" style={{ color: profileColor }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Capacidade Semanal</p>
              <p className="text-xl font-bold">
                {maxWeeklyCapacity}{" "}
                <span className="text-sm text-gray-400 font-normal">
                  alunos
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Config Tabs */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Horários</span>
          </TabsTrigger>
          <TabsTrigger value="capacity" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Capacidade</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Regras</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Pré-visualização</span>
          </TabsTrigger>
        </TabsList>

        {/* ====== SCHEDULE TAB ====== */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: profileColor }} />
                  Horários de Funcionamento
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configure os horários disponíveis para cada dia. Adicione
                  múltiplos blocos para horários com intervalos (ex: manhã e
                  noite).
                </p>
              </div>
            </div>

            {/* Info Tip */}
            <div className="flex items-start gap-2.5 p-3 mb-6 rounded-lg bg-blue-50 border border-blue-200">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Dica:</span> Use múltiplos
                blocos de horário para dias com pausa. Exemplo:{" "}
                <span className="font-medium">07:00–09:00</span> e{" "}
                <span className="font-medium">17:00–21:00</span> para um dia com
                manhã e noite.
              </p>
            </div>

            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule = config.schedule[day.key];
                const daySlots = generateDaySlots(
                  daySchedule,
                  config.classDuration,
                  config.breakBetweenClasses,
                );

                return (
                  <div
                    key={day.key}
                    className={`rounded-xl border-2 transition-all ${
                      daySchedule?.enabled
                        ? "border-gray-200 bg-white"
                        : "border-gray-100 bg-gray-50/70"
                    }`}
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between p-4 pb-0">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={daySchedule?.enabled}
                          onCheckedChange={(checked) =>
                            updateDayEnabled(day.key, checked)
                          }
                        />
                        <div>
                          <p
                            className={`font-medium text-sm ${!daySchedule?.enabled ? "text-gray-400" : ""}`}
                          >
                            {day.label}
                          </p>
                          {daySchedule?.enabled && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {daySchedule.timeBlocks.length}{" "}
                              {daySchedule.timeBlocks.length === 1
                                ? "bloco"
                                : "blocos"}{" "}
                              · {daySlots.length}{" "}
                              {daySlots.length === 1 ? "horário" : "horários"}
                            </p>
                          )}
                          {!daySchedule?.enabled && (
                            <p className="text-xs text-gray-400 mt-0.5 italic">
                              Fechado
                            </p>
                          )}
                        </div>
                      </div>

                      {daySchedule?.enabled && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyScheduleToAll(day.key)}
                            className="text-xs text-gray-500 hover:text-gray-700 h-8 px-2"
                            title="Copiar para todos os dias"
                          >
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            <span className="hidden md:inline">
                              Copiar p/ todos
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Time Blocks */}
                    {daySchedule?.enabled && (
                      <div className="p-4 pt-3 space-y-2">
                        {daySchedule.timeBlocks.map((block, blockIndex) => (
                          <div
                            key={block.id}
                            className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 group"
                          >
                            {/* Block number badge */}
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0"
                              style={{ backgroundColor: profileColor }}
                            >
                              {blockIndex + 1}
                            </div>

                            {/* Start time */}
                            <div className="flex items-center gap-1.5">
                              <Label className="text-xs text-gray-400 hidden sm:block">
                                De
                              </Label>
                              <Input
                                type="time"
                                value={block.startTime}
                                onChange={(e) =>
                                  updateTimeBlock(
                                    day.key,
                                    block.id,
                                    "startTime",
                                    e.target.value,
                                  )
                                }
                                className="w-28 h-9 text-sm"
                              />
                            </div>

                            <ChevronsRight className="w-4 h-4 text-gray-300 shrink-0" />

                            {/* End time */}
                            <div className="flex items-center gap-1.5">
                              <Label className="text-xs text-gray-400 hidden sm:block">
                                Até
                              </Label>
                              <Input
                                type="time"
                                value={block.endTime}
                                onChange={(e) =>
                                  updateTimeBlock(
                                    day.key,
                                    block.id,
                                    "endTime",
                                    e.target.value,
                                  )
                                }
                                className="w-28 h-9 text-sm"
                              />
                            </div>

                            {/* Slot count for this block */}
                            <span className="text-xs text-gray-400 hidden lg:block whitespace-nowrap ml-1">
                              {
                                generateTimeSlotsForBlock(
                                  block.startTime,
                                  block.endTime,
                                  config.classDuration,
                                  config.breakBetweenClasses,
                                ).length
                              }{" "}
                              aulas
                            </span>

                            {/* Remove block */}
                            <button
                              onClick={() => removeTimeBlock(day.key, block.id)}
                              disabled={daySchedule.timeBlocks.length <= 1}
                              className={`ml-auto p-1.5 rounded-md transition-colors shrink-0 ${
                                daySchedule.timeBlocks.length <= 1
                                  ? "text-gray-200 cursor-not-allowed"
                                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                              }`}
                              title="Remover bloco"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Add Block Button */}
                        <button
                          onClick={() => addTimeBlock(day.key)}
                          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50/50 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar bloco de horário
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ====== CAPACITY TAB ====== */}
        <TabsContent value="capacity" className="space-y-4">
          {/* Duration */}
          <Card className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <Timer className="w-5 h-5" style={{ color: profileColor }} />
              Duração da Aula
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Defina quanto tempo dura cada aula neste serviço
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateConfig({ classDuration: option.value })}
                  className={`px-4 py-4 rounded-xl border-2 text-center transition-all ${
                    config.classDuration === option.value
                      ? "border-current text-white shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                  style={
                    config.classDuration === option.value
                      ? {
                          backgroundColor: profileColor,
                          borderColor: profileColor,
                        }
                      : undefined
                  }
                >
                  <p className="text-lg font-bold">{option.value}</p>
                  <p
                    className={`text-xs ${config.classDuration === option.value ? "text-white/80" : "text-gray-500"}`}
                  >
                    {option.label}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Break Between Classes */}
          <Card className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <CalendarClock
                className="w-5 h-5"
                style={{ color: profileColor }}
              />
              Intervalo entre Aulas
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Tempo de descanso/transição entre uma aula e outra
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {BREAK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    updateConfig({ breakBetweenClasses: option.value })
                  }
                  className={`px-4 py-4 rounded-xl border-2 text-center transition-all ${
                    config.breakBetweenClasses === option.value
                      ? "border-current text-white shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                  style={
                    config.breakBetweenClasses === option.value
                      ? {
                          backgroundColor: profileColor,
                          borderColor: profileColor,
                        }
                      : undefined
                  }
                >
                  <p className="text-lg font-bold">
                    {option.value === 0 ? "—" : option.value}
                  </p>
                  <p
                    className={`text-xs ${config.breakBetweenClasses === option.value ? "text-white/80" : "text-gray-500"}`}
                  >
                    {option.label}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Students Per Slot */}
          <Card className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <Users className="w-5 h-5" style={{ color: profileColor }} />
              Alunos por Horário
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Defina quantos alunos podem ser atendidos simultaneamente
            </p>

            <div className="space-y-6">
              {/* Individual */}
              <div>
                <Label className="text-sm font-medium">
                  Máximo de alunos por horário (individual)
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() =>
                      updateConfig({
                        maxStudentsPerSlot: Math.max(
                          1,
                          config.maxStudentsPerSlot - 1,
                        ),
                      })
                    }
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 text-lg font-bold"
                  >
                    -
                  </button>
                  <div className="w-20 text-center">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: profileColor }}
                    >
                      {config.maxStudentsPerSlot}
                    </span>
                    <p className="text-xs text-gray-500">
                      {config.maxStudentsPerSlot === 1 ? "aluno" : "alunos"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateConfig({
                        maxStudentsPerSlot: Math.min(
                          20,
                          config.maxStudentsPerSlot + 1,
                        ),
                      })
                    }
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Group Classes Toggle */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Permitir aulas em grupo
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ative para permitir que mais alunos participem de uma
                      mesma aula
                    </p>
                  </div>
                  <Switch
                    checked={config.allowGroupClasses}
                    onCheckedChange={(checked) =>
                      updateConfig({ allowGroupClasses: checked })
                    }
                  />
                </div>

                {config.allowGroupClasses && (
                  <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <Label className="text-sm font-medium">
                      Tamanho máximo do grupo
                    </Label>
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() =>
                          updateConfig({
                            maxGroupSize: Math.max(2, config.maxGroupSize - 1),
                          })
                        }
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:bg-white text-lg font-bold"
                      >
                        -
                      </button>
                      <div className="w-20 text-center">
                        <span
                          className="text-3xl font-bold"
                          style={{ color: profileColor }}
                        >
                          {config.maxGroupSize}
                        </span>
                        <p className="text-xs text-gray-500">alunos</p>
                      </div>
                      <button
                        onClick={() =>
                          updateConfig({
                            maxGroupSize: Math.min(30, config.maxGroupSize + 1),
                          })
                        }
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:bg-white text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ====== RULES TAB ====== */}
        <TabsContent value="rules" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5" style={{ color: profileColor }} />
              Regras de Agendamento
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Configure políticas de agendamento e cancelamento
            </p>

            <div className="space-y-6">
              {/* Auto Confirm */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-green-50 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Confirmação automática
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Quando ativado, as reservas são confirmadas
                      automaticamente sem necessidade de aprovação do professor
                      ou gerente
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.autoConfirmBookings}
                  onCheckedChange={(checked) =>
                    updateConfig({ autoConfirmBookings: checked })
                  }
                />
              </div>

              {/* Waitlist */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 mt-0.5">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Lista de espera
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Permitir que alunos entrem em lista de espera quando o
                      horário estiver lotado
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.allowWaitlist}
                  onCheckedChange={(checked) =>
                    updateConfig({ allowWaitlist: checked })
                  }
                />
              </div>

              {/* Cancellation Deadline */}
              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-amber-50 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Prazo para cancelamento
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo mínimo de antecedência para o aluno cancelar uma
                      aula sem penalidade
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {CANCELLATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateConfig({ cancellationDeadline: option.value })
                      }
                      className={`px-3 py-3 rounded-lg border-2 text-center text-sm transition-all ${
                        config.cancellationDeadline === option.value
                          ? "text-white shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      style={
                        config.cancellationDeadline === option.value
                          ? {
                              backgroundColor: profileColor,
                              borderColor: profileColor,
                            }
                          : undefined
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5" style={{ color: profileColor }} />
              Observações do Serviço
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Anotações internas ou regras especiais para este serviço
            </p>
            <textarea
              value={config.notes}
              onChange={(e) => updateConfig({ notes: e.target.value })}
              placeholder="Ex: Aulas de HTRI requerem avaliação física prévia. Alunos novos devem passar por aula experimental."
              className="w-full h-32 px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": profileColor } as React.CSSProperties}
            />
          </Card>
        </TabsContent>

        {/* ====== PREVIEW TAB ====== */}
        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <Settings className="w-5 h-5" style={{ color: profileColor }} />
              Resumo da Configuração
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Visão geral de como ficará a grade de horários
            </p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Duração da aula</p>
                <p className="text-lg font-bold">
                  {
                    DURATION_OPTIONS.find(
                      (o) => o.value === config.classDuration,
                    )?.label
                  }
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">
                  Intervalo entre aulas
                </p>
                <p className="text-lg font-bold">
                  {
                    BREAK_OPTIONS.find(
                      (o) => o.value === config.breakBetweenClasses,
                    )?.label
                  }
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Alunos por horário</p>
                <p className="text-lg font-bold">
                  {config.allowGroupClasses
                    ? `Até ${config.maxGroupSize} (grupo)`
                    : `${config.maxStudentsPerSlot} (individual)`}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Cancelamento</p>
                <p className="text-lg font-bold">
                  {
                    CANCELLATION_OPTIONS.find(
                      (o) => o.value === config.cancellationDeadline,
                    )?.label
                  }
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {config.autoConfirmBookings && (
                <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Confirmação automática
                </Badge>
              )}
              {config.allowWaitlist && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Lista de espera ativa
                </Badge>
              )}
              {config.allowGroupClasses && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Aulas em grupo
                </Badge>
              )}
            </div>

            {/* Weekly Grid Preview */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-400" />
                Grade Semanal de Horários
              </h3>
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const daySchedule = config.schedule[day.key];
                  if (!daySchedule?.enabled) {
                    return (
                      <div
                        key={day.key}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 opacity-50"
                      >
                        <span className="font-medium text-sm w-12">
                          {day.short}
                        </span>
                        <span className="text-sm text-gray-400 italic">
                          Fechado
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={day.key}
                      className="p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-medium text-sm w-12">
                          {day.short}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {daySchedule.timeBlocks.map((block, bi) => (
                            <Badge
                              key={block.id}
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {block.startTime}–{block.endTime}
                            </Badge>
                          ))}
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs ml-auto shrink-0"
                        >
                          {
                            generateDaySlots(
                              daySchedule,
                              config.classDuration,
                              config.breakBetweenClasses,
                            ).length
                          }{" "}
                          horários
                        </Badge>
                      </div>

                      {/* Slots grouped by block */}
                      <div className="space-y-2">
                        {daySchedule.timeBlocks.map((block, bi) => {
                          const blockSlots = generateTimeSlotsForBlock(
                            block.startTime,
                            block.endTime,
                            config.classDuration,
                            config.breakBetweenClasses,
                          );
                          if (blockSlots.length === 0) return null;
                          return (
                            <div key={block.id}>
                              {daySchedule.timeBlocks.length > 1 && (
                                <p className="text-xs text-gray-400 mb-1">
                                  Bloco {bi + 1}: {block.startTime}–
                                  {block.endTime}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {blockSlots.map((slot) => (
                                  <span
                                    key={`${day.key}-${block.id}-${slot}`}
                                    className="px-2 py-1 rounded text-xs font-medium text-white"
                                    style={{ backgroundColor: profileColor }}
                                  >
                                    {slot}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes Preview */}
            {config.notes && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Observações
                </h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {config.notes}
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
