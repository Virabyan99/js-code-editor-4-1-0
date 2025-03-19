// components/IconWithHover.tsx
import { motion } from "framer-motion";
import { IconCircleDotted, IconUpload, IconDownload, IconSun, IconMoon } from "@tabler/icons-react";
import { useThemeStore } from "@/store/themeStore"; // Adjust the import path as needed

interface IconWithHoverProps {
  className?: string;
  variant?: "circle" | "upload" | "download" | "sun" | "moon";
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
  const initialBgColor = theme === "light" ? "#f3f4f6" : "#364153";
  const initialIconColor = theme === "light" ? "#000000" : "#ffffff";

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
      : IconCircleDotted;

  return (
    <motion.div
      initial={{ backgroundColor: initialBgColor }}
      whileHover={{ backgroundColor: "#000000", scale: 1.1 }}
      transition={{ duration: 0.7 }}
      className={`rounded-sm p-1 ${className}`}
      role="button"
      aria-label={
        variant === "upload"
          ? "Upload JavaScript file"
          : variant === "download"
          ? "Download code"
          : variant === "sun" || variant === "moon"
          ? "Toggle theme"
          : "Interactive icon"
      }
      onClick={onClick}
    >
      <motion.div
        initial={{ color: initialIconColor }}
        whileHover={{ color: "#ffffff" }}
        transition={{ duration: 0.7 }}
      >
        <IconComponent size={14} />
      </motion.div>
    </motion.div>
  );
}