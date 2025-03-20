import { useConsoleStore } from '@/store/consoleStore';
import { useEffect, useRef } from 'react';

function ConsolePanel() {
  const { output, addOutput } = useConsoleStore(); // Store for console messages
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Set up message listener
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Check if the message comes from the iframe's contentWindow
      if (event.source !== iframeRef.current?.contentWindow) return;

      console.log("Message received from iframe:", event.data); // Debug log

      const data = event.data;
      if (Array.isArray(data)) {
        // Add each message to the console store
        data.forEach((msgObj) => {
          if (msgObj && msgObj.type && msgObj.text) {
            addOutput(msgObj);
          }
        });
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addOutput, iframeRef]);

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
      {output.length === 0 ? (
        <div className="text-gray-500">Console output will appear here...</div>
      ) : (
        output.map((msg, index) => (
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