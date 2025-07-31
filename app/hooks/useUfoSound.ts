import { useEffect, useRef, useState } from 'react';

export function useUfoSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/sounds/ufo.mp3');
    audio.volume = 0.4;
    audio.loop = true;
    audio.preload = 'auto';

    // Event listeners
    const handleCanPlayThrough = () => {
      setIsLoaded(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const play = async () => {
    if (audioRef.current && isLoaded && !isPlaying) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play UFO sound:', error);
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