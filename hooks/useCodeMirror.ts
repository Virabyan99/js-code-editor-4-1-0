import { useEffect, useRef } from 'react'
import {
  EditorView,
  placeholder,
  keymap,
  drawSelection,
  lineNumbers,

} from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import {
  indentOnInput,
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
        }
      });
  
      // Custom setup excluding lineNumbers()
      const mySetup = [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
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
