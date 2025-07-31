'use client';

import { useEffect, useState } from 'react';

interface SpriteAnimationProps {
  spriteSheet: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameDuration: number;
  scale?: number;
  className?: string;
}

export default function SpriteAnimation({
  spriteSheet,
  frameWidth,
  frameHeight,
  frameCount,
  frameDuration,
  scale = 1,
  className = '',
}: SpriteAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    let frameId: number;

    const animate = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      
      // Calculate current frame based on total elapsed time
      const totalFrames = Math.floor(elapsed / frameDuration);
      setCurrentFrame(totalFrames % frameCount);
      
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [frameCount, frameDuration]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: frameWidth * scale,
        height: frameHeight * scale,
      }}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: frameWidth * frameCount * scale,
          height: frameHeight * scale,
          backgroundImage: `url(${spriteSheet})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${frameWidth * frameCount * scale}px ${frameHeight * scale}px`,
          transform: `translate3d(-${currentFrame * frameWidth * scale}px, 0, 0)`,
          willChange: 'transform',
        }}
      />
    </div>
  );
}