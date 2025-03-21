// store/consoleStore.ts
import { create } from "zustand";

// Define the message object structure
interface ConsoleMessage {
  type: "log" | "warn" | "error";
  text: string;
}

// Define the console state interface
interface ConsoleState {
  output: ConsoleMessage[];
  addOutput: (message: ConsoleMessage) => void;
  clearOutput: () => void;
}

// Create Zustand store
export const useConsoleStore = create<ConsoleState>((set) => ({
  output: [],
  addOutput: (message) =>
    set((state) => ({ output: [...state.output, message] })),
  clearOutput: () => set({ output: [] }), // Resets output to an empty array
}));