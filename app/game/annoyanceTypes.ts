export type AnnoyanceType = 'fly' | 'roomba' | 'ufo';

export interface Annoyance {
  id: string;
  type: AnnoyanceType;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  hp: number;
  isDragging: boolean;
}

export const ANNOYANCE_CONFIG = {
  fly: {
    baseHp: 1,
    speed: 0.8, // Reduced from 2 to 0.8
    size: 32,
    spawnWeight: 50, // Reduced spawn rate
    color: 'bg-gray-600',
    minGameSpeed: 1,
  },
  roomba: {
    baseHp: 3,
    speed: 0.6, // Reduced from 1.5 to 0.6
    size: 48,
    spawnWeight: 30, // Increased relative to flies
    color: 'bg-blue-500',
    minGameSpeed: 1, // Appears from start
  },
  ufo: {
    baseHp: 6,
    speed: 1.2, // Reduced from 3 to 1.2
    size: 64,
    spawnWeight: 20, // Increased relative to flies
    color: 'bg-purple-500',
    minGameSpeed: 1, // Appears from start
  },
} as const;