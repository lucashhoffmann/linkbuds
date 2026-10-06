import { useEffect, useRef, useState } from 'react';
import type { AutosaveStatus } from './editor.types';

const autosaveDelayMs = 700;

export function useAutosaveSection<TPayload>(
  payload: TPayload,
  save: (payload: TPayload) => Promise<unknown>,
  enabled = true,
) {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const signature = JSON.stringify(payload);
  const currentSignatureRef = useRef(signature);
  const payloadRef = useRef(payload);
  const saveRef = useRef(save);
  const savedSignatureRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentSignatureRef.current = signature;
    payloadRef.current = payload;
  }, [payload, signature]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    if (savedSignatureRef.current === null) {
      savedSignatureRef.current = signature;
      return undefined;
    }

    if (savedSignatureRef.current === signature) {
      return undefined;
    }

    setStatus('dirty');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const targetSignature = signature;
      const targetPayload = payloadRef.current;

      setStatus('saving');

      void saveRef
        .current(targetPayload)
        .then(() => {
          savedSignatureRef.current = targetSignature;
          setStatus(
            currentSignatureRef.current === targetSignature ? 'saved' : 'dirty',
          );
        })
        .catch(() => {
          setStatus(
            currentSignatureRef.current === targetSignature ? 'error' : 'dirty',
          );
        });
    }, autosaveDelayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, signature]);

  return status;
}
