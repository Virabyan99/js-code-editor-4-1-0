import { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { useConsoleStore } from '@/store/consoleStore';
import TableRenderer from './TableRenderer';
import DirRenderer from './DirRenderer';
import { useSandbox } from '@/hooks/useSandbox'; // Import the hook

const ConsolePanel = forwardRef((props, ref) => {
  const { allExecutions, displayMode, addMessageToExecution } = useConsoleStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Add the useSandbox hook to handle timer messages
  useSandbox(iframeRef);

  const runCode = (code: string) => {
    if (iframeRef.current) {
      const executionId = useConsoleStore.getState().startNewExecution();
      iframeRef.current.contentWindow?.postMessage({ code, executionId }, '*');
    }
  };

  useImperativeHandle(ref, () => ({ runCode }), [runCode]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;
      // Debug log to verify incoming messages
      console.log('ConsolePanel received message:', data);
      if (data.type === 'console') {
        const { subtype, text, data: msgData, label, duration, executionId } = data;
        let message;
        switch (subtype) {
          case 'log':
          case 'warn':
          case 'error':
            message = { type: subtype, text };
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
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addMessageToExecution]);

  // Compute displayed messages based on displayMode
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
              content = msg.text;
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
});

export default ConsolePanel;