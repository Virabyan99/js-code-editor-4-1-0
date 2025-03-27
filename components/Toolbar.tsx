"use client";
import { useRef, useState, useEffect } from "react";
import IconWithHover from "./IconWithHover";
import { useThemeStore } from "@/store/themeStore";
import { useEditorStore } from "@/store/editorStore";
import { useConsoleStore } from "@/store/consoleStore";
import { toast } from "react-toastify";
import { parse } from "acorn";

interface ToolbarProps {
  consolePanelRef: React.RefObject<{ runCode: (code: string) => void }>;
}

export default function Toolbar({ consolePanelRef }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useThemeStore();
  const { content, setContent } = useEditorStore();
  const { clearOutput, displayMode, toggleDisplayMode, setLoading } = useConsoleStore();
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.filter-dropdown')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

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
    setLoading(true);
    consolePanelRef.current?.runCode(content);
  };

  return (
    <div
      className={`h-[35px] flex flex-row items-center z-50 shadow-xl pl-10 gap-2 ${
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
      <IconWithHover
        variant="trash"
        className="flex items-center w-fit h-fit"
        onClick={() => clearOutput()}
      />
      <div className="relative">
        <IconWithHover
          variant="filter"
          className="flex items-center w-fit h-fit"
          onClick={() => {
            if (isMobile) {
              setDropdownOpen(!dropdownOpen);
            } else {
              toggleDisplayMode();
            }
          }}
        />
        {isMobile && dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-md filter-dropdown z-50">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                useConsoleStore.setState({ displayMode: 'all' });
                setDropdownOpen(false);
              }}
            >
              Show All
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                useConsoleStore.setState({ displayMode: 'lastOnly' });
                setDropdownOpen(false);
              }}
            >
              Show Last Only
            </button>
          </div>
        )}
      </div>
      {!isMobile && (
        <span className="text-sm ml-2">
          {displayMode === "all" ? "Showing All" : "Showing Last Only"}
        </span>
      )}
    </div>
  );
}