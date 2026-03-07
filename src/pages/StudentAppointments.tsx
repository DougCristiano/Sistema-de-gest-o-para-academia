import React from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { AppointmentCard } from "../components/AppointmentCard";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { mockAppointments } from "../data/mockData";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

export const StudentAppointments: React.FC = () => {
  const { currentUser } = useAuth();

  const myAppointments = mockAppointments.filter(
    (apt) => apt.studentId === currentUser?.id,
  );

  const scheduledAppointments = myAppointments.filter(
    (apt) => apt.status === "scheduled",
  );
  const completedAppointments = myAppointments.filter(
    (apt) => apt.status === "completed",
  );
  const cancelledAppointments = myAppointments.filter(
    (apt) => apt.status === "cancelled",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Minhas Aulas</h1>
        <p className="text-gray-600">
          Visualize suas aulas agendadas, concluídas e canceladas
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Agendadas</p>
              <p className="text-2xl font-bold">
                {scheduledAppointments.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold">
                {completedAppointments.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold">
                {cancelledAppointments.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="scheduled">
        <TabsList>
          <TabsTrigger value="scheduled">
            Agendadas ({scheduledAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({completedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas ({cancelledAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="mt-6">
          {scheduledAppointments.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma aula agendada
                </h3>
                <p className="text-gray-600">Agende sua primeira aula!</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduledAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  showStudent={false}
                  showTeacher={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedAppointments.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma aula concluída
                </h3>
                <p className="text-gray-600">
                  Suas aulas concluídas aparecerão aqui
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  showStudent={false}
                  showTeacher={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelledAppointments.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhuma aula cancelada
                </h3>
                <p className="text-gray-600">
                  Ótimo! Você não tem aulas canceladas
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cancelledAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  showStudent={false}
                  showTeacher={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
