import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useConsoleStore } from '@/store/consoleStore';
import ComplexDataRenderer from './ComplexDataRenderer';
import { useSandbox } from '@/hooks/useSandbox';
import PopupDisplay from './PopupDisplay';
import { useThemeStore } from '@/store/themeStore';

const ConsolePanel = forwardRef((props, ref) => {
  const {
    allExecutions,
    displayMode,
    addMessageToExecution,
    isLoading,
    setLoading,
    clearOutput, // Add clearOutput from the store
  } = useConsoleStore();
  const { theme } = useThemeStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { startExecutionTimeout } = useSandbox(iframeRef);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPayload, setPopupPayload] = useState<{
    mode: 'alert' | 'prompt' | 'confirm';
    message: string;
    defaultValue?: string;
    id?: string;
    executionId?: string;
  } | null>(null);

  const runCode = (code: string) => {
    if (iframeRef.current) {
      const executionId = useConsoleStore.getState().startNewExecution();
      startExecutionTimeout(executionId);
      iframeRef.current.contentWindow?.postMessage({ code, executionId }, '*');
    }
  };

  useImperativeHandle(ref, () => ({ runCode }), [runCode]);

  useEffect(() => {
    // 1. Clear old output on mount
    clearOutput();

    // 2. Create the iframe dynamically if it doesn’t exist
    if (!iframeRef.current) {
      const newIframe = document.createElement('iframe');
      newIframe.src = '/sandbox.html';
      newIframe.sandbox = 'allow-scripts';
      newIframe.style.display = 'none';
      newIframe.title = 'Sandboxed Code Execution';
      document.body.appendChild(newIframe);
      iframeRef.current = newIframe;
    }

    // 3. Attach message listener
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

    // Cleanup on unmount
    return () => {
      window.removeEventListener('message', handleMessage);
      // Remove the iframe from the DOM
      if (iframeRef.current) {
        document.body.removeChild(iframeRef.current);
        iframeRef.current = null;
      }
      // Clear output again to reset state
      clearOutput();
    };
  }, [addMessageToExecution, setLoading, clearOutput]);

  const handlePopupClose = (result?: string | boolean | null) => {
    setPopupVisible(false);
    if (popupPayload) {
      if (popupPayload.mode === 'prompt' && popupPayload.id) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'sandbox-prompt-response',
            promptId: popupPayload.id,
            result: typeof result === 'string' ? result : null,
            executionId: popupPayload.executionId,
          },
          '*'
        );
      } else if (popupPayload.mode === 'confirm' && popupPayload.id) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'sandbox-confirm-response',
            confirmId: popupPayload.id,
            result: result === true,
            executionId: popupPayload.executionId,
          },
          '*'
        );
      }
    }
    setPopupPayload(null);
  };

  const displayedMessages =
    displayMode === 'all'
      ? allExecutions.reduce((acc, exec) => acc.concat(exec.messages), [])
      : allExecutions.length > 0
      ? allExecutions[allExecutions.length - 1].messages
      : [];

  const getTextColor = (type: string) => {
    if (theme === 'dark') {
      switch (type) {
        case 'warn':
          return 'text-yellow-300';
        case 'error':
          return 'text-red-300';
        case 'time':
          return 'text-blue-300';
        default:
          return 'text-gray-100';
      }
    } else {
      switch (type) {
        case 'warn':
          return 'text-yellow-600';
        case 'error':
          return 'text-red-600';
        case 'time':
          return 'text-blue-600';
        default:
          return 'text-gray-800';
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {isLoading && (
        <div
          className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
        >
          Running...
        </div>
      )}
      <div
        className={`flex-1 overflow-auto p-2 custom-scrollbar ${theme === 'dark' ? 'dark' : ''}`}
        role="log"
        aria-live="polite"
        aria-label="Console output"
      >
        {displayedMessages.length === 0 ? (
          <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Console output will appear here...
          </div>
        ) : (
          displayedMessages.map((msg, index) => {
            let content: React.ReactNode = null;
            const textColor = getTextColor(msg.type);

            switch (msg.type) {
              case 'warn':
              case 'log':
                content = msg.text;
                break;
              case 'error':
                if (msg.stack) {
                  content = (
                    <div>
                      <div>{msg.text}</div>
                      <pre
                        className={`whitespace-pre-wrap text-sm mt-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {msg.stack}
                      </pre>
                    </div>
                  );
                } else {
                  content = msg.text;
                }
                break;
              case 'dir':
                try {
                  const parsed = JSON.parse(msg.data);
                  content = <ComplexDataRenderer data={parsed} maxItems={200} />;
                } catch {
                  content = <span>{msg.data}</span>;
                }
                break;
              case 'table':
                try {
                  const parsed =
                    typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
                  content = <ComplexDataRenderer data={parsed} maxItems={200} />;
                } catch {
                  content = <span>{String(msg.data)}</span>;
                }
                break;
              case 'time':
                content = `Timer ${msg.label}: ${msg.duration}ms`;
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
      </div>
      <PopupDisplay visible={popupVisible} payload={popupPayload} onClose={handlePopupClose} />
    </div>
  );
});

export default ConsolePanel;