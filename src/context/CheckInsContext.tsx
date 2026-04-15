import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckIn } from "../types";
import { mockCheckIns } from "../data/mockData";

interface CheckInsContextValue {
  checkIns: CheckIn[];
  addCheckIn: (ci: CheckIn) => void;
  getStudentCheckIns: (studentId: string) => CheckIn[];
  getTodayCheckIns: (date: string) => CheckIn[];
}

const CheckInsContext = createContext<CheckInsContextValue | null>(null);

export const CheckInsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => [...mockCheckIns]);

  const addCheckIn = useCallback((ci: CheckIn) => {
    setCheckIns((prev) => [...prev, ci]);
  }, []);

  const getStudentCheckIns = useCallback(
    (studentId: string) => checkIns.filter((ci) => ci.studentId === studentId),
    [checkIns]
  );

  const getTodayCheckIns = useCallback(
    (date: string) => checkIns.filter((ci) => ci.date === date),
    [checkIns]
  );

  return (
    <CheckInsContext.Provider value={{ checkIns, addCheckIn, getStudentCheckIns, getTodayCheckIns }}>
      {children}
    </CheckInsContext.Provider>
  );
};

export const useCheckIns = (): CheckInsContextValue => {
  const ctx = useContext(CheckInsContext);
  if (!ctx) throw new Error("useCheckIns must be used inside CheckInsProvider");
  return ctx;
};
