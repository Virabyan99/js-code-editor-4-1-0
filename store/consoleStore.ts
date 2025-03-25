import { create } from 'zustand';

export type ConsoleMessage =
<<<<<<< HEAD
  | { type: 'log' | 'warn' | 'error'; text: string }
  | { type: 'dir'; data: string }
  | { type: 'table'; data: any }
  | { type: 'time'; label: string; duration: string };

interface Execution {
  id: string;
  messages: ConsoleMessage[];
}

interface ConsoleState {
  allExecutions: Execution[];
  displayMode: 'all' | 'lastOnly';
  startNewExecution: () => string;
  addMessageToExecution: (executionId: string, message: ConsoleMessage) => void;
  clearOutput: () => void;
  toggleDisplayMode: () => void;
=======
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
>>>>>>> 8a59c8ffe1bff1e2f10b47eb43cbe017e0077245
}

export const useConsoleStore = create<ConsoleState>((set) => ({
  allExecutions: [],
<<<<<<< HEAD
  displayMode: 'all',
  startNewExecution: () => {
    const executionId = Date.now().toString();
    set((state) => ({ allExecutions: [...state.allExecutions, { id: executionId, messages: [] }] }));
    return executionId;
  },
  addMessageToExecution: (executionId, message) => {
    set((state) => {
      const executions = state.allExecutions.map((exec) => {
        if (exec.id === executionId) {
          return { ...exec, messages: [...exec.messages, message] };
        }
        return exec;
      });
      return { allExecutions: executions };
    });
  },
  clearOutput: () => set({ allExecutions: [] }),
  toggleDisplayMode: () =>
    set((state) => ({ displayMode: state.displayMode === 'all' ? 'lastOnly' : 'all' })),
=======
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
>>>>>>> 8a59c8ffe1bff1e2f10b47eb43cbe017e0077245
}));