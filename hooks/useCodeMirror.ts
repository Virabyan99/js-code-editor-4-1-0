import { useEffect, useRef } from "react";
import { EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor, rectangularSelection, crosshairCursor, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { foldGutter } from "@codemirror/language";
import {basicSetup} from "codemirror"


export function useCodeMirror(container: React.RefObject<HTMLDivElement>) {
  const editorViewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!container.current) return;

    const view = new EditorView({
      parent: container.current,
      extensions: [
        basicSetup
      ],
      doc: `console.log("Hello, world!");`,
    });
    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [container]);

  return { editorView: editorViewRef.current };
}