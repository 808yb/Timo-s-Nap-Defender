import { useEffect, useRef } from 'react';

export function useAudioContext() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isInitializedRef = useRef(false);

  const initializeAudioContext = () => {
    if (isInitializedRef.current) return audioContextRef.current;

    try {
      // Create AudioContext if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      // Resume context if suspended (iOS requirement)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      isInitializedRef.current = true;
      return audioContextRef.current;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return null;
    }
  };

  const resumeAudioContext = async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  };

  useEffect(() => {
    // Initialize on first user interaction
    const handleUserInteraction = () => {
      initializeAudioContext();
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    // Add listeners for user interaction
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('mousedown', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  return {
    audioContext: audioContextRef.current,
    initializeAudioContext,
    resumeAudioContext,
    isInitialized: isInitializedRef.current,
  };
} 