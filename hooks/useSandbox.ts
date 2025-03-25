// hooks/useSandbox.ts
import { useEffect, useRef } from 'react';

interface TimerData {
  realId: number;
  type: 'timeout' | 'interval';
}

export function useSandbox(iframeRef: React.RefObject<HTMLIFrameElement>) {
  const timerRegistry = useRef<Record<string, TimerData>>({});

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
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
      }
    }

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      // Clean up all timers
      Object.values(timerRegistry.current).forEach(({ realId, type }) => {
        if (type === 'timeout') {
          window.clearTimeout(realId);
        } else {
          window.clearInterval(realId);
        }
      });
      timerRegistry.current = {};
    };
  }, [iframeRef]);
}