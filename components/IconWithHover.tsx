import { IconCircleDotted, IconUpload, IconDownload, IconSun, IconMoon, IconPlayerPlay } from "@tabler/icons-react";
import { useThemeStore } from "@/store/themeStore"; // Adjust the import path as needed
import { useState } from "react";

interface IconWithHoverProps {
  className?: string;
  variant?: "circle" | "upload" | "download" | "sun" | "moon" | "run";
  onClick?: () => void;
}

export default function IconWithHover({
  className,
  variant = "circle",
  onClick,
}: IconWithHoverProps) {
  // Get the current theme from the theme store
  const { theme } = useThemeStore();

  // Set initial colors based on the theme
  const initialBgColor = theme === "light" ? "#f3f4f6" : "#1e2939";
  const initialIconColor = theme === "light" ? "#000000" : "#ffffff";

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
      : IconCircleDotted;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`rounded-sm p-1 transition-all duration-700 ease-in-out ${className}`}
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
          : "Interactive icon"
      }
      onClick={onClick}
    >
      <div
        className="transition-all duration-700 ease-in-out"
        style={{
          color: isHovered ? "#ffffff" : initialIconColor,
        }}
      >
        <IconComponent size={14} />
      </div>
    </div>
  );
}
