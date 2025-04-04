'use client';
import { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { useCodeMirror } from '@/hooks/useCodeMirror';
import { useThemeStore } from '@/store/themeStore';
import ConsolePanel from './ConsolePanel';

interface ResizablePanelProps {
  consolePanelRef: React.RefObject<{ runCode: (code: string) => void }>;
}

const MIN_WIDTH_VW = 24;
const MAX_WIDTH_VW = 70;
const INITIAL_WIDTH_VW = 48;

export default function ResizablePanel({ consolePanelRef }: ResizablePanelProps) {
  const [windowWidth, setWindowWidth] = useState(0);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { editorView } = useCodeMirror(editorContainerRef);
  const { theme } = useThemeStore();

  const [props, api] = useSpring(() => ({
    width: INITIAL_WIDTH_VW,
    config: { tension: 200, friction: 50, mass: 1 },
  }));

  useEffect(() => {
    const updateWindowWidth = () => setWindowWidth(window.innerWidth);
    updateWindowWidth();
    window.addEventListener('resize', updateWindowWidth);
    return () => window.removeEventListener('resize', updateWindowWidth);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const initialMouseX = e.clientX;
    const initialWidthVw = props.width.get();

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (windowWidth === 0) return;
      const deltaX = e.clientX - initialMouseX;
      const deltaVw = (deltaX / windowWidth) * 100;
      const newWidthVw = initialWidthVw + deltaVw;
      const clampedWidth = Math.max(
        MIN_WIDTH_VW,
        Math.min(MAX_WIDTH_VW, newWidthVw)
      );
      api.start({ width: clampedWidth });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <main
      className={`flex flex-col md:flex-row  flex-1 w-screen overflow-hidden ${
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
          width:
            windowWidth > 768 || windowWidth === 0
              ? props.width.to((w) => `${w}vw`)
              : '100%',
        }}
      >
        <div
          className={`absolute w-2 h-2 z-20 bottom-4 right-4 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}
        ></div>
        <div
          ref={editorContainerRef}
          className={`h-full overflow-hidden text-[16px] font-fira theme-${theme}`}
        />
      </animated.div>
      <div
        className={`h-4 w-full md:h-full md:w-[2px] rounded-2xl md:cursor-ew-resize hidden md:block ${
          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
        }`}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-label="Resize panels"
      ></div>
      <div
        className={`relative h-full w-full rounded-[7px] p-4 shadow-md md:h-full md:flex-1 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        }`}
      >
        <ConsolePanel ref={consolePanelRef} />
      </div>
    </main>
  );
}