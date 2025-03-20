// components/ConsolePanel.tsx
import { useConsoleStore } from "@/store/consoleStore";
import { Fira_Code } from "next/font/google";
import { memo, useEffect, useRef } from "react";

// Import Fira Code font
const firaCode = Fira_Code({ subsets: ["latin"], weight: ["400", "700"] });

function ConsolePanel() {
  const { output, addOutput } = useConsoleStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Listen for messages from the sandbox iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Check if the data is an array (output from sandbox.html)
      if (Array.isArray(event.data)) {
        event.data.forEach((msg: string) => addOutput(msg));
      }
    }

    window.addEventListener("message", handleMessage);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [addOutput]);

  return (
    <div
      className={`h-full w-full overflow-y-auto rounded-[7px] p-4 text-[16px] ${firaCode.className}`}
      role="log"
      aria-live="polite"
      aria-label="Console output"
    >
      {/* Hidden iframe for sandboxed code execution */}
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        sandbox="allow-scripts"
        style={{ display: "none" }}
        title="Sandboxed Code Execution"
      />
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