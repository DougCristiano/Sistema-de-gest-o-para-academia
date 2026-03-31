import { createBrowserRouter, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import { RootLayout } from "./components/RootLayout";
import { Layout } from "./components/Layout";
import { LoadingFallback } from "./components/LoadingFallback";
import { Login } from "./pages/Login";

// Lazy-loaded pages for code splitting and better performance
const AdminDashboard = lazy(() =>
  import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const AdminUsers = lazy(() =>
  import("./pages/AdminUsers").then((m) => ({ default: m.AdminUsers }))
);
const AdminEnrolled = lazy(() =>
  import("./pages/AdminEnrolled").then((m) => ({ default: m.AdminEnrolled }))
);
const AdminNews = lazy(() => import("./pages/AdminNews").then((m) => ({ default: m.AdminNews })));
const AdminServices = lazy(() =>
  import("./pages/AdminServices").then((m) => ({ default: m.AdminServices }))
);
const AdminAppointments = lazy(() =>
  import("./pages/AdminAppointments").then((m) => ({ default: m.AdminAppointments }))
);
const ManagerDashboard = lazy(() =>
  import("./pages/ManagerDashboard").then((m) => ({ default: m.ManagerDashboard }))
);
const ManagerProfileConfig = lazy(() =>
  import("./pages/ManagerProfileConfig").then((m) => ({ default: m.ManagerProfileConfig }))
);
const ManagerAthletes = lazy(() =>
  import("./pages/ManagerAthletes").then((m) => ({ default: m.ManagerAthletes }))
);
const TeacherSchedule = lazy(() =>
  import("./pages/TeacherSchedule").then((m) => ({ default: m.TeacherSchedule }))
);
const TeacherStudents = lazy(() =>
  import("./pages/TeacherStudents").then((m) => ({ default: m.TeacherStudents }))
);
const StudentDashboard = lazy(() =>
  import("./pages/StudentDashboard").then((m) => ({ default: m.StudentDashboard }))
);
const StudentBooking = lazy(() =>
  import("./pages/StudentBooking").then((m) => ({ default: m.StudentBooking }))
);
const StudentAppointments = lazy(() =>
  import("./pages/StudentAppointments").then((m) => ({ default: m.StudentAppointments }))
);
const StudentNews = lazy(() =>
  import("./pages/StudentNews").then((m) => ({ default: m.StudentNews }))
);
const MyProfile = lazy(() => import("./pages/MyProfile").then((m) => ({ default: m.MyProfile })));

// Mobile pages (lazy-loaded)
const MobileDashboard = lazy(() =>
  import("./mobile/pages/MobileDashboard").then((m) => ({ default: m.MobileDashboard }))
);
const MobileBooking = lazy(() =>
  import("./mobile/pages/MobileBooking").then((m) => ({ default: m.MobileBooking }))
);
const MobileProfile = lazy(() =>
  import("./mobile/pages/MobileProfile").then((m) => ({ default: m.MobileProfile }))
);
const MobileNews = lazy(() =>
  import("./mobile/pages/MobileNews").then((m) => ({ default: m.MobileNews }))
);
const MobileAppointments = lazy(() =>
  import("./mobile/pages/MobileAppointments").then((m) => ({ default: m.MobileAppointments }))
);

/**
 * Helper wrapper para Suspense + lazy components
 */
const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

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
            element: withSuspense(AdminDashboard),
          },
          {
            path: "admin/users",
            element: withSuspense(AdminUsers),
          },
          {
            path: "admin/enrolled",
            element: withSuspense(AdminEnrolled),
          },
          {
            path: "admin/appointments",
            element: withSuspense(AdminAppointments),
          },
          {
            path: "admin/news",
            element: withSuspense(AdminNews),
          },
          {
            path: "admin/services",
            element: withSuspense(AdminServices),
          },
          // Manager routes
          {
            path: "manager",
            element: withSuspense(ManagerDashboard),
          },
          {
            path: "manager/athletes",
            element: withSuspense(ManagerAthletes),
          },
          {
            path: "manager/teachers",
            element: withSuspense(ManagerDashboard),
          },
          {
            path: "manager/appointments",
            element: withSuspense(ManagerDashboard),
          },
          {
            path: "manager/add-teacher",
            element: withSuspense(AdminUsers),
          },
          {
            path: "manager/config",
            element: withSuspense(ManagerProfileConfig),
          },
          // Teacher routes
          {
            path: "teacher",
            element: withSuspense(TeacherSchedule),
          },
          {
            path: "teacher/students",
            element: withSuspense(TeacherStudents),
          },
          // Booking route (shared for staff who are also students)
          {
            path: "booking",
            element: withSuspense(StudentBooking),
          },
          // Student routes
          {
            path: "student",
            element: withSuspense(StudentDashboard),
          },
          {
            path: "student/booking",
            element: withSuspense(StudentBooking),
          },
          {
            path: "student/appointments",
            element: withSuspense(StudentAppointments),
          },
          {
            path: "student/news",
            element: withSuspense(StudentNews),
          },
          // Shared route - My Profile (all roles)
          {
            path: "profile",
            element: withSuspense(MyProfile),
          },
        ],
      },
      // Mobile routes (separate from web layout)
      {
        path: "mobile",
        Component: ({ children }) => <div>{children}</div>,
        children: [
          {
            index: true,
            element: <Navigate to="/mobile/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: withSuspense(MobileDashboard),
          },
          {
            path: "booking",
            element: withSuspense(MobileBooking),
          },
          {
            path: "profile",
            element: withSuspense(MobileProfile),
          },
          {
            path: "news",
            element: withSuspense(MobileNews),
          },
          {
            path: "appointments",
            element: withSuspense(MobileAppointments),
          },
        ],
      },
    ],
  },
]);
