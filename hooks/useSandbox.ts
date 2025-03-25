<<<<<<< HEAD
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
=======
import { useEffect, useRef } from "react";

interface TimerData {
  realId: number;
  type: "timeout" | "interval";
  callbackId: number; // Added to store callback ID
}

export function useSandbox(
  iframeRef: React.RefObject<HTMLIFrameElement>,
  addExecutionOutput: (output: { type: string; text: string }[]) => void
) {
  const timerRegistry = useRef<Record<string, TimerData>>({});

  useEffect(() => {
    function handleSandboxMessage(e: MessageEvent) {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;

      const data = e.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "sandbox-timer-create") {
        const { timerType, callbackId, delay, tempId } = data;

        if (timerType === "timeout") {
          const realId = window.setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage({
              type: "execute-callback",
              callbackId
            }, "*");
          }, delay);
          timerRegistry.current[tempId] = { realId, type: "timeout", callbackId };
        } else if (timerType === "interval") {
          const realId = window.setInterval(() => {
            iframeRef.current?.contentWindow?.postMessage({
              type: "execute-callback",
              callbackId
            }, "*");
          }, delay);
          timerRegistry.current[tempId] = { realId, type: "interval", callbackId };
        }
      } else if (data.type === "sandbox-timer-clear") {
        const { timerType, timerId } = data;
        const timerInfo = timerRegistry.current[timerId];
        if (timerInfo) {
          if (timerInfo.type === "timeout") {
            clearTimeout(timerInfo.realId);
          } else {
            clearInterval(timerInfo.realId);
          }
          iframeRef.current?.contentWindow?.postMessage({
            type: "remove-callback",
            callbackId: timerInfo.callbackId
          }, "*");
          delete timerRegistry.current[timerId];
        }
      } else if (Array.isArray(data)) {
        // Handle console output messages
        addExecutionOutput(data.filter(msg => msg && msg.type && (msg.text || msg.data || msg.duration)));
      }
    }

    window.addEventListener("message", handleSandboxMessage);
    return () => {
      Object.entries(timerRegistry.current).forEach(([tempId, info]) => {
        if (info.type === "timeout") {
          clearTimeout(info.realId);
        } else {
          clearInterval(info.realId);
        }
      });
      timerRegistry.current = {};
      window.removeEventListener("message", handleSandboxMessage);
    };
  }, [iframeRef, addExecutionOutput]);
>>>>>>> 8a59c8ffe1bff1e2f10b47eb43cbe017e0077245
}