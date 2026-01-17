import { useState, useCallback } from 'react';

export function useCalloutMgt() {
  const [callout, setCallout] = useState<{ open: boolean; taskNumber: string | null }>({ open: false, taskNumber: null });

  const openCallout = useCallback((taskNumber: string) => {
    setCallout({ open: true, taskNumber });
  }, []);

  const closeCallout = useCallback(() => {
    setCallout({ open: false, taskNumber: null });
  }, []);

  return {
    callout,
    openCallout,
    closeCallout,
  };
}
