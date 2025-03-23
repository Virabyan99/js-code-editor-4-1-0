// store/consoleStore.ts
import { create } from "zustand";

// Define the message object structure
export type ConsoleMessage =
  | { type: "log" | "warn"; text: string }
  | {
      type: "error";
      text: string;
      stack?: string | null;
      source?: string | null;
      lineno?: number | null;
      colno?: number | null;
    }
  | { type: "dir"; data: string } // JSON string for console.dir
  | { type: "table"; data: any } // Object or array for console.table
  | { type: "time"; label: string; duration: string }; // New type for timing

// Define the console state interface
interface ConsoleState {
  allExecutions: ConsoleMessage[][]; // Array of executions, each containing an array of messages
  displayMode: "all" | "lastOnly"; // Toggle between showing all or last execution
  isRunning: boolean; // Track if code is currently running
  addExecutionOutput: (messages: ConsoleMessage[]) => void; // Add output from a single execution
  clearOutput: () => void; // Clear all executions
  toggleDisplayMode: () => void; // Switch display mode
  setIsRunning: (running: boolean) => void; // Set the running state
}

// Create Zustand store
export const useConsoleStore = create<ConsoleState>((set) => ({
  allExecutions: [],
  displayMode: "all", // Default to showing all messages
  isRunning: false, // Default to not running
  addExecutionOutput: (messages) =>
    set((state) => ({
      allExecutions: [...state.allExecutions, messages],
    })),
  clearOutput: () => set({ allExecutions: [] }),
  toggleDisplayMode: () =>
    set((state) => ({
      displayMode: state.displayMode === "all" ? "lastOnly" : "all",
    })),
  setIsRunning: (running) => set({ isRunning: running }),
}));