import { useEffect, useRef, useState } from 'react';

export function useVacuumSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/sounds/vacuum.mp3');
    audio.volume = 0.4;
    audio.loop = false; // Don't loop - play once when vacuum dies
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
    };
  }, []);

  const play = async () => {
    if (audioRef.current && isLoaded) {
      try {
        // Always reset and play, even if currently playing
        audioRef.current.currentTime = 0; // Reset to beginning
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play vacuum sound:', error);
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
  };
} 