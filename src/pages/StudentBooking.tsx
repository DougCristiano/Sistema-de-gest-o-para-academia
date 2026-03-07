import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  CalendarDays,
  Check,
  X,
  AlertCircle,
  Lock,
  User,
  CalendarPlus,
} from "lucide-react";
import { PROFILE_NAMES, PROFILE_COLORS, ProfileType } from "../types";
import { mockUsers } from "../data/mockData";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isToday,
  isBefore,
  addHours,
  setHours,
  setMinutes,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Types ───────────────────────────────────────────────────────────────────
interface TimeSlot {
  id: string;
  time: string; // "07:00"
  hour: number;
  minute: number;
  enrolled: number;
  capacity: number;
  teacherName: string;
  teacherId: string;
}

interface ConfirmModalData {
  date: Date;
  slot: TimeSlot;
  profile: ProfileType;
}

// ─── Mock schedule data generator ────────────────────────────────────────────
const SLOT_TEMPLATES: Record<
  ProfileType,
  { times: string[]; capacity: number; teachers: string[] }
> = {
  "huron-areia": {
    times: [
      "06:00",
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
    ],
    capacity: 12,
    teachers: ["Pedro Oliveira"],
  },
  "huron-personal": {
    times: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
    ],
    capacity: 4,
    teachers: ["Pedro Oliveira", "Fernanda Alves"],
  },
  "huron-recovery": {
    times: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ],
    capacity: 6,
    teachers: ["Mariana Souza"],
  },
  htri: {
    times: [
      "05:30",
      "06:30",
      "07:30",
      "09:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
    ],
    capacity: 8,
    teachers: ["Lucas Ferreira"],
  },
  avitta: {
    times: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
    ],
    capacity: 10,
    teachers: ["Fernanda Alves"],
  },
};

// Seed-based pseudo-random so values are stable per day+slot
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSlotsForDay(date: Date, profile: ProfileType): TimeSlot[] {
  const template = SLOT_TEMPLATES[profile];
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  return template.times.map((time, idx) => {
    const [h, m] = time.split(":").map(Number);
    const seed = dayOfYear * 100 + h * 10 + idx;
    const rand = seededRandom(seed);
    const enrolled = Math.floor(rand * (template.capacity + 2)); // can occasionally be >= capacity (full)
    const clampedEnrolled = Math.min(enrolled, template.capacity);
    const teacherIdx = Math.floor(
      seededRandom(seed + 7) * template.teachers.length,
    );

    return {
      id: `slot-${format(date, "yyyy-MM-dd")}-${time}-${profile}`,
      time,
      hour: h,
      minute: m,
      enrolled: clampedEnrolled,
      capacity: template.capacity,
      teacherName: template.teachers[teacherIdx],
      teacherId: `teacher-${teacherIdx + 1}`,
    };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const NOW = new Date(2026, 2, 6, 14, 30); // "hoje" conforme contexto do projeto

function isSlotPast(date: Date, slot: TimeSlot): boolean {
  const slotDateTime = setMinutes(
    setHours(new Date(date), slot.hour),
    slot.minute,
  );
  return isBefore(slotDateTime, NOW);
}

function isCutoffPassed(date: Date, slot: TimeSlot): boolean {
  const slotDateTime = setMinutes(
    setHours(new Date(date), slot.hour),
    slot.minute,
  );
  const cutoff = addHours(slotDateTime, -1);
  return isBefore(cutoff, NOW) && !isBefore(slotDateTime, NOW);
}

function slotStatus(
  date: Date,
  slot: TimeSlot,
): "available" | "full" | "cutoff" | "past" {
  if (isSlotPast(date, slot)) return "past";
  if (isCutoffPassed(date, slot)) return "cutoff";
  if (slot.enrolled >= slot.capacity) return "full";
  return "available";
}

function getStatusConfig(status: "available" | "full" | "cutoff" | "past") {
  switch (status) {
    case "available":
      return {
        bg: "bg-white hover:bg-[#22c55e]/5 border-gray-200 hover:border-[#22c55e]/40",
        badge: "bg-[#22c55e]/10 text-[#22c55e]",
        label: "Disponível",
        icon: Check,
        cursor: "cursor-pointer",
      };
    case "full":
      return {
        bg: "bg-red-50/60 border-red-200/60",
        badge: "bg-red-100 text-red-600",
        label: "Lotado",
        icon: X,
        cursor: "cursor-not-allowed opacity-60",
      };
    case "cutoff":
      return {
        bg: "bg-amber-50/60 border-amber-200/60",
        badge: "bg-amber-100 text-amber-700",
        label: "Encerrado",
        icon: Lock,
        cursor: "cursor-not-allowed opacity-60",
      };
    case "past":
      return {
        bg: "bg-gray-50 border-gray-200/60",
        badge: "bg-gray-100 text-gray-400",
        label: "Passado",
        icon: Clock,
        cursor: "cursor-not-allowed opacity-40",
      };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export const StudentBooking: React.FC = () => {
  const { currentUser } = useAuth();

  const userProfiles =
    currentUser?.role === "student"
      ? currentUser?.profiles || []
      : currentUser?.studentProfiles || [];

  const [selectedProfile, setSelectedProfile] = useState<ProfileType | "">(
    userProfiles.length === 1 ? userProfiles[0] : "",
  );
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(NOW, { weekStartsOn: 1 }),
  );
  const [selectedDay, setSelectedDay] = useState<Date>(NOW);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData | null>(
    null,
  );
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  // Week days array
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // Slots for selected day + profile
  const daySlots = useMemo(() => {
    if (!selectedProfile) return [];
    return generateSlotsForDay(selectedDay, selectedProfile);
  }, [selectedDay, selectedProfile]);

  // Summary counts per day
  const daySummaries = useMemo(() => {
    if (!selectedProfile) return {};
    const map: Record<string, { available: number; total: number }> = {};
    weekDays.forEach((day) => {
      const slots = generateSlotsForDay(day, selectedProfile);
      const available = slots.filter(
        (s) => slotStatus(day, s) === "available",
      ).length;
      map[format(day, "yyyy-MM-dd")] = { available, total: slots.length };
    });
    return map;
  }, [weekDays, selectedProfile]);

  const handleSlotClick = (slot: TimeSlot) => {
    const status = slotStatus(selectedDay, slot);
    if (status !== "available") return;
    if (bookedSlots.has(slot.id)) return;
    setConfirmModal({
      date: selectedDay,
      slot,
      profile: selectedProfile as ProfileType,
    });
  };

  const confirmBooking = () => {
    if (!confirmModal) return;
    setBookedSlots((prev) => new Set(prev).add(confirmModal.slot.id));
    setConfirmModal(null);
  };

  const occupancyPercent = (slot: TimeSlot) =>
    Math.round((slot.enrolled / slot.capacity) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Agendar Aula</h1>
          <p className="text-gray-500">
            Escolha o serviço e navegue pela agenda para reservar
          </p>
        </div>

        {/* Profile Selector */}
        <div className="w-full sm:w-72">
          <Select
            value={selectedProfile}
            onValueChange={(v: string) => setSelectedProfile(v as ProfileType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent>
              {userProfiles.map((p) => (
                <SelectItem key={p} value={p}>
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: PROFILE_COLORS[p] }}
                    />
                    {PROFILE_NAMES[p]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedProfile ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <CalendarPlus className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-1">
            Selecione um Serviço
          </h3>
          <p className="text-sm text-gray-400 max-w-md">
            Escolha o serviço no seletor acima para visualizar os horários
            disponíveis na agenda.
          </p>
        </Card>
      ) : (
        <>
          {/* Week Navigation */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="font-semibold text-sm sm:text-base">
                {format(weekDays[0], "dd 'de' MMMM", { locale: ptBR })} —{" "}
                {format(weekDays[6], "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekStart(addDays(weekStart, 7))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Day Tabs */}
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const summary = daySummaries[key];
                const isSelected = isSameDay(day, selectedDay);
                const isCurrentDay = isToday(day);
                const isPastDay =
                  isBefore(day, startOfWeek(NOW, { weekStartsOn: 1 })) &&
                  !isSameDay(day, NOW);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(day)}
                    className={`rounded-xl p-2 sm:p-3 text-center transition-all border-2 ${
                      isSelected
                        ? "border-[#22c55e] bg-[#22c55e]/5 shadow-sm"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">
                      {format(day, "EEE", { locale: ptBR })}
                    </p>
                    <p
                      className={`text-lg sm:text-2xl font-bold mt-0.5 ${
                        isCurrentDay
                          ? "text-[#22c55e]"
                          : isSelected
                            ? "text-gray-900"
                            : "text-gray-700"
                      }`}
                    >
                      {format(day, "dd")}
                    </p>
                    {summary && (
                      <p className="text-[10px] sm:text-xs mt-1">
                        <span
                          className={`font-medium ${
                            summary.available > 0
                              ? "text-[#22c55e]"
                              : "text-red-400"
                          }`}
                        >
                          {summary.available}
                        </span>
                        <span className="text-gray-400">/{summary.total}</span>
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40" />
              Disponível
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-100 border border-red-300" />
              Lotado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300" />
              Encerrado (&lt;1h)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300" />
              Passado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#3b82f6] border border-[#3b82f6]" />
              Agendado por você
            </span>
          </div>

          {/* Day Heading */}
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-[#22c55e]" />
            <h3 className="font-semibold">
              {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            {isToday(selectedDay) && (
              <Badge className="bg-[#22c55e] text-white text-[10px]">
                Hoje
              </Badge>
            )}
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {daySlots.map((slot) => {
              const status = bookedSlots.has(slot.id)
                ? "available"
                : slotStatus(selectedDay, slot);
              const isBooked = bookedSlots.has(slot.id);
              const config = getStatusConfig(status);
              const occ = occupancyPercent(slot);

              return (
                <div
                  key={slot.id}
                  onClick={() => !isBooked && handleSlotClick(slot)}
                  className={`relative rounded-xl border-2 p-4 transition-all ${
                    isBooked
                      ? "bg-[#3b82f6]/5 border-[#3b82f6]/40 cursor-default"
                      : `${config.bg} ${config.cursor}`
                  }`}
                >
                  {/* Time + Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-bold text-gray-900">
                        {slot.time}
                      </span>
                    </div>
                    {isBooked ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Agendado
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${config.badge}`}
                      >
                        <config.icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    )}
                  </div>

                  {/* Teacher */}
                  <div className="flex items-center gap-1.5 mb-3 text-sm text-gray-600">
                    <User className="w-3.5 h-3.5" />
                    <span>{slot.teacherName}</span>
                  </div>

                  {/* Occupancy bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {slot.enrolled}/{slot.capacity} inscritos
                      </span>
                      <span
                        className={`font-medium ${
                          occ >= 100
                            ? "text-red-500"
                            : occ >= 75
                              ? "text-amber-600"
                              : "text-[#22c55e]"
                        }`}
                      >
                        {occ}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isBooked
                            ? "bg-[#3b82f6]"
                            : occ >= 100
                              ? "bg-red-400"
                              : occ >= 75
                                ? "bg-amber-400"
                                : "bg-[#22c55e]"
                        }`}
                        style={{ width: `${Math.min(occ, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Cutoff warning */}
                  {status === "cutoff" && !isBooked && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      Agendamento encerra 1h antes do início
                    </div>
                  )}

                  {/* Remaining spots */}
                  {status === "available" &&
                    !isBooked &&
                    slot.capacity - slot.enrolled <= 3 && (
                      <div className="mt-2 text-[11px] text-orange-500 font-medium">
                        ⚡ Apenas {slot.capacity - slot.enrolled} vaga
                        {slot.capacity - slot.enrolled > 1 ? "s" : ""} restante
                        {slot.capacity - slot.enrolled > 1 ? "s" : ""}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {daySlots.length === 0 && (
            <Card className="p-10 text-center">
              <p className="text-gray-400">
                Nenhum horário disponível para este dia.
              </p>
            </Card>
          )}
        </>
      )}

      {/* ─── Confirmation Modal ──────────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Confirmar Agendamento</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmModal(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor:
                      PROFILE_COLORS[confirmModal.profile] + "20",
                  }}
                >
                  <CalendarDays
                    className="w-5 h-5"
                    style={{ color: PROFILE_COLORS[confirmModal.profile] }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {PROFILE_NAMES[confirmModal.profile]}
                  </p>
                  <p className="text-xs text-gray-500">Serviço selecionado</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-0.5">Data</p>
                  <p className="font-semibold text-sm">
                    {format(confirmModal.date, "dd/MM/yyyy (EEE)", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-0.5">Horário</p>
                  <p className="font-semibold text-sm">
                    {confirmModal.slot.time}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-0.5">Professor</p>
                <p className="font-semibold text-sm">
                  {confirmModal.slot.teacherName}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Vagas</p>
                  <p className="font-semibold text-sm">
                    {confirmModal.slot.enrolled}/{confirmModal.slot.capacity}{" "}
                    inscritos
                  </p>
                </div>
                <Badge className="bg-[#22c55e]/10 text-[#22c55e]">
                  {confirmModal.slot.capacity - confirmModal.slot.enrolled}{" "}
                  disponíveis
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmModal(null)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#22c55e] hover:bg-[#22c55e]/90 text-white"
                onClick={confirmBooking}
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
