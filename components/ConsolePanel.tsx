import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { useConsoleStore } from '@/store/consoleStore';
import ComplexDataRenderer from './ComplexDataRenderer'; // Import the new component
import { useSandbox } from '@/hooks/useSandbox';
import PopupDisplay from './PopupDisplay';

const ConsolePanel = forwardRef((props, ref) => {
  const { allExecutions, displayMode, addMessageToExecution, isLoading, setLoading } = useConsoleStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { startExecutionTimeout } = useSandbox(iframeRef);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPayload, setPopupPayload] = useState<{ mode: 'alert' | 'prompt' | 'confirm'; message: string; defaultValue?: string; id?: string; executionId?: string } | null>(null);

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

      if (data.type === 'sandbox-alert') {
        setPopupPayload({ mode: 'alert', message: data.text });
        setPopupVisible(true);
      } else if (data.type === 'sandbox-prompt') {
        setPopupPayload({
          mode: 'prompt',
          message: data.text,
          defaultValue: data.defaultValue,
          id: data.promptId,
          executionId: data.executionId,
        });
        setPopupVisible(true);
      } else if (data.type === 'sandbox-confirm') {
        setPopupPayload({
          mode: 'confirm',
          message: data.text,
          id: data.confirmId,
          executionId: data.executionId,
        });
        setPopupVisible(true);
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

  const handlePopupClose = (result?: string | boolean | null) => {
    setPopupVisible(false);
    if (popupPayload) {
      if (popupPayload.mode === 'prompt' && popupPayload.id) {
        iframeRef.current?.contentWindow?.postMessage({
          type: 'sandbox-prompt-response',
          promptId: popupPayload.id,
          result: typeof result === 'string' ? result : null,
          executionId: popupPayload.executionId,
        }, '*');
      } else if (popupPayload.mode === 'confirm' && popupPayload.id) {
        iframeRef.current?.contentWindow?.postMessage({
          type: 'sandbox-confirm-response',
          confirmId: popupPayload.id,
          result: result === true,
          executionId: popupPayload.executionId,
        }, '*');
      }
    }
    setPopupPayload(null);
  };

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
              try {
                const parsed = JSON.parse(msg.data);
                content = <ComplexDataRenderer data={parsed} />;
              } catch {
                content = <span>{msg.data}</span>; // Fallback if parsing fails
              }
              break;
            case 'table':
              try {
                const parsed = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
                content = <ComplexDataRenderer data={parsed} />;
              } catch {
                content = <span>{String(msg.data)}</span>; // Fallback if parsing fails
              }
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
      <PopupDisplay
        visible={popupVisible}
        payload={popupPayload}
        onClose={handlePopupClose}
      />
    </div>
  );
});

export default ConsolePanel;