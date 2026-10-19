import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToNetworkTraffic, NetworkTrafficState } from '../services/api';

interface LoadingContextType {
  isLoading: boolean;
  activeRequests: number;
  isServerWaking: boolean;
  isOffline: boolean;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  activeRequests: 0,
  isServerWaking: false,
  isOffline: false,
});

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [traffic, setTraffic] = useState<NetworkTrafficState>({
    activeCount: 0,
    isLoading: false,
    isSlowRequest: false,
    isServerWaking: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // 1. Subscribe to axios traffic events
    const unsub = subscribeToNetworkTraffic((state) => {
      setTraffic(state);
    });

    // 2. Track browser connectivity
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading: traffic.isLoading,
        activeRequests: traffic.activeCount,
        isServerWaking: traffic.isServerWaking,
        isOffline,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

