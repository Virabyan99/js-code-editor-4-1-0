// components/ResizablePanels.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import IconWithHover from './IconWithHover'
import { useCodeMirror } from '@/hooks/useCodeMirror'
import { toast } from 'react-toastify'
import { parse } from 'acorn'
import { useThemeStore } from '@/store/themeStore'
import { Console } from 'console'
import ConsolePanel from './ConsolePanel'

const MIN_WIDTH_VW = 24
const MAX_WIDTH_VW = 70
const INITIAL_WIDTH_VW = 48

export default function ResizablePanel() {
  const [windowWidth, setWindowWidth] = useState(0)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const { editorView } = useCodeMirror(editorContainerRef)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, toggleTheme } = useThemeStore()

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

  return (
    <main
      className={`flex h-screen w-screen flex-col p-[0.25rem] md:flex-row md:p-[0.75rem] gap-2 md:gap-1 ${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
      }`}>
      <animated.div
        className={`relative h-1/2 w-full rounded-[7px] p-4 shadow-md md:h-full ${
          theme === 'dark'
            ? 'bg-gray-700 text-gray-100'
            : 'bg-gray-100 text-gray-900'
        }`}
        style={{
          width: windowWidth > 768 ? props.width.to((w) => `${w}vw`) : '100%',
        }}>
        <div
          ref={editorContainerRef}
          className={`h-[500px] w-[98%] mt-3 mr-6  overflow-hidden text-[16px]  font-fira theme-${theme}`}
        />{' '}
        <IconWithHover
          variant="upload"
          className="absolute bottom-2 left-2"
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
          className="absolute left-2 top-2"
          onClick={handleDownload}
        />
        <IconWithHover className="absolute right-2 top-2" />
        <IconWithHover className="absolute bottom-2 right-2" />
      </animated.div>
      <div
        className="h-4 w-full md:h-full md:w-1 md:cursor-ew-resize hidden md:block"
        onMouseDown={handleMouseDown}
        role="separator"
        aria-label="Resize panels"></div>
      <div
        className={`relative h-1/2 w-full rounded-[7px] p-4 shadow-md md:h-full md:flex-1 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
        <ConsolePanel />
        <IconWithHover className="absolute left-2 top-2" />
        <IconWithHover className="absolute right-2 top-2" />
        <IconWithHover
          variant={theme === 'light' ? 'moon' : 'sun'}
          className="absolute bottom-2 left-2"
          onClick={toggleTheme}
        />
        <IconWithHover className="absolute bottom-2 right-2" />
      </div>
    </main>
  )
}
