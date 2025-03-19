import { create } from "zustand";

// Define the Console State interface
interface ConsoleState {
  output: string[];                         // Holds all console messages
  addOutput: (message: string) => void;     // Adds a new message
  clearOutput: () => void;                  // Clears all output (future-proofing)
}

// Create Zustand store
export const useConsoleStore = create<ConsoleState>((set) => ({
  output: [],
  addOutput: (message) =>
    set((state) => ({ output: [...state.output, message] })),
  clearOutput: () => set({ output: [] }),
}));
