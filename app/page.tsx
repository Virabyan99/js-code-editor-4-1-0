// page.tsx
import ResizablePanel from "@/components/ResizablePanels";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  return (
    <div>
      <ResizablePanel />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}