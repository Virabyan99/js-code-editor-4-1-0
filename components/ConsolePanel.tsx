import { useConsoleStore } from '@/store/consoleStore';
import { useEffect, useRef } from 'react';
import TableRenderer from './TableRenderer';
import DirRenderer from './DirRenderer';
import { useSandbox } from '@/hooks/useSandbox';

function ConsolePanel() {
  const { allExecutions, displayMode, addExecutionOutput } = useConsoleStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const seenSendIds = useRef(new Set()); // To track unique sendIds

  // Integrate the useSandbox hook with addExecutionOutput
  useSandbox(iframeRef, addExecutionOutput);

  // Compute displayed messages based on displayMode
  const displayedMessages = displayMode === "all"
    ? allExecutions.flat()
    : allExecutions[allExecutions.length - 1] || [];

  // Set up message listener for console messages
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;
      if (data && data.sendId && !seenSendIds.current.has(data.sendId)) {
        seenSendIds.current.add(data.sendId);
        if (Array.isArray(data.messages)) {
          addExecutionOutput(
            data.messages.filter(
              (msg) =>
                msg &&
                (msg.type &&
                  (msg.text ||
                    (msg.type === 'dir' && msg.data) ||
                    (msg.type === 'table' && msg.data) ||
                    (msg.type === 'time' && msg.label && msg.duration)))
            )
          );
        }
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
        displayedMessages.map((msg, index) => {
          let content: React.ReactNode = null;
          let textColor = "text-gray-800"; // Default for log

          switch (msg.type) {
            case "warn":
              textColor = "text-yellow-600";
              content = msg.text;
              break;
            case "error":
              textColor = "text-red-600";
              content = msg.text;
              break;
            case "log":
              content = msg.text;
              break;
            case "dir":
              content = <DirRenderer dataString={msg.data} />;
              break;
            case "table":
              content = <TableRenderer data={msg.data} />;
              break;
            case "time":
              content = `Timer ${msg.label}: ${msg.duration}ms`;
              textColor = "text-blue-600";
              break;
            default:
              content = msg.text || "Unknown message type";
              break;
          }

          return (
            <div key={index} className={`${textColor} text-[16px] mb-1`}>
              {content}
            </div>
          );
        })
      )}
    </div>
  );
}

export default ConsolePanel;