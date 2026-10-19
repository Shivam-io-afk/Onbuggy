import React, { useState, useEffect, useRef } from 'react';
import { useLoading } from '../context/LoadingContext';

export const TopLoadingBar: React.FC = () => {
  const { isLoading } = useLoading();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress((prev) => (prev === 0 ? 25 : prev));

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 65) return prev + Math.random() * 15;
          if (prev < 88) return prev + Math.random() * 4;
          return prev;
        });
      }, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (visible) {
        setProgress(100);
        const timer = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 300);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading, visible]);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page loading progress"
      aria-valuenow={Math.round(progress)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '3.5px',
        background: 'linear-gradient(90deg, #10b981 0%, #ff4500 50%, #30e849 100%)',
        zIndex: 99999,
        transition: progress === 100 ? 'width 0.2s ease, opacity 0.25s ease' : 'width 0.3s ease',
        opacity: visible ? 1 : 0,
        boxShadow: '0 0 10px rgba(48, 232, 73, 0.7), 0 0 5px rgba(255, 69, 0, 0.5)',
        pointerEvents: 'none',
      }}
    />
  );
};

