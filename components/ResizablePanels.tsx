// components/ResizablePanels.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import IconWithHover from './IconWithHover'
import { useCodeMirror } from '@/hooks/useCodeMirror'
import { toast } from 'react-toastify'
import { parse } from 'acorn'
import { useThemeStore } from '@/store/themeStore'
import ConsolePanel from './ConsolePanel'
import { useConsoleStore } from '@/store/consoleStore'
import { evaluateCode } from '@/utils/evaluateCode'

const MIN_WIDTH_VW = 24
const MAX_WIDTH_VW = 70
const INITIAL_WIDTH_VW = 48

export default function ResizablePanel() {
  const [windowWidth, setWindowWidth] = useState(0)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const { editorView } = useCodeMirror(editorContainerRef)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, toggleTheme } = useThemeStore()
  const { addOutput } = useConsoleStore()

  const [props, api] = useSpring(() => ({
    width: INITIAL_WIDTH_VW,
    config: { tension: 200, friction: 50, mass: 1 },
  }))

  useEffect(() => {
    const updateWindowWidth = () => setWindowWidth(window.innerWidth)
    updateWindowWidth()
    window.addEventListener('resize', updateWindowWidth)
    return () => window.removeEventListener('resize', updateWindowWidth)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const initialMouseX = e.clientX
    const initialWidthVw = props.width.get()

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      if (windowWidth === 0) return
      const deltaX = e.clientX - initialMouseX
      const deltaVw = (deltaX / windowWidth) * 100
      const newWidthVw = initialWidthVw + deltaVw
      const clampedWidth = Math.max(
        MIN_WIDTH_VW,
        Math.min(MAX_WIDTH_VW, newWidthVw)
      )
      api.start({ width: clampedWidth })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      toast.error('File size exceeds 1MB')
      return
    }

    if (!file.name.endsWith('.js')) {
      toast.error('Only .js files are allowed')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      try {
        parse(content, { ecmaVersion: 'latest' })
        if (editorView) {
          editorView.dispatch({
            changes: {
              from: 0,
              to: editorView.state.doc.length,
              insert: content,
            },
          })
        }
      } catch (error) {
        toast.error('Invalid JavaScript file')
      }
    }
    reader.readAsText(file)
  }

  const handleDownload = () => {
    if (!editorView || editorView.state.doc.length === 0) {
      toast.error('Editor is empty')
      return
    }

    const content = editorView.state.doc.toString()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${timestamp}.js`
    const blob = new Blob([content], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleRunCode = () => {
    const code = editorView?.state.doc.toString() || ''
    if (code.trim().length === 0) return

    const outputs = evaluateCode(code) // Execute
    outputs.forEach((line) => addOutput(line)) // Display in console
  }

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col">
      <div
        className={`h-[35px] flex flex-row items-center shadow-2xl pl-10 gap-2 shadow-xl ${
          theme === 'dark' ? 'bg-gray-800  text-white' : 'bg-gray-100 border-b-2 border-gray-200  text-black'
        }`}
      >
        
        <IconWithHover
          variant="upload"
          className="flex items-center w-fit h-fit"
          onClick={triggerFileInput}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".js"
          className="hidden"
        />
        <IconWithHover
          variant="download"
          className="flex items-center w-fit h-fit"
          onClick={handleDownload}
        />
        
          <IconWithHover
            variant={theme === 'light' ? 'moon' : 'sun'}
            className="flex items-center w-fit h-fit"
            onClick={toggleTheme}
          />
          <IconWithHover
          variant="run"
          onClick={handleRunCode}
          className='w-fit h-fit flex items-center  lg:ml-[420px]'
        />
        
      </div>
      <main
        className={`flex flex-1 w-screen overflow-hidden  ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
        }`}
      >
        <animated.div
          className={`relative h-full w-full rounded-[7px] p-4 shadow-md md:h-full ${
            theme === 'dark'
              ? 'bg-gray-700 text-gray-100'
              : 'bg-gray-100 text-gray-900'
          }`}
          style={{
            width: windowWidth > 768 ? props.width.to((w) => `${w}vw`) : '100%',
          }}
        >
          <div
            ref={editorContainerRef}
            className={`h-full overflow-hidden text-[16px] font-fira theme-${theme}`}
          />
        </animated.div>
        <div
          className={`h-4 w-full md:h-full md:w-1 rounded-2xl md:cursor-ew-resize hidden md:block ${
            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
          } `}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-label="Resize panels"
        ></div>
        <div
          className={`relative h-full w-full rounded-[7px] p-4 shadow-md md:h-full md:flex-1 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}
        >
          <ConsolePanel />
         
        </div>
      </main>
    </div>
  )
}