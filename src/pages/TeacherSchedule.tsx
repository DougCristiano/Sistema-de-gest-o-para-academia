import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { AppointmentCard } from "../components/AppointmentCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Calendar, Clock, Users } from "lucide-react";
import { mockAppointments, mockWeeklyAppointments } from "../data/mockData";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const TeacherSchedule: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<
    "today" | "tomorrow" | "week"
  >("today");

  // Filtrar agendamentos do professor
  const myAppointments = mockAppointments.filter(
    (apt) => apt.teacherId === currentUser?.id,
  );

  const todayAppointments = myAppointments.filter((apt) => isToday(apt.date));
  const tomorrowAppointments = myAppointments.filter((apt) =>
    isTomorrow(apt.date),
  );
  const weekAppointments = myAppointments.filter((apt) => {
    const weekFromNow = addDays(new Date(), 7);
    return apt.date <= weekFromNow;
  });

  const getAppointments = () => {
    switch (selectedDate) {
      case "today":
        return todayAppointments;
      case "tomorrow":
        return tomorrowAppointments;
      case "week":
        return weekAppointments;
      default:
        return todayAppointments;
    }
  };

  const appointments = getAppointments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Minha Agenda</h1>
        <p className="text-gray-600">
          Visualize e gerencie suas aulas agendadas
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="bg-[#3b82f6]/10 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hoje</p>
              <p className="text-2xl font-bold">{todayAppointments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="bg-[#22c55e]/10 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-[#22c55e]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Amanhã</p>
              <p className="text-2xl font-bold">
                {tomorrowAppointments.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="bg-[#eab308]/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-[#eab308]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold">{weekAppointments.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">
          Distribuição Semanal de Aulas
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={mockWeeklyAppointments}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Bar
              dataKey="appointments"
              fill="#22c55e"
              radius={[8, 8, 0, 0]}
              name="Aulas"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabs */}
      <Tabs
        value={selectedDate}
        onValueChange={(value: any) => setSelectedDate(value)}
      >
        <TabsList>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="tomorrow">Amanhã</TabsTrigger>
          <TabsTrigger value="week">Esta Semana</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedDate} className="mt-6">
          {appointments.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma aula agendada
                </h3>
                <p className="text-gray-600">
                  Você não tem aulas agendadas para este período
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Group appointments by date */}
              {Array.from(
                new Set(appointments.map((apt) => apt.date.toDateString())),
              ).map((dateString) => {
                const date = new Date(dateString);
                const dayAppointments = appointments
                  .filter((apt) => apt.date.toDateString() === dateString)
                  .sort((a, b) => a.time.localeCompare(b.time));

                return (
                  <div key={dateString}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dayAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          showStudent={true}
                          showTeacher={false}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
