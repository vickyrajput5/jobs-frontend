import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

export function useScrapeStatus(pollMs = 3000) {
  const [running, setRunning] = useState(false);
  const [activeRuns, setActiveRuns] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const status = await api.getScrapeStatus();
      const active = status.activeRuns || 0;
      setRunning(Boolean(status.running) || active > 0);
      setActiveRuns(active);
      setLastResult(status.lastResult);
      return status;
    } catch {
      try {
        const runs = await api.getScrapeRuns();
        const active = runs.filter((r) => r.status === 'running').length;
        setRunning(active > 0);
        setActiveRuns(active);
      } catch {
        // ignore
      }
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  return { running, activeRuns, lastResult, refresh };
}
