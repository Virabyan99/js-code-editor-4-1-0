import React, { useState } from "react";

type PopupMode = "alert" | "prompt" | "confirm";

interface PopupPayload {
  mode: PopupMode;
  message: string;
  defaultValue?: string;
}

interface PopupDisplayProps {
  visible: boolean;
  payload: PopupPayload | null;
  onClose: (result?: string | boolean | null) => void;
}

export default function PopupDisplay({
  visible,
  payload,
  onClose,
}: PopupDisplayProps) {
  const [inputValue, setInputValue] = useState(payload?.defaultValue || "");

  if (!visible || !payload) return null;

  const { mode, message } = payload;

  const handlePromptSubmit = () => onClose(inputValue);
  const handlePromptCancel = () => onClose(null);
  const handleConfirmYes = () => onClose(true);
  const handleConfirmNo = () => onClose(false);

  return (
    <div
      className="fixed inset-0 w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      role="dialog"
      aria-modal="true"
      aria-label={`${mode.charAt(0).toUpperCase() + mode.slice(1)} popup`}
    >
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-lg min-w-[300px] max-w-sm border border-gray-200 dark:border-gray-700">
        <div className="text-base font-medium mb-4 text-center">{message}</div>

        {mode === "alert" && (
          <div className="flex justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={() => onClose(undefined)}
              aria-label="Close alert"
            >
              OK
            </button>
          </div>
        )}

        {mode === "prompt" && (
          <div>
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="Prompt input"
            />
            <div className="flex justify-center gap-2">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={handlePromptSubmit}
                aria-label="Submit prompt"
              >
                OK
              </button>
              <button
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 font-semibold px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                onClick={handlePromptCancel}
                aria-label="Cancel prompt"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {mode === "confirm" && (
          <div className="flex justify-center gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={handleConfirmYes}
              aria-label="Confirm yes"
            >
              Yes
            </button>
            <button
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 font-semibold px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              onClick={handleConfirmNo}
              aria-label="Confirm no"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}