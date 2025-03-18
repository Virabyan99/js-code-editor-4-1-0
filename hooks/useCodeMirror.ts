import { useEffect, useRef } from 'react'
import {
  EditorView,
  placeholder,
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
  highlightWhitespace,
} from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, historyKeymap, history, lineUncomment, selectLineEnd, selectLine, selectCharLeft } from '@codemirror/commands'
import {
  indentOnInput,
  bracketMatching,
  syntaxHighlighting,
  defaultHighlightStyle,
  highlightingFor,
} from '@codemirror/language'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { highlightSelectionMatches } from '@codemirror/search'
import { javascript } from '@codemirror/lang-javascript'
import { useEditorStore } from '@/store/editorStore'
import { fadeInExtension, addFadeIn } from './fadeInExtension'

export function useCodeMirror(container: React.RefObject<HTMLDivElement>) {
    const editorViewRef = useRef<EditorView | null>(null)
    const { setContent } = useEditorStore()
  
    useEffect(() => {
      if (!container.current) return
  
      // Define the editor theme
      const editorTheme = EditorView.theme({
        '&': {
          fontFamily: 'var(--font-fira-code), monospace',
          fontFeatureSettings: '"liga" 1',
          spellCheck: 'false',
          '-webkit-font-smoothing': 'antialiased',
        },
        '.cm-line': {
          borderBottom: 'none !important',
        },
        '.cm-activeLine': {
          borderBottom: 'none !important',
          textDecoration: 'none !important',
          background: 'none !important',
        },
        '.cm-focused .cm-activeLine': {
          borderBottom: 'none !important',
        },
        '.cm-cursor': {
          borderBottom: 'none !important',
          borderLeft: '1px solid black',
        },
        '.cm-line::after, .cm-activeLine::after': {
          display: 'none !important',
          content: 'none !important',
        },
      });
  
      // Custom setup excluding lineNumbers()
      const mySetup = [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        //highlightSpecialChars(),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        //highlightActiveLine(),
        highlightSelectionMatches(),
        lineNumbers(),
        
      ]
  
      // Typing animation listener (unchanged)
      const typingAnimationListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const now = Date.now()
          let lastUpdate = 0
          if (now - lastUpdate < 100) return
          lastUpdate = now
  
          const changes = []
          update.changes.iterChanges((fromA, toA, fromB, toB) => {
            if (fromB !== toB) {
              changes.push({ from: fromB, to: toB })
            }
          })
  
          if (changes.length > 0) {
            update.view.dispatch({
              effects: changes.map((change) => addFadeIn.of(change)),
            })
          }
        }
      })
  
      // Create the editor state
      const state = EditorState.create({
        extensions: [
          editorTheme,
          ...mySetup,
          javascript(),
          placeholder('Start typing...'),
          fadeInExtension,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const content = update.state.doc.toString()
              setContent(content)
            }
          }),
          typingAnimationListener,
        ],
      })
  
      // Initialize the editor view
      const view = new EditorView({
        state,
        parent: container.current,
      })
      editorViewRef.current = view
  
      view.focus()
  
      // Cleanup on unmount
      return () => {
        view.destroy()
      }
    }, [container, setContent])
  
    return { editorView: editorViewRef.current }
  }
