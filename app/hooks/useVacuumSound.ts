import { useEffect, useRef, useState } from 'react';

export function useVacuumSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/sounds/vacuum.mp3');
    audio.volume = 0.4;
    audio.loop = false; // Don't loop - play once when vacuum dies
    audio.preload = 'auto';
    
    // iOS Safari requires user interaction to enable audio
    // Set muted initially to allow loading
    audio.muted = true;

    // Event listeners
    const handleCanPlayThrough = () => {
      setIsLoaded(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnded);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Enable audio on first user interaction
  const enableAudio = () => {
    if (audioRef.current && !isAudioEnabled) {
      audioRef.current.muted = false;
      setIsAudioEnabled(true);
    }
  };

  const play = async () => {
    if (audioRef.current && isLoaded) {
      try {
        // Enable audio if not already enabled
        enableAudio();
        // Always reset and play, even if currently playing
        audioRef.current.currentTime = 0; // Reset to beginning
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play vacuum sound:', error);
        // If play fails, try to enable audio and retry
        if (!isAudioEnabled) {
          enableAudio();
          try {
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
          } catch (retryError) {
            console.error('Failed to play vacuum sound after retry:', retryError);
          }
        }
      }
    }
  };

  const stop = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return {
    play,
    stop,
    isPlaying,
    isLoaded,
    isAudioEnabled,
    enableAudio,
  };
} 