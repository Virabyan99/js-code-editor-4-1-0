// components/IconWithHover.tsx
import { motion } from "framer-motion";
import { IconCircleDotted, IconUpload, IconDownload, IconSun, IconMoon } from "@tabler/icons-react";

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
      initial={{ backgroundColor: "#f3f4f6" }}
      whileHover={{ backgroundColor: "#000000", scale: 1.1,  }}
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
        initial={{ color: "#000000" }}
        whileHover={{ color: "#ffffff" }}
        transition={{ duration: 0.7 }}
      >
        <IconComponent size={14} />
      </motion.div>
    </motion.div>
  );
}