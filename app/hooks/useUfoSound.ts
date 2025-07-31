import { useEffect, useRef, useState } from 'react';

export function useUfoSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/sounds/ufo.mp3');
    audio.volume = 0.4;
    audio.loop = true;
    audio.preload = 'auto';
    
    // iOS Safari requires user interaction to enable audio
    // Set muted initially to allow loading
    audio.muted = true;

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

  // Enable audio on first user interaction
  const enableAudio = () => {
    if (audioRef.current && !isAudioEnabled) {
      audioRef.current.muted = false;
      setIsAudioEnabled(true);
    }
  };

  const play = async () => {
    if (audioRef.current && isLoaded && !isPlaying) {
      try {
        // Enable audio if not already enabled
        enableAudio();
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play UFO sound:', error);
        // If play fails, try to enable audio and retry
        if (!isAudioEnabled) {
          enableAudio();
          try {
            await audioRef.current.play();
          } catch (retryError) {
            console.error('Failed to play UFO sound after retry:', retryError);
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