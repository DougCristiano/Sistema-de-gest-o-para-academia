import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ErrorProvider } from "./context/ErrorContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GlobalErrorToast } from "./components/GlobalErrorToast";

export default function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <RouterProvider router={router} />
        <GlobalErrorToast />
      </ErrorProvider>
    </ErrorBoundary>
  );
}
