import { IconCircleDotted, IconUpload, IconDownload, IconSun, IconMoon, IconPlayerPlay, IconTrash, IconFilter } from "@tabler/icons-react"; // Added IconFilter
import { useThemeStore } from "@/store/themeStore"; // Adjust the import path as needed
import { useState } from "react";

interface IconWithHoverProps {
  className?: string;
  variant?: "circle" | "upload" | "download" | "sun" | "moon" | "run" | "trash" | "filter"; // Added "filter"
  onClick?: () => void;
}

export default function IconWithHover({
  className,
  variant = "circle",
  onClick,
}: IconWithHoverProps) {
  // Get the current theme from the theme store
  const { theme } = useThemeStore();

  // Set initial colors based on the theme (same for all variants)
  const initialBgColor = theme === "light" ? "#f3f4f6" : "#1e2939";
  const initialIconColor = theme === "light" ? "#000000" : "#f3f4f6";

  // State to manage hover effect
  const [isHovered, setIsHovered] = useState(false);

  // Determine the icon component based on the variant prop
  const IconComponent =
    variant === "upload"
      ? IconUpload
      : variant === "download"
      ? IconDownload
      : variant === "sun"
      ? IconSun
      : variant === "moon"
      ? IconMoon
      : variant === "run"
      ? IconPlayerPlay
      : variant === "trash"
      ? IconTrash
      : variant === "filter" // Added "filter" variant
      ? IconFilter
      : IconCircleDotted;

  return (
    <div
      onMouseEnter={() => {
        if (variant !== "run") setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (variant !== "run") setIsHovered(false);
      }}
      className={`rounded-sm transition-all duration-700 ease-in-out ${
        variant === "run"
          ? `px-1 border  ${theme === "light" ? "border-gray-300" : "border-gray-700"} cursor-pointer`
          : "p-1"
      } ${className}`}
      style={{
        backgroundColor: isHovered ? "#000000" : initialBgColor,
        transform: isHovered ? "scale(1.1)" : "scale(1)",
      }}
      role="button"
      aria-label={
        variant === "upload"
          ? "Upload JavaScript file"
          : variant === "download"
          ? "Download code"
          : variant === "sun" || variant === "moon"
          ? "Toggle theme"
          : variant === "run"
          ? "Run code"
          : variant === "trash"
          ? "Clear console"
          : variant === "filter" // Added accessibility label
          ? "Toggle display mode"
          : "Interactive icon"
      }
      onClick={onClick}
    >
      <div
        className="transition-all duration-700 ease-in-out flex items-center"
        style={{
          color: isHovered ? "#f3f4f6" : initialIconColor,
        }}
      >
        <IconComponent size={14} />
        {variant === "run" && <span className="ml-1 firafont">Run</span>}
      </div>
    </div>
  );
}