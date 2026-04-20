import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CalendarTask, LocationData } from "../types";

interface LawnStore {
  location: LocationData | null;
  grassType: string;
  lawnSize: string;
  issues: string[];
  calendarTasks: CalendarTask[];
  setLocation: (location: LocationData | null) => void;
  setGrassType: (grassType: string) => void;
  setLawnSize: (lawnSize: string) => void;
  setIssues: (issues: string[]) => void;
  setCalendarTasks: (tasks: CalendarTask[]) => void;
}

const useLawnStore = create<LawnStore>()(
  persist(
    (set) => ({
      location: null,
      grassType: "Kentucky Bluegrass",
      lawnSize: "",
      issues: [],
      calendarTasks: [],
      setLocation: (location) => set({ location }),
      setGrassType: (grassType) => set({ grassType }),
      setLawnSize: (lawnSize) => set({ lawnSize }),
      setIssues: (issues) => set({ issues }),
      setCalendarTasks: (tasks) => set({ calendarTasks: tasks }),
    }),
    {
      name: "lawn-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useLawnStore;
