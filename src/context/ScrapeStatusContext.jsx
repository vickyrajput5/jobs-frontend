import { createContext, useContext } from 'react';
import { useScrapeStatus } from '../hooks/useScrapeStatus';

const ScrapeStatusContext = createContext(null);

export function ScrapeStatusProvider({ children }) {
  const value = useScrapeStatus(3000);
  return (
    <ScrapeStatusContext.Provider value={value}>
      {children}
    </ScrapeStatusContext.Provider>
  );
}

export function useScrapeStatusContext() {
  const ctx = useContext(ScrapeStatusContext);
  if (!ctx) throw new Error('useScrapeStatusContext must be used within ScrapeStatusProvider');
  return ctx;
}
