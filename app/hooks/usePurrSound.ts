import { useEffect, useRef, useState } from 'react';

export function usePurrSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/sounds/purr.mp3');
    audio.volume = 0.2; // Low volume for purring
    audio.loop = false; // Don't loop - play once
    audio.preload = 'auto';

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
      const currentInterval = intervalRef.current;
      if (currentInterval) {
        clearInterval(currentInterval);
      }
    };
  }, []);

  const playPurrForDuration = async (durationMs: number = 4000) => {
    if (!isLoaded || isPlaying) return;

    try {
      audioRef.current!.currentTime = 0; // Reset to beginning
      await audioRef.current!.play();
      
      // Stop after specified duration
      setTimeout(() => {
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, durationMs);
    } catch (error) {
      console.error('Failed to play purr sound:', error);
    }
  };

  const play = async () => {
    if (audioRef.current && isLoaded && !isPlaying) {
      try {
        audioRef.current.currentTime = 0; // Reset to beginning
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play purr sound:', error);
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
    playPurrForDuration,
    isPlaying,
    isLoaded,
  };
} 