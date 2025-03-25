import { useEffect, useRef } from 'react';
import { useConsoleStore } from '@/store/consoleStore';

interface TimerData {
  realId: number;
  type: 'timeout' | 'interval';
}

export function useSandbox(iframeRef: React.RefObject<HTMLIFrameElement>) {
  const timerRegistry = useRef<Record<string, TimerData>>({});
  const executionTimeoutRef = useRef<number | null>(null);
  const { addMessageToExecution, setLoading } = useConsoleStore();

  // Function to attach the message listener to the iframe
  const attachMessageListener = () => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'sandbox-timer-create') {
        const { timerType, delay, tempId } = data;
        let realId: number;
        if (timerType === 'timeout') {
          realId = window.setTimeout(() => {
            if (iframeRef.current) {
              iframeRef.current.contentWindow?.postMessage(
                { type: 'sandbox-timer-fire', tempId },
                '*'
              );
            }
          }, delay);
        } else if (timerType === 'interval') {
          realId = window.setInterval(() => {
            if (iframeRef.current) {
              iframeRef.current.contentWindow?.postMessage(
                { type: 'sandbox-timer-fire', tempId },
                '*'
              );
            }
          }, delay);
        } else {
          return;
        }
        timerRegistry.current[tempId] = { realId, type: timerType };
      } else if (data.type === 'sandbox-timer-clear') {
        const { timerType, timerId } = data;
        const timerInfo = timerRegistry.current[timerId];
        if (timerInfo && timerInfo.type === timerType) {
          if (timerType === 'timeout') {
            window.clearTimeout(timerInfo.realId);
          } else {
            window.clearInterval(timerInfo.realId);
          }
          delete timerRegistry.current[timerId];
        }
      } else if (data.type === 'execution-finished') {
        // Clear the timeout if execution completes
        if (executionTimeoutRef.current !== null) {
          clearTimeout(executionTimeoutRef.current);
          executionTimeoutRef.current = null;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Return cleanup function
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  };

  // Initial setup of the message listener
  useEffect(() => {
    const cleanup = attachMessageListener();
    return () => {
      cleanup();
      // Clean up all timers on unmount
      Object.values(timerRegistry.current).forEach(({ realId, type }) => {
        if (type === 'timeout') window.clearTimeout(realId);
        else window.clearInterval(realId);
      });
      timerRegistry.current = {};
      if (executionTimeoutRef.current !== null) {
        clearTimeout(executionTimeoutRef.current);
      }
    };
  }, [iframeRef]);

  // Start a timeout for code execution
  const startExecutionTimeout = (executionId: string, timeoutMs: number = 5000) => {
    // Clear any existing timeout to prevent overlap
    if (executionTimeoutRef.current !== null) {
      clearTimeout(executionTimeoutRef.current);
    }

    executionTimeoutRef.current = window.setTimeout(() => {
      if (iframeRef.current) {
        // Fully recreate the iframe
        const parent = iframeRef.current.parentNode;
        const newIframe = document.createElement('iframe');
        newIframe.src = '/sandbox.html';
        newIframe.sandbox = 'allow-scripts';
        newIframe.style.display = 'none';
        newIframe.title = 'Sandboxed Code Execution';
        if (parent) {
          parent.replaceChild(newIframe, iframeRef.current);
          iframeRef.current = newIframe as HTMLIFrameElement;
          // Reattach the message listener to the new iframe
          attachMessageListener();
        }

        addMessageToExecution(executionId, {
          type: 'error',
          text: 'Script terminated due to timeout',
        });
        setLoading(false);
      }
      executionTimeoutRef.current = null;
    }, timeoutMs);
  };

  return { startExecutionTimeout };
}