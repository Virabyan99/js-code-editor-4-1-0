// components/PopupDisplay.tsx
import React from "react";

interface PopupDisplayProps {
  visible: boolean;
  message: string | null;
  onClose: () => void;
}

export default function PopupDisplay({
  visible,
  message,
  onClose,
}: PopupDisplayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-lg min-w-[300px] max-w-sm border border-gray-200 dark:border-gray-700">
        {/* Message */}
        <div className="text-base font-medium mb-4 text-center">{message}</div>
        {/* OK Button */}
        <div className="flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}