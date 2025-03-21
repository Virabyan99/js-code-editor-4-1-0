import { useConsoleStore } from '@/store/consoleStore';
import { useEffect, useRef } from 'react';

function ConsolePanel() {
  const { allExecutions, displayMode, addExecutionOutput } = useConsoleStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Compute displayed messages based on displayMode
  const displayedMessages = displayMode === "all"
    ? allExecutions.flat() // Flatten all executions into one array
    : allExecutions[allExecutions.length - 1] || []; // Show only the last execution's messages

  // Set up message listener
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;

      console.log("Message received from iframe:", event.data); // Debug log

      const data = event.data;
      if (Array.isArray(data)) {
        // Add the entire array as one execution's output
        addExecutionOutput(data.filter(msg => msg && msg.type && msg.text));
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addExecutionOutput, iframeRef]);

  return (
    <div>
      {/* Hidden iframe */}
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        sandbox="allow-scripts"
        style={{ display: 'none' }}
        title="Sandboxed Code Execution"
      />
      {/* Console output display */}
      {displayedMessages.length === 0 ? (
        <div className="text-gray-500">Console output will appear here...</div>
      ) : (
        displayedMessages.map((msg, index) => (
          <div
            key={index}
            className={`text-[16px] mb-1 ${
              msg.type === 'error'
                ? 'text-red-600'
                : msg.type === 'warn'
                ? 'text-yellow-600'
                : 'text-gray-800'
            }`}
          >
            {msg.text}
          </div>
        ))
      )}
    </div>
  );
}

export default ConsolePanel;