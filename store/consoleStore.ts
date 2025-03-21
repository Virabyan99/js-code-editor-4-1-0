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
  displayMode: "all" | "lastOnly"; // New state for display mode
  addOutput: (message: ConsoleMessage) => void;
  clearOutput: () => void;
  toggleDisplayMode: () => void; // New function to toggle mode
}

// Create Zustand store
export const useConsoleStore = create<ConsoleState>((set) => ({
  output: [],
  displayMode: "all", // Default to showing all messages
  // consoleStore.ts
addOutput: (message) =>
  set((state) => {
    console.log("Adding message:", message.text, "with displayMode:", state.displayMode);
    if (state.displayMode === "all") {
      return { output: [...state.output, message] };
    } else if (state.displayMode === "lastOnly") {
      return { output: [message] };
    }
    return { output: [...state.output, message], displayMode: "all" };
  }),
  clearOutput: () => set({ output: [] }),
  toggleDisplayMode: () =>
    set((state) => ({
      displayMode: state.displayMode === "all" ? "lastOnly" : "all",
    })),
}));