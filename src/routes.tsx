import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminEnrolled } from "./pages/AdminEnrolled";
import { AdminNews } from "./pages/AdminNews";
import { AdminAppointments } from "./pages/AdminAppointments";
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { ManagerProfileConfig } from "./pages/ManagerProfileConfig";
import { ManagerAthletes } from "./pages/ManagerAthletes";
import { TeacherSchedule } from "./pages/TeacherSchedule";
import { TeacherStudents } from "./pages/TeacherStudents";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StudentBooking } from "./pages/StudentBooking";
import { StudentAppointments } from "./pages/StudentAppointments";
import { StudentNews } from "./pages/StudentNews";
import { MyProfile } from "./pages/MyProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        path: "login",
        Component: Login,
      },
      {
        path: "",
        Component: Layout,
        children: [
          {
            index: true,
            element: <Navigate to="/login" replace />,
          },
          // Admin routes
          {
            path: "admin",
            Component: AdminDashboard,
          },
          {
            path: "admin/users",
            Component: AdminUsers,
          },
          {
            path: "admin/enrolled",
            Component: AdminEnrolled,
          },
          {
            path: "admin/appointments",
            Component: AdminAppointments,
          },
          {
            path: "admin/news",
            Component: AdminNews,
          },
          // Manager routes
          {
            path: "manager",
            Component: ManagerDashboard,
          },
          {
            path: "manager/athletes",
            Component: ManagerAthletes,
          },
          {
            path: "manager/teachers",
            Component: ManagerDashboard,
          },
          {
            path: "manager/appointments",
            Component: ManagerDashboard,
          },
          {
            path: "manager/add-teacher",
            Component: AdminUsers,
          },
          {
            path: "manager/config",
            Component: ManagerProfileConfig,
          },
          // Teacher routes
          {
            path: "teacher",
            Component: TeacherSchedule,
          },
          {
            path: "teacher/students",
            Component: TeacherStudents,
          },
          // Booking route (shared for staff who are also students)
          {
            path: "booking",
            Component: StudentBooking,
          },
          // Student routes
          {
            path: "student",
            Component: StudentDashboard,
          },
          {
            path: "student/booking",
            Component: StudentBooking,
          },
          {
            path: "student/appointments",
            Component: StudentAppointments,
          },
          {
            path: "student/news",
            Component: StudentNews,
          },
          // Shared route - My Profile (all roles)
          {
            path: "profile",
            Component: MyProfile,
          },
        ],
      },
    ],
  },
]);
