'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import SpriteAnimation from './SpriteAnimation';
import { AnnoyanceType } from '../game/annoyanceTypes';

interface AnimatedEnemyProps {
  type: AnnoyanceType;
  position: { x: number; y: number };
  hp: number;
  onHit: () => void;
  isDraggable: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  dragConstraints: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

const ENEMY_CONFIGS = {
  fly: {
    spriteSheet: '/sprites/fly.png',
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 6,
    frameDuration: 100,
    scale: 1.7
  },
  roomba: {
    spriteSheet: '/sprites/Vacuum.png',
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 6,
    frameDuration: 400,
    scale: 1.9
  },
  ufo: {
    spriteSheet: '/sprites/ufo.png',
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 6,
    frameDuration: 600,
    scale: 4
  }
};

export default function AnimatedEnemy({
  type,
  position,
  hp,
  onHit,
  isDraggable,
  onDragStart,
  onDragEnd,
  dragConstraints
}: AnimatedEnemyProps) {
  const config = ENEMY_CONFIGS[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1
      }}
      exit={{ opacity: 0, scale: 0 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: 'pointer'
      }}
      drag={isDraggable}
      dragConstraints={dragConstraints}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onHit}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="relative p-4 -m-4">
        <SpriteAnimation
          spriteSheet={config.spriteSheet}
          frameWidth={config.frameWidth}
          frameHeight={config.frameHeight}
          frameCount={config.frameCount}
          frameDuration={config.frameDuration}
          scale={config.scale}
          className="pixel-art"
        />
        {/* Heart HP Indicator */}
        <div className="absolute top-0 right-0 w-2 h-2 flex items-center justify-center">
          <Image 
            src="/sprites/heart.png" 
            alt="HP" 
            width={20}
            height={20}
            className="w-50 h-50 pixel-art"
            style={{
              imageRendering: 'pixelated'
            }}
          />
          <div 
            className="absolute inset-0 flex items-center justify-center text-white font-bold"
            style={{
              fontSize: '14px',
              fontFamily: 'monospace',
              textShadow: '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
              imageRendering: 'pixelated',
              color: 'white'
            }}
          >
            {hp}
          </div>
        </div>
      </div>
    </motion.div>
  );
}