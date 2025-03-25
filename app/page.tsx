"use client";
// page.tsx
import { useRef } from 'react';
import Toolbar from '@/components/Toolbar';
import ResizablePanel from '@/components/ResizablePanels';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const consolePanelRef = useRef<{ runCode: (code: string) => void }>(null);

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col">
      <Toolbar consolePanelRef={consolePanelRef} />
      <ResizablePanel consolePanelRef={consolePanelRef} />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}