// store/consoleStore.ts
import { create } from 'zustand';

export type ConsoleMessage =
  | { type: 'log' | 'warn' | 'error'; text: string; stack?: string | null }
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
  isLoading: boolean;
  startNewExecution: () => string;
  addMessageToExecution: (executionId: string, message: ConsoleMessage) => void;
  clearOutput: () => void;
  toggleDisplayMode: () => void;
  setLoading: (loading: boolean) => void;
}

export const useConsoleStore = create<ConsoleState>((set) => ({
  allExecutions: [],
  displayMode: 'all',
  isLoading: false,
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
  setLoading: (loading) => set({ isLoading: loading }),
}));