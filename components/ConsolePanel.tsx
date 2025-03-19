// components/ConsolePanel.tsx
import { useConsoleStore } from "@/store/consoleStore";
import { Fira_Code } from "next/font/google";
import { memo } from "react";

// Import Fira Code font
const firaCode = Fira_Code({ subsets: ["latin"], weight: ["400", "700"] });

function ConsolePanel() {
  const { output } = useConsoleStore();

  return (
    <div
      className={`h-full w-full overflow-y-auto rounded-[7px] p-4 text-[16px]  ${firaCode.className}`}
      role="log"
      aria-live="polite"
      aria-label="Console output"
    >
      {output.length === 0 ? (
        <div className="text-gray-500 italic">Console output will appear here...</div>
      ) : (
        output.map((line, index) => (
          <div key={index} className="text-[16px] mb-1">
            {line}
          </div>
        ))
      )}
    </div>
  );
}

export default memo(ConsolePanel);