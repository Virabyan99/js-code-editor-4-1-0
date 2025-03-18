import { useEffect, useRef } from "react";
import { EditorView, placeholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { basicSetup } from "codemirror";
import { useEditorStore } from "@/store/editorStore";

export function useCodeMirror(container: React.RefObject<HTMLDivElement>) {
  const editorViewRef = useRef<EditorView | null>(null);
  const { setContent } = useEditorStore();

  useEffect(() => {
    if (!container.current) return;

    // Define the editor state with placeholder and JavaScript syntax
    const state = EditorState.create({
      extensions: [
        basicSetup,
        javascript(),
        placeholder("Start typing..."), // Add placeholder
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            // Update Zustand store when content changes
            const content = update.state.doc.toString();
            setContent(content);
          }
        }),
      ],
    });

    // Create the editor view
    const view = new EditorView({
      state,
      parent: container.current,
    });
    editorViewRef.current = view;

    // Auto-focus the editor on mount
    view.focus();

    // Cleanup
    return () => {
      view.destroy();
    };
  }, [container, setContent]);

  return { editorView: editorViewRef.current };
}
