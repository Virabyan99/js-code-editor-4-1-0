// store/consoleStore.ts
import { create } from "zustand";

// Define the message object structure
// store/consoleStore.ts
export type ConsoleMessage =
  | { type: "log" | "warn" | "error"; text: string }
  | { type: "dir"; data: string }       // JSON string for console.dir
  | { type: "table"; data: any };       // Object or array for console.table

// Define the console state interface
interface ConsoleState {
  allExecutions: ConsoleMessage[][]; // Array of executions, each containing an array of messages
  displayMode: "all" | "lastOnly"; // Toggle between showing all or last execution
  addExecutionOutput: (messages: ConsoleMessage[]) => void; // Add output from a single execution
  clearOutput: () => void; // Clear all executions
  toggleDisplayMode: () => void; // Switch display mode
}

// Create Zustand store
export const useConsoleStore = create<ConsoleState>((set) => ({
  allExecutions: [],
  displayMode: "all", // Default to showing all messages
  addExecutionOutput: (messages) =>
    set((state) => ({
      allExecutions: [...state.allExecutions, messages],
    })),
  clearOutput: () => set({ allExecutions: [] }),
  toggleDisplayMode: () =>
    set((state) => ({
      displayMode: state.displayMode === "all" ? "lastOnly" : "all",
    })),
}));