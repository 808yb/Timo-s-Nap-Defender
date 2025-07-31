import { useEffect, useRef, useState } from 'react';

interface UseAudioOptions {
  src: string;
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
}

export function useAudio({ src, volume = 0.5, loop = true, autoplay = false }: UseAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;
    audio.preload = 'auto';

    // Event listeners
    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      if (autoplay) {
        audio.play().catch(console.error);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [src, volume, loop, autoplay]);

  const play = async () => {
    if (audioRef.current && isLoaded) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  };

  return {
    play,
    pause,
    stop,
    setVolume,
    isPlaying,
    isLoaded,
  };
} 