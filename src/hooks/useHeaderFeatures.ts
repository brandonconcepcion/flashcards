import { useState, useEffect, useRef } from 'react';

// Photo upload removed

interface PhotoSettings {
  backgroundSize: 'cover' | 'contain' | 'auto' | '100%' | '200%' | '300%';
  backgroundPosition: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right';
  opacity: number;
  // Dynamic positioning
  customPosition: {
    x: number; // percentage offset from left (-100 to 100)
    y: number; // percentage offset from top (-100 to 100)
    scale: number; // scale factor (0.1 to 3.0)
  };
}

interface TextOverlay {
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
  fontFamily: 'arial' | 'helvetica' | 'times' | 'georgia' | 'garamond' | 'serif' | 'sans-serif' | 'monospace' | 'cursive' | 'verdana' | 'calibri' | 'trebuchet';
  enabled: boolean;
}

interface TimerState {
  isRunning: boolean;
  remainingTime: number; // in milliseconds
  totalTime: number; // in milliseconds
  startTime: number | null;
}

export const useHeaderFeatures = () => {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    remainingTime: 25 * 60 * 1000, // Default 25 minutes in milliseconds
    totalTime: 25 * 60 * 1000,
    startTime: null,
  });
  // Photo upload modal removed
  const [photoSettings, setPhotoSettings] = useState<PhotoSettings>({
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.8,
    customPosition: {
      x: 0,
      y: 0,
      scale: 1.0,
    },
  });
  const [textOverlay, setTextOverlay] = useState<TextOverlay>({
    text: 'Imagination is more important than knowledge',
    position: 'center',
    opacity: 0.8,
    fontSize: 1.2,
    color: '#ffffff',
    fontFamily: 'garamond',
    enabled: true,
  });
  
  const timerIntervalRef = useRef<number | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('header-photo-settings');
    if (savedSettings) {
      try {
        setPhotoSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading photo settings:', error);
      }
    }

    const savedTextOverlay = localStorage.getItem('header-text-overlay');
    if (savedTextOverlay) {
      try {
        setTextOverlay(JSON.parse(savedTextOverlay));
      } catch (error) {
        console.error('Error loading text overlay settings:', error);
      }
    }
  }, []);

  // Photos removed

  // Save photo settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('header-photo-settings', JSON.stringify(photoSettings));
  }, [photoSettings]);

  // Save text overlay settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('header-text-overlay', JSON.stringify(textOverlay));
  }, [textOverlay]);

  // Photo randomizer removed

  // Timer functionality
  useEffect(() => {
    if (timer.isRunning && timer.remainingTime > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (!prev.startTime) return prev;
          
          const elapsed = Date.now() - prev.startTime;
          const remaining = Math.max(0, prev.totalTime - elapsed);
          
          if (remaining === 0) {
            // Timer finished - play beep sound
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            return {
              ...prev,
              isRunning: false,
              remainingTime: 0,
              startTime: null,
            };
          }
          
          return {
            ...prev,
            remainingTime: remaining,
          };
        });
      }, 100);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [timer.isRunning]);

  // Upload/remove photo removed

  const startTimer = (minutes: number = 25) => {
    const totalTime = minutes * 60 * 1000;
    setTimer({
      isRunning: true,
      remainingTime: totalTime,
      totalTime: totalTime,
      startTime: Date.now(),
    });
  };

  const stopTimer = () => {
    setTimer((prev) => ({
      ...prev,
      isRunning: false,
      startTime: null,
    }));
  };

  const resetTimer = (minutes: number = 25) => {
    const totalTime = minutes * 60 * 1000;
    setTimer({
      isRunning: false,
      remainingTime: totalTime,
      totalTime: totalTime,
      startTime: null,
    });
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const updatePhotoSettings = (newSettings: Partial<PhotoSettings>) => {
    setPhotoSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateTextOverlay = (newSettings: Partial<TextOverlay>) => {
    setTextOverlay(prev => ({ ...prev, ...newSettings }));
  };

  const currentPhoto = null;

  return {
    currentPhoto,
    timer,
    photoSettings,
    updatePhotoSettings,
    textOverlay,
    updateTextOverlay,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
};
