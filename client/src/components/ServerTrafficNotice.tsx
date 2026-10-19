import React, { useState, useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import { Cloud, WifiOff, CheckCircle2, Loader2 } from 'lucide-react';

export const ServerTrafficNotice: React.FC = () => {
  const { isServerWaking, isOffline, isLoading } = useLoading();
  const [showResolvedToast, setShowResolvedToast] = useState(false);
  const [wasWaking, setWasWaking] = useState(false);

  useEffect(() => {
    if (isServerWaking) {
      setWasWaking(true);
    } else if (wasWaking && !isLoading) {
      // Server just finished waking up and delivered data!
      setWasWaking(false);
      setShowResolvedToast(true);
      const timer = setTimeout(() => setShowResolvedToast(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [isServerWaking, isLoading, wasWaking]);

  // Offline alert takes highest priority
  if (isOffline) {
    return (
      <div
        role="alert"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#991b1b',
          color: '#ffffff',
          borderRadius: '9999px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 700,
          border: '1px solid rgba(255,255,255,0.2)',
          animation: 'fade-in 0.25s ease-out',
        }}
      >
        <WifiOff size={16} />
        <span>You are currently offline. Waiting for connection to resume live tracking...</span>
      </div>
    );
  }

  // Server waking up alert
  if (isServerWaking) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(18, 19, 49, 0.95)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          borderRadius: '9999px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.15)',
          animation: 'fade-in 0.25s ease-out',
        }}
      >
        <Loader2 size={16} className="animate-spin" color="var(--primary)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cloud size={15} color="#38bdf8" />
          <span>Waking up cloud server (Render cold-start)... Please hold on.</span>
        </div>
      </div>
    );
  }

  // Resolved notification
  if (showResolvedToast) {
    return (
      <div
        role="status"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#065f46',
          color: '#ffffff',
          borderRadius: '9999px',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          zIndex: 9999,
          fontSize: '0.82rem',
          fontWeight: 700,
          animation: 'fade-in 0.2s ease-out',
        }}
      >
        <CheckCircle2 size={15} color="#34d399" />
        <span>Connected to live server & synced!</span>
      </div>
    );
  }

  return null;
};

