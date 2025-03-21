import { create } from "zustand";

interface EditorState {
  content: string;
  setContent: (content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: "",
  setContent: (content) => set({ content }),
}));