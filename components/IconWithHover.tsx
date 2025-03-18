// components/IconWithHover.tsx
import { motion } from "framer-motion";
import { IconCircleDotted, IconUpload, IconDownload } from "@tabler/icons-react";

interface IconWithHoverProps {
  className?: string;
  variant?: "circle" | "upload" | "download"; // Add download variant
  onClick?: () => void; // Click handler remains for all variants
}

export default function IconWithHover({
  className,
  variant = "circle", // Default to circle
  onClick,
}: IconWithHoverProps) {
  const IconComponent = variant === "upload" ? IconUpload : variant === "download" ? IconDownload : IconCircleDotted;

  return (
    <motion.div
      initial={{ backgroundColor: "#f3f4f6" }}
      whileHover={{ backgroundColor: "#000000", scale: 1.1, rotate: 360 }}
      transition={{ duration: 0.7 }}
      className={`rounded-full p-1 ${className}`}
      role="button"
      aria-label={
        variant === "upload"
          ? "Upload JavaScript file"
          : variant === "download"
          ? "Download code"
          : "Interactive icon"
      }
      onClick={onClick}
    >
      <motion.div
        initial={{ color: "#000000" }}
        whileHover={{ color: "#ffffff" }}
        transition={{ duration: 0.7 }}
      >
        <IconComponent size={12} />
      </motion.div>
    </motion.div>
  );
}