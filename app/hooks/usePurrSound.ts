import { useEffect, useRef, useState } from 'react';

export function usePurrSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/sounds/purr.mp3');
    audio.volume = 0.2; // Low volume for purring
    audio.loop = false; // Don't loop - play once
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
      const currentInterval = intervalRef.current;
      if (currentInterval) {
        clearInterval(currentInterval);
      }
    };
  }, []);

  // Enable audio on first user interaction
  const enableAudio = () => {
    if (audioRef.current && !isAudioEnabled) {
      audioRef.current.muted = false;
      setIsAudioEnabled(true);
    }
  };

  const playPurrForDuration = async (durationMs: number = 4000) => {
    if (!isLoaded || isPlaying) return;

    try {
      // Enable audio if not already enabled
      enableAudio();
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
      // If play fails, try to enable audio and retry
      if (!isAudioEnabled) {
        enableAudio();
        try {
          audioRef.current!.currentTime = 0;
          await audioRef.current!.play();
          
          // Stop after specified duration
          setTimeout(() => {
            if (audioRef.current && isPlaying) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }, durationMs);
        } catch (retryError) {
          console.error('Failed to play purr sound after retry:', retryError);
        }
      }
    }
  };

  const play = async () => {
    if (audioRef.current && isLoaded && !isPlaying) {
      try {
        // Enable audio if not already enabled
        enableAudio();
        audioRef.current.currentTime = 0; // Reset to beginning
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play purr sound:', error);
        // If play fails, try to enable audio and retry
        if (!isAudioEnabled) {
          enableAudio();
          try {
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
          } catch (retryError) {
            console.error('Failed to play purr sound after retry:', retryError);
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
    playPurrForDuration,
    isPlaying,
    isLoaded,
    isAudioEnabled,
    enableAudio,
  };
} 