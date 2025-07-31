export type AnnoyanceType = 'fly' | 'vacuum' | 'dog';

export interface Annoyance {
  id: string;
  type: AnnoyanceType;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  speed: number;
}

export interface GameConfig {
  baseSpawnInterval: number;
  baseMoveSpeed: number;
  speedIncreaseInterval: number;
  speedIncreaseAmount: number;
  maxGameSpeed: number;
  annoyanceTypes: AnnoyanceType[];
}

const DEFAULT_CONFIG: GameConfig = {
  baseSpawnInterval: 2000, // 2 seconds
  baseMoveSpeed: 2,
  speedIncreaseInterval: 10000, // 10 seconds
  speedIncreaseAmount: 0.1,
  maxGameSpeed: 3,
  annoyanceTypes: ['fly', 'vacuum', 'dog'],
};

export class GameEngine {
  private config: GameConfig;

  constructor(config: Partial<GameConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateAnnoyance(gameAreaWidth: number, gameAreaHeight: number): Annoyance {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    const type = this.config.annoyanceTypes[
      Math.floor(Math.random() * this.config.annoyanceTypes.length)
    ];

    let position: { x: number; y: number };
    let velocity: { x: number; y: number };

    switch (side) {
      case 0: // top
        position = { x: Math.random() * gameAreaWidth, y: -20 };
        velocity = { x: 0, y: 1 };
        break;
      case 1: // right
        position = { x: gameAreaWidth + 20, y: Math.random() * gameAreaHeight };
        velocity = { x: -1, y: 0 };
        break;
      case 2: // bottom
        position = { x: Math.random() * gameAreaWidth, y: gameAreaHeight + 20 };
        velocity = { x: 0, y: -1 };
        break;
      default: // left
        position = { x: -20, y: Math.random() * gameAreaHeight };
        velocity = { x: 1, y: 0 };
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position,
      velocity,
      speed: this.config.baseMoveSpeed,
    };
  }

  updateAnnoyancePosition(
    annoyance: Annoyance,
    targetX: number,
    targetY: number,
    deltaTime: number
  ): Annoyance {
    // Calculate direction to target
    const dx = targetX - annoyance.position.x;
    const dy = targetY - annoyance.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Update velocity to move towards target
    if (distance > 0) {
      annoyance.velocity = {
        x: (dx / distance) * annoyance.speed,
        y: (dy / distance) * annoyance.speed,
      };
    }

    // Update position
    return {
      ...annoyance,
      position: {
        x: annoyance.position.x + annoyance.velocity.x * deltaTime,
        y: annoyance.position.y + annoyance.velocity.y * deltaTime,
      },
    };
  }

  checkCollision(
    annoyance: Annoyance,
    targetX: number,
    targetY: number,
    radius: number
  ): boolean {
    const dx = annoyance.position.x - targetX;
    const dy = annoyance.position.y - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius;
  }
}