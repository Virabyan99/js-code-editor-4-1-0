import { useEffect, useRef } from "react";
import { EditorView, placeholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { basicSetup } from "codemirror";
import { useEditorStore } from "@/store/editorStore";
import { fadeInExtension, addFadeIn } from "./fadeInExtension";

export function useCodeMirror(container: React.RefObject<HTMLDivElement>) {
  const editorViewRef = useRef<EditorView | null>(null);
  const { setContent } = useEditorStore();

  useEffect(() => {
    if (!container.current) return;

    const editorTheme = EditorView.theme({
      "&": {
        fontFamily: "var(--font-fira-code), monospace",
        fontFeatureSettings: '"liga" 1',
        spellCheck: "false",
        "-webkit-font-smoothing": "antialiased",
      },
    });

    // Define the typing animation listener
    const typingAnimationListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const now = Date.now();
        let lastUpdate = 0; // You can move this outside if it needs to persist across updates
        if (now - lastUpdate < 100) return; // Simple debounce
        lastUpdate = now;

        const changes = [];
        update.changes.iterChanges((fromA, toA, fromB, toB) => {
          if (fromB !== toB) {
            changes.push({ from: fromB, to: toB });
          }
        });

        if (changes.length > 0) {
          update.view.dispatch({
            effects: changes.map((change) => addFadeIn.of(change)),
          });
        }
      }
    });

    const state = EditorState.create({
      extensions: [
        basicSetup,
        javascript(),
        placeholder("Start typing..."),
        editorTheme,
        fadeInExtension,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const content = update.state.doc.toString();
            setContent(content);
          }
        }),
        typingAnimationListener, // Add the typing animation listener here
      ],
    });

    const view = new EditorView({
      state,
      parent: container.current,
    });
    editorViewRef.current = view;

    view.focus();

    return () => {
      view.destroy();
    };
  }, [container, setContent]);

  return { editorView: editorViewRef.current };
}