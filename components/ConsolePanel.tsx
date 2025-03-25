// components/ConsolePanel.tsx
import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { useConsoleStore } from '@/store/consoleStore';
import TableRenderer from './TableRenderer';
import DirRenderer from './DirRenderer';
import { useSandbox } from '@/hooks/useSandbox';
import PopupDisplay from './PopupDisplay'; // Import the new component

const ConsolePanel = forwardRef((props, ref) => {
  const { allExecutions, displayMode, addMessageToExecution, isLoading, setLoading } = useConsoleStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { startExecutionTimeout } = useSandbox(iframeRef);
  const [alertVisible, setAlertVisible] = useState(false); // NEW: State for popup visibility
  const [alertMessage, setAlertMessage] = useState<string | null>(null); // NEW: State for popup message

  const runCode = (code: string) => {
    if (iframeRef.current) {
      const executionId = useConsoleStore.getState().startNewExecution();
      startExecutionTimeout(executionId); // Start the 5-second timeout
      iframeRef.current.contentWindow?.postMessage({ code, executionId }, '*');
    }
  };

  useImperativeHandle(ref, () => ({ runCode }), [runCode]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;
      console.log('ConsolePanel received message:', data);

      // NEW: Handle sandbox-alert messages
      if (data.type === 'sandbox-alert') {
        setAlertMessage(data.text);
        setAlertVisible(true);
      } else if (Array.isArray(data)) {
        data.forEach((msgObj) => {
          if (msgObj.type === 'uncaught-error') {
            addMessageToExecution(msgObj.executionId || currentExecutionId, {
              type: 'error',
              text: `Uncaught Error: ${msgObj.message}`,
              stack: msgObj.stack,
            });
          }
        });
      } else if (data.type === 'console') {
        const { subtype, text, data: msgData, label, duration, executionId, stack } = data;
        let message;
        switch (subtype) {
          case 'log':
          case 'warn':
            message = { type: subtype, text };
            break;
          case 'error':
            message = { type: 'error', text, stack };
            break;
          case 'dir':
            message = { type: 'dir', data: msgData };
            break;
          case 'table':
            message = { type: 'table', data: msgData };
            break;
          case 'time':
            message = { type: 'time', label, duration };
            break;
          default:
            message = { type: 'log', text: 'Unknown message type' };
        }
        addMessageToExecution(executionId, message);
      } else if (data.type === 'execution-finished') {
        setLoading(false);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addMessageToExecution, setLoading]);

  const displayedMessages =
    displayMode === 'all'
      ? allExecutions.reduce((acc, exec) => acc.concat(exec.messages), [])
      : allExecutions.length > 0 ? allExecutions[allExecutions.length - 1].messages : [];

  return (
    <div>
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        sandbox="allow-scripts"
        style={{ display: 'none' }}
        title="Sandboxed Code Execution"
      />
      {isLoading && <div className="text-gray-500 mb-2">Running...</div>}
      {displayedMessages.length === 0 ? (
        <div className="text-gray-500">Console output will appear here...</div>
      ) : (
        displayedMessages.map((msg, index) => {
          let content: React.ReactNode = null;
          let textColor = 'text-gray-800';

          switch (msg.type) {
            case 'warn':
              textColor = 'text-yellow-600';
              content = msg.text;
              break;
            case 'error':
              textColor = 'text-red-600';
              if (msg.stack) {
                content = (
                  <div>
                    <div>{msg.text}</div>
                    <pre className="whitespace-pre-wrap text-sm mt-1">{msg.stack}</pre>
                  </div>
                );
              } else {
                content = msg.text;
              }
              break;
            case 'log':
              content = msg.text;
              break;
            case 'dir':
              content = <DirRenderer dataString={msg.data} />;
              break;
            case 'table':
              content = <TableRenderer data={msg.data} />;
              break;
            case 'time':
              content = `Timer ${msg.label}: ${msg.duration}ms`;
              textColor = 'text-blue-600';
              break;
            default:
              content = msg.text || 'Unknown message type';
          }

          return (
            <div key={index} className={`${textColor} text-[16px] mb-1`}>
              {content}
            </div>
          );
        })
      )}
      {/* NEW: Render the PopupDisplay component */}
      <PopupDisplay
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </div>
  );
});

export default ConsolePanel;