// page.tsx
import Toolbar from '@/components/Toolbar';
import ResizablePanel from '@/components/ResizablePanels';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  return (
    <div className="w-[100vw] h-[100vh] flex flex-col">
      <Toolbar />
      <ResizablePanel />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}