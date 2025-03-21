"use client";
// components/Toolbar.tsx
import { useRef, useState, useEffect } from "react";
import IconWithHover from "./IconWithHover";
import { useThemeStore } from "@/store/themeStore";
import { useEditorStore } from "@/store/editorStore";
import { useConsoleStore } from "@/store/consoleStore";
import { toast } from "react-toastify";
import { parse } from "acorn";
import { IconTrash } from "@tabler/icons-react"; // Added IconTrash import

export default function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useThemeStore();
  const { content, setContent } = useEditorStore();
  const { addOutput, clearOutput } = useConsoleStore(); // Destructure clearOutput
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  // Get a reference to the sandbox iframe
  useEffect(() => {
    const sandboxIframe = document.querySelector(
      'iframe[title="Sandboxed Code Execution"]'
    ) as HTMLIFrameElement | null;
    console.log("Iframe found:", sandboxIframe); // Debug log
    if (sandboxIframe) {
      setIframeRef(sandboxIframe);
    }
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("File size exceeds 1MB");
      return;
    }

    if (!file.name.endsWith(".js")) {
      toast.error("Only .js files are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      try {
        parse(fileContent, { ecmaVersion: "latest" });
        setContent(fileContent);
      } catch (error) {
        toast.error("Invalid JavaScript file");
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (content.length === 0) {
      toast.error("Editor is empty");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${timestamp}.js`;
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRunCode = () => {
    if (content.trim().length === 0) return;
    console.log("Sending code to iframe:", content, "Iframe ref:", iframeRef); // Debug log
    if (iframeRef && iframeRef.contentWindow) {
      iframeRef.contentWindow.postMessage(content, "*");
    }
  };

  return (
    <div
      className={`h-[35px] flex flex-row items-center z-50 shadow-xl pl-10 gap-2 shadow-xl ${
        theme === "dark"
          ? "bg-gray-800 text-white"
          : "bg-gray-100 border-b-2 border-gray-200 text-black"
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
        variant={theme === "light" ? "moon" : "sun"}
        className="flex items-center w-fit h-fit"
        onClick={toggleTheme}
      />
      <IconWithHover
        variant="run"
        onClick={handleRunCode}
        className="w-fit h-fit flex items-center lg:ml-[420px]"
      />
      {/* New "Clear" button */}
      <IconWithHover
        variant="trash"
        className="flex items-center w-fit h-fit"
        onClick={() => clearOutput()} // Calls clearOutput on click
      />
    </div>
  );
}