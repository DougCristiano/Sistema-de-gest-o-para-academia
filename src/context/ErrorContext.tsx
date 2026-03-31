import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface ErrorMessage {
  id: string;
  message: string;
  type: "error" | "warning" | "info";
  duration?: number;
}

interface ErrorContextType {
  errors: ErrorMessage[];
  addError: (message: string, duration?: number) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  const addError = useCallback((message: string, duration = 5000) => {
    const id = `error-${Date.now()}`;
    const errorMessage: ErrorMessage = {
      id,
      message,
      type: "error",
      duration,
    };

    setErrors((prev) => [...prev, errorMessage]);

    // Auto-remover após duração
    if (duration > 0) {
      setTimeout(() => {
        removeError(id);
      }, duration);
    }
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider
      value={{
        errors,
        addError,
        removeError,
        clearErrors,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorHandler must be used within ErrorProvider");
  }
  return context;
};
