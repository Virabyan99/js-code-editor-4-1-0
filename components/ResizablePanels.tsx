// components/ResizablePanels.tsx
"use client";

import { useSpring, animated } from "react-spring";
import IconWithHover from "./IconWithHover";
import { useCodeMirror } from "@/hooks/useCodeMirror";
import { useEffect, useRef, useState } from "react";

const MIN_WIDTH_VW = 24;
const MAX_WIDTH_VW = 70;
const INITIAL_WIDTH_VW = 48;

export default function ResizablePanel() {
  const [windowWidth, setWindowWidth] = useState(0);
  const editorContainerRef = useRef<HTMLDivElement>(null); // Ref for the editor container
  const { editorView } = useCodeMirror(editorContainerRef); // Initialize CodeMirror

  // Spring animation for the panel width
  const [props, api] = useSpring(() => ({
    width: INITIAL_WIDTH_VW,
    config: { tension: 200, friction: 50, mass: 1 },
  }));

  // Update window width on mount and resize
  useEffect(() => {
    const updateWindowWidth = () => setWindowWidth(window.innerWidth);
    updateWindowWidth();
    window.addEventListener("resize", updateWindowWidth);
    return () => window.removeEventListener("resize", updateWindowWidth);
  }, []);

  // Handle divider dragging
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
      const clampedWidth = Math.max(MIN_WIDTH_VW, Math.min(MAX_WIDTH_VW, newWidthVw));
      api.start({ width: clampedWidth });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <main className="flex h-screen w-screen flex-col p-[0.25rem] md:flex-row md:p-[0.75rem] gap-2 md:gap-1">
      <animated.div
        className="relative h-1/2 w-full rounded-lg bg-gray-100 p-4 shadow-md md:h-full"
        style={{
          width: windowWidth > 768 ? props.width.to((w) => `${w}vw`) : "100%",
        }}
      >
        {/* Replace static content with CodeMirror */}
        <div ref={editorContainerRef} className="h-full w-full overflow-hidden font-fira" 
            
        />
        <IconWithHover className="absolute left-2 top-2" />
        <IconWithHover className="absolute right-2 top-2" />
        <IconWithHover className="absolute bottom-2 left-2" />
        <IconWithHover className="absolute bottom-2 right-2" />
      </animated.div>
      <div
        className="h-4 w-full md:h-full md:w-1 md:cursor-ew-resize hidden md:block"
        onMouseDown={handleMouseDown}
        role="separator"
        aria-label="Resize panels"
      ></div>
      <div className="relative h-1/2 w-full rounded-lg bg-gray-100 p-4 shadow-md md:h-full md:flex-1">
        <h2 className="ml-7">Right Panel</h2>
        <IconWithHover className="absolute left-2 top-2" />
        <IconWithHover className="absolute right-2 top-2" />
        <IconWithHover className="absolute bottom-2 left-2" />
        <IconWithHover className="absolute bottom-2 right-2" />
      </div>
    </main>
  );
}