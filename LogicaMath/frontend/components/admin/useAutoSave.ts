import { useState, useEffect, useRef } from 'react';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export function useAutoSave(
  changesExist: boolean,
  onSave: () => Promise<void>,
  delayMs: number = 2000
) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (changesExist) {
      setStatus('saving');
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await onSave();
          setStatus('success');
        } catch (error) {
          setStatus('error');
          setTimeout(() => setStatus('idle'), 3000);
        }
      }, delayMs);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [changesExist, onSave, delayMs]);

  // Si changesExist pasa a ser falso sin que el status sea success 
  // (por ejemplo si onSave actualiza el estado originando un render)
  useEffect(() => {
    if (!changesExist && status !== 'error' && status !== 'saving') {
      setStatus('success');
    }
  }, [changesExist]);

  return { status, setStatus };
}
