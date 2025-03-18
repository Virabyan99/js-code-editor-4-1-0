import { useEffect, useRef } from 'react';
import {
  EditorView,
  placeholder,
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  rectangularSelection,
  crosshairCursor,
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands';
import { indentOnInput, bracketMatching, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { highlightSelectionMatches } from '@codemirror/search';
import { javascript } from '@codemirror/lang-javascript';
import { useEditorStore } from '@/store/editorStore';
import { fadeInExtension, addFadeIn } from './fadeInExtension';

export function useCodeMirror(container: React.RefObject<HTMLDivElement>) {
  const editorViewRef = useRef<EditorView | null>(null);
  const { setContent } = useEditorStore();

  useEffect(() => {
    if (!container.current) return;

    // Define the editor theme
    const editorTheme = EditorView.theme({
      '&': {
        fontFamily: 'var(--font-fira-code), monospace',
        fontFeatureSettings: '"liga" 1',
        spellCheck: 'false',
        '-webkit-font-smoothing': 'antialiased',
      },
    });

    // Custom setup excluding lineNumbers()
    const mySetup = [
      keymap.of([...defaultKeymap, ...historyKeymap]), // Default keybindings and history navigation
      highlightSpecialChars(),                         // Show special characters (e.g., tabs)
      history(),                                       // Undo/redo support
      drawSelection(),                                 // Custom selection drawing
      EditorState.allowMultipleSelections.of(true),    // Enable multiple cursors
      indentOnInput(),                                 // Auto-indent on input
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }), // Syntax highlighting
      bracketMatching(),                               // Highlight matching brackets
      closeBrackets(),                                 // Auto-close brackets
      autocompletion(),                                // Autocomplete suggestions
      rectangularSelection(),                          // Rectangular (column) selection
      crosshairCursor(),                               // Cursor crosshair for rectangular selection
      highlightActiveLine(),                           // Highlight the active line
      highlightSelectionMatches(),                     // Highlight matching text selections
    ];

    // Typing animation listener
    const typingAnimationListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const now = Date.now();
        let lastUpdate = 0; // Resets each update; move outside if persistence is needed
        if (now - lastUpdate < 100) return;
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

    // Create the editor state
    const state = EditorState.create({
      extensions: [
        ...mySetup,                           // Custom setup without lineNumbers()
        javascript(),                         // JavaScript language support
        placeholder('Start typing...'),       // Placeholder text
        editorTheme,                          // Custom theme
        fadeInExtension,                      // Fade-in effect
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const content = update.state.doc.toString();
            setContent(content);
          }
        }),
        typingAnimationListener,              // Typing animation listener
      ],
    });

    // Initialize the editor view
    const view = new EditorView({
      state,
      parent: container.current,
    });
    editorViewRef.current = view;

    view.focus();

    // Cleanup on unmount
    return () => {
      view.destroy();
    };
  }, [container, setContent]);

  return { editorView: editorViewRef.current };
}