import { motion } from 'framer-motion';
import { IconCircleDotted } from '@tabler/icons-react';

interface IconWithHoverProps {
  className?: string;
}

export default function IconWithHover({ className }: IconWithHoverProps) {
  return (
    <motion.div
      initial={{ backgroundColor: '#f3f4f6' }} // Initial color equivalent to bg-gray-100
      whileHover={{ backgroundColor: '#000000', scale: 1.1, rotate: 360 }}
      transition={{ duration: 0.7 }} // Smooth transition over 0.7 seconds
      className={`rounded-full p-1 ${className}`} // Removed bg-gray-100
      role="button"
      aria-label="Interactive icon"
    >
      <motion.div
        initial={{ color: '#000000' }} // Explicit initial color for the icon
        whileHover={{ color: '#ffffff' }} // Smoothly transitions to white
        transition={{ duration: 0.7 }} // Matches outer transition duration
      >
        <IconCircleDotted size={12} /> {/* Half size: 12px */}
      </motion.div>
    </motion.div>
  );
}