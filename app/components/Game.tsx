'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import SpriteAnimation from './SpriteAnimation';
import AnimatedEnemy from './AnimatedEnemy';
import { Annoyance, AnnoyanceType, ANNOYANCE_CONFIG } from '../game/annoyanceTypes';
import { useAudio } from '../hooks/useAudio';
import { useFlyBuzz } from '../hooks/useFlyBuzz';
import { useVacuumSound } from '../hooks/useVacuumSound';
import { useUfoSound } from '../hooks/useUfoSound';
import { usePurrSound } from '../hooks/usePurrSound';
import { useAudioContext } from '../hooks/useAudioContext';

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  sleepHealth: number;
  gameSpeed: number;
  nextWaveIn: number; // Countdown in seconds
  waveNumber: number;
  enemiesRemaining: number;
  isPortrait: boolean; // true = mobile/portrait, false = desktop/landscape
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    score: 0,
    sleepHealth: 100,
    gameSpeed: 1,
    nextWaveIn: 5,
    waveNumber: 0,
    enemiesRemaining: 0,
    isPortrait: false, // Default to false, will be set in useEffect
  });
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [annoyances, setAnnoyances] = useState<Annoyance[]>([]);

  // Background music hook
  const { play: playMusic, pause: pauseMusic, enableAudio: enableMusic } = useAudio({
    src: '/sounds/background.wav',
    volume: 0.3,
    loop: true,
    autoplay: false
  });

  // Fly buzzing sound hook
  const { play: playFlyBuzz, stop: stopFlyBuzz, enableAudio: enableFlyBuzz } = useFlyBuzz();

  // Vacuum sound hook
  const { play: playVacuumSound, enableAudio: enableVacuum } = useVacuumSound();

  // UFO sound hook
  const { play: playUfoSound, stop: stopUfoSound, enableAudio: enableUfo } = useUfoSound();

  // Purring sound hook
  const { playPurrForDuration, enableAudio: enablePurr } = usePurrSound();

  // Audio context for iOS compatibility
  const { initializeAudioContext, resumeAudioContext } = useAudioContext();
  
  // Audio status state
  const [audioEnabled, setAudioEnabled] = useState(false);



  // Auto-detect orientation changes
  useEffect(() => {
    const handleResize = () => {
      setGameState(prev => ({
        ...prev,
        isPortrait: window.innerHeight > window.innerWidth
      }));
    };

    // Set initial orientation
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startGame = () => {
    // Initialize audio context and enable all audio on first user interaction (iOS requirement)
    initializeAudioContext();
    resumeAudioContext();
    enableMusic();
    enableFlyBuzz();
    enableVacuum();
    enableUfo();
    enablePurr();
    
    // Mark audio as enabled
    setAudioEnabled(true);
    
    setGameState({
      isPlaying: true,
      isPaused: false,
      score: 0,
      sleepHealth: 100,
      gameSpeed: 1,
      nextWaveIn: 3, // Start with a shorter countdown for first wave
      waveNumber: 0,
      enemiesRemaining: 0,
      isPortrait: gameState.isPortrait, // Keep current orientation
    });
    setAnnoyances([]); // Clear any existing enemies
    if (audioEnabled) {
      playMusic(); // Start background music only if audio is enabled
    }
  };

  const togglePause = () => {
    setGameState(prev => {
      const newPausedState = !prev.isPaused;
      
      // Control background music based on pause state
      if (newPausedState) {
        pauseMusic();
        stopFlyBuzz(); // Stop fly buzzing when paused
        stopUfoSound(); // Stop UFO sound when paused
      } else {
        playMusic();
        // Resume enemy sounds if enemies are present
        const hasFlies = annoyances.some(annoyance => annoyance.type === 'fly');
        const hasUfos = annoyances.some(annoyance => annoyance.type === 'ufo');

        if (hasFlies && audioEnabled) {
          playFlyBuzz();
        }
        if (hasUfos && audioEnabled) {
          playUfoSound();
        }
      }
      
      return {
        ...prev,
        isPaused: newPausedState
      };
    });
  };

  const handleRestart = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      score: 0
    }));
    setAnnoyances([]); // Clear any existing enemies
    pauseMusic(); // Stop background music
    stopFlyBuzz(); // Stop fly buzzing
    stopUfoSound(); // Stop UFO sound
  };

  const handleClick = (annoyanceId: string) => {
    if (gameState.isPaused) return;
    
    setAnnoyances(prev => {
      const updatedAnnoyances = prev.map(a => {
        if (a.id !== annoyanceId) return a;
        const newHp = a.hp - 1;
        if (newHp <= 0) {
          // Annoyance defeated
          setGameState(prev => ({
            ...prev,
            score: prev.score + ANNOYANCE_CONFIG[a.type].baseHp, // Score based on initial HP
            enemiesRemaining: prev.enemiesRemaining - 1 // Decrease enemy count
          }));
          
          // Play vacuum sound if a vacuum was defeated
          if (a.type === 'roomba' && audioEnabled) {
            playVacuumSound();
          }
          
          return null as unknown as Annoyance; // Will be filtered out
        }
        return { ...a, hp: newHp };
      }).filter(Boolean);
      return updatedAnnoyances;
    });
  };

  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const generateAnnoyance = (forceType?: AnnoyanceType) => {
      if (!gameAreaRef.current) return null;
  
      const rect = gameAreaRef.current.getBoundingClientRect();
      
      // Choose annoyance type based on game speed and weights
      let chosenType = forceType;
      if (!chosenType) {
        const availableTypes = Object.entries(ANNOYANCE_CONFIG)
          .filter(([, config]) => gameState.gameSpeed >= config.minGameSpeed)
          .map(([type, config]) => ({ 
            type: type as AnnoyanceType, 
            weight: config.spawnWeight 
          }));
  
        const totalWeight = availableTypes.reduce((sum, type) => sum + type.weight, 0);
        let random = Math.random() * totalWeight;
  
        for (const { type, weight } of availableTypes) {
          if (random <= weight) {
            chosenType = type;
            break;
          }
          random -= weight;
        }
        
        if (!chosenType) chosenType = 'fly'; // Fallback to fly if nothing else is chosen
      }
  
      // Get actual dimensions
      const width = rect.width;
      const height = rect.height;
      
      // Calculate Timo's position (center of screen, 72% down for portrait, 24% up from bottom for landscape)
      const centerX = width / 2;
      const centerY = gameState.isPortrait ? height * 0.72 : height * 0.76;
      
      // Minimum spawn distance from Timo (increased to prevent spawning too close)
      const minSpawnDistance = 150;
      
      // For UFOs, only allow spawning from top, left, or right
      let side: number;
      if (chosenType === 'ufo') {
        side = Math.floor(Math.random() * 3); // 0: top, 1: right, 2: left
        if (side === 2) side = 3; // Convert 2 to left (3)
      } else {
        side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      }
      
      let position: { x: number; y: number };
      let velocity: { x: number; y: number };
      
      // Generate spawn position with minimum distance check
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        switch (side) {
          case 0: // top
            position = { x: Math.random() * width, y: 0 };
            velocity = { x: 0, y: 1 };
            break;
          case 1: // right
            position = { x: width, y: Math.random() * height };
            velocity = { x: -1, y: 0 };
            break;
          case 2: // bottom
            position = { x: Math.random() * width, y: height };
            velocity = { x: 0, y: -1 };
            break;
          default: // left
            position = { x: 0, y: Math.random() * height };
            velocity = { x: 1, y: 0 };
        }
        
        // Check distance from Timo
        const dx = centerX - position.x;
        const dy = centerY - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance >= minSpawnDistance) {
          break; // Position is far enough from Timo
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          // If we can't find a good position, spawn further out
          switch (side) {
            case 0: // top
              position = { x: Math.random() * width, y: -50 };
              break;
            case 1: // right
              position = { x: width + 50, y: Math.random() * height };
              break;
            case 2: // bottom
              position = { x: Math.random() * width, y: height + 50 };
              break;
            default: // left
              position = { x: -50, y: Math.random() * height };
          }
          break;
        }
      } while (true);
  
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: chosenType,
        position,
        velocity,
        hp: ANNOYANCE_CONFIG[chosenType].baseHp,
        isDragging: false,
      };
    };

    // Wave and spawn timer
    const countdownInterval = setInterval(() => {
      setGameState(prev => {
        if (!prev.isPlaying) return prev; // Don't update if game is not playing
        
        // If no enemies left, start countdown for next wave
        if (prev.enemiesRemaining <= 0 && prev.nextWaveIn > 0) {
          return {
            ...prev,
            nextWaveIn: prev.nextWaveIn - 1
          };
        }
        
        // When countdown reaches 0, spawn new wave
        if (prev.enemiesRemaining <= 0 && prev.nextWaveIn <= 0) {
          const waveSize = 3 + Math.floor(prev.waveNumber / 2);
          const newAnnoyances = Array(waveSize).fill(null).map(() => generateAnnoyance());
          const validAnnoyances = newAnnoyances.filter(Boolean) as Annoyance[];
          
          // Use a timeout to ensure state updates are processed in order
          setTimeout(() => {
            setAnnoyances(existing => [...existing, ...validAnnoyances]);
          }, 0);
          
          return {
            ...prev,
            waveNumber: prev.waveNumber + 1,
            nextWaveIn: 5 + Math.floor(prev.waveNumber / 3), // Gradually increase time between waves
            enemiesRemaining: validAnnoyances.length
          };
        }
        
        // Random chance to spawn additional enemies during wave
        if (prev.enemiesRemaining > 0) {
          // 8% chance each second to spawn a new enemy (reduced from 15%)
          if (Math.random() < 0.08) {
            const newEnemy = generateAnnoyance();
            if (newEnemy) {
              setTimeout(() => {
                setAnnoyances(existing => [...existing, newEnemy]);
                setGameState(p => ({
                  ...p,
                  enemiesRemaining: p.enemiesRemaining + 1
                }));
              }, 0);
            }
          }
        }
        
        return prev;
      });
    }, 1000);

    const gameLoop = setInterval(() => {
      setAnnoyances(prev => {
        const updatedAnnoyances = prev.map(annoyance => {
          if (annoyance.isDragging) return annoyance;
  
          const config = ANNOYANCE_CONFIG[annoyance.type];
          const speed = config.speed * gameState.gameSpeed;
          
          // Move towards center
          const centerX = (gameAreaRef.current?.clientWidth ?? 0) / 2;
          const centerY = (gameAreaRef.current?.clientHeight ?? 0) * 0.72; // Match Timo's position
          
          const dx = centerX - annoyance.position.x;
          const dy = centerY - annoyance.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Adjust hitbox based on Timo's scale
          const timoHitbox = gameState.isPortrait ? 35 : 45; // Larger hitbox in landscape mode
          if (distance < timoHitbox) { // Hit Timo
            const newHealth = Math.max(0, gameState.sleepHealth - 1);
            setGameState(prev => ({
              ...prev,
              sleepHealth: newHealth,
              isPlaying: newHealth > 0 // End game if health reaches 0
            }));
            
            // Stop background music if game ends
            if (newHealth <= 0) {
              pauseMusic();
              stopFlyBuzz(); // Stop fly buzzing when game ends
              stopUfoSound(); // Stop UFO sound when game ends
            }
            
            return null as unknown as Annoyance; // Will be filtered out
          }
  
          // Calculate new position
          const newX = annoyance.position.x + (dx / distance) * speed;
          const newY = annoyance.position.y + (dy / distance) * speed;

          // Get game area dimensions
          const gameWidth = gameAreaRef.current?.clientWidth ?? 800; // Fallback width
          const gameHeight = gameAreaRef.current?.clientHeight ?? 600; // Fallback height

          // Ensure position stays within bounds
          const boundedX = Math.max(0, Math.min(gameWidth - ANNOYANCE_CONFIG[annoyance.type].size, newX));
          const boundedY = Math.max(0, Math.min(gameHeight - ANNOYANCE_CONFIG[annoyance.type].size, newY));

          return {
            ...annoyance,
            position: {
              x: boundedX,
              y: boundedY,
            },
          };
        }).filter(Boolean);

        // Sync enemies remaining count with actual number of enemies
        if (updatedAnnoyances.length !== gameState.enemiesRemaining) {
          setGameState(prev => ({
            ...prev,
            enemiesRemaining: updatedAnnoyances.length
          }));
        }

        // Control enemy sounds based on presence of different enemy types
        const hasFlies = updatedAnnoyances.some(annoyance => annoyance.type === 'fly');
        const hasUfos = updatedAnnoyances.some(annoyance => annoyance.type === 'ufo');

        if (hasFlies && audioEnabled) {
          playFlyBuzz();
        } else {
          stopFlyBuzz();
        }

        if (hasUfos && audioEnabled) {
          playUfoSound();
        } else {
          stopUfoSound();
        }

        return updatedAnnoyances;
      });

      // Increase game speed over time (reduced rate)
      setGameState(prev => ({
        ...prev,
        gameSpeed: Number((Math.min(2.5, prev.gameSpeed + 0.00005)).toFixed(2)), // Reduced from 0.0001 to 0.00005 and max from 3 to 2.5
      }));
    }, 16);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(gameLoop);
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.enemiesRemaining, gameState.gameSpeed, gameState.sleepHealth]);

  return (
    <div className="game-container relative">
      {!gameState.isPlaying && gameState.score > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="game-stats text-2xl text-center">
            Game Over!<br />
            Final Score: {gameState.score}
          </div>
        </motion.div>
      )}
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        {!gameState.isPlaying ? (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGame}
              className="cursor-pointer"
            >
              <Image 
                src="/sprites/startbtn.png"
                alt={gameState.score > 0 ? 'Play Again' : 'Start Game'}
                width={256}
                height={128}
                priority
                className="scale-[1.2] pixel-art w-[256px] landscape:w-[320px] h-auto"
                style={{
                  imageRendering: 'pixelated'
                }}
              />
            </motion.div>
            
          </div>
        ) : (
          <div
            ref={gameAreaRef}
            className="relative w-full h-full bg-transparent overflow-hidden touch-none"
          >
            {/* Room Layout */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Window with Curtains */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Curtains */}
                <div className="absolute inset-0 flex justify-between">
                  <div className="w-1/4 h-full bg-[#FFB366] opacity-90"></div>
                  <div className="w-1/4 h-full bg-[#FFB366] opacity-90"></div>
                </div>
                {/* Window Frame */}
                <div className="relative w-1/2 h-3/4 border-8 border-[#8B4513] bg-[#87CEEB]">
                  {/* Scenic Background */}
                  <div className="absolute inset-0 bg-cover bg-center"
                       style={{backgroundImage: "url('/sprites/mobile background.jpg')"}}></div>
                  <div className="absolute inset-0 bg-cover bg-center md:block hidden"
                       style={{backgroundImage: "url('/sprites/Background.jpg')"}}></div>
                </div>
              </div>

              {/* Couch */}
              <div className="absolute bottom-[12%] md:bottom-[15%] w-3/4 h-1/4">
                <div className="w-full h-full bg-[#1E90FF] rounded-lg shadow-lg"></div>
              </div>
            </div>

            {/* Timo sleeping on the couch */}
            <div 
              className={`absolute left-1/2 transform -translate-x-1/2 ${
                gameState.isPortrait 
                  ? 'bottom-[30%]' // Setting A: Mobile/Portrait position
                  : 'bottom-[24%]'  // Setting B: Desktop/Landscape position
              }`}
              onClick={() => {
                if (gameState.isPlaying && !gameState.isPaused) {
                  // Enable audio on user interaction (iOS requirement)
                  enablePurr();
                  if (audioEnabled) {
                    playPurrForDuration(2000); // Play purr for 2 seconds
                  }
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <SpriteAnimation
                spriteSheet="/sprites/Sleepingtimo.png"
                frameWidth={64}
                frameHeight={64}
                frameCount={4}
                frameDuration={1000}
                scale={1}
                className="scale-[2.1] landscape:scale-[2.8] pixel-art relative"
              />
            </div>

            {/* Annoyances */}
            <AnimatePresence>
              {annoyances.map(annoyance => (
                <AnimatedEnemy
                  key={annoyance.id}
                  type={annoyance.type}
                  position={annoyance.position}
                  hp={annoyance.hp}
                  isDraggable={!gameState.isPaused && annoyance.type !== 'ufo'}
                  dragConstraints={{
                    left: 0,
                    top: 0,
                    right: gameAreaRef.current?.clientWidth ?? 800,
                    bottom: gameAreaRef.current?.clientHeight ?? 600
                  }}
                  onDragStart={() => setAnnoyances(prev => 
                    prev.map(a => a.id === annoyance.id ? { ...a, isDragging: true } : a)
                  )}
                  onDragEnd={() => setAnnoyances(prev => 
                    prev.map(a => a.id === annoyance.id ? { ...a, isDragging: false } : a)
                  )}
                  onHit={() => handleClick(annoyance.id)}
                />
              ))}
            </AnimatePresence>

            {/* Game Stats UI */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              {/* Left Stats */}
              <div className="flex flex-col gap-2">
                <div className="game-stats">Enemies: {gameState.enemiesRemaining}</div>
                <div className="game-stats">Wave {gameState.waveNumber + 1}</div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePause}
                  className="game-stats cursor-pointer hover:brightness-110"
                >
                  pause
                </motion.button>
              </div>

              {/* Right Stats */}
              <div className="flex flex-col gap-2">
                <div className="game-stats">Sleep {gameState.sleepHealth}%</div>
                <div className="game-stats">Score {gameState.score}</div>
                {gameState.enemiesRemaining <= 0 && (
                  <div className="game-stats">Next {gameState.nextWaveIn}s</div>
                )}
                {/* Audio Status Indicator */}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!audioEnabled) {
                      // Enable audio
                      initializeAudioContext();
                      resumeAudioContext();
                      enableMusic();
                      enableFlyBuzz();
                      enableVacuum();
                      enableUfo();
                      enablePurr();
                      setAudioEnabled(true);
                    } else {
                      // Disable audio
                      pauseMusic();
                      stopFlyBuzz();
                      stopUfoSound();
                      setAudioEnabled(false);
                    }
                  }}
                  className={`game-stats text-xs cursor-pointer ${audioEnabled ? 'text-green-400' : 'text-red-400'}`}
                >
                  🔊 {audioEnabled ? 'ON' : 'OFF'}
                </motion.div>
              </div>
            </div>

            {/* Pause Menu */}
            <AnimatePresence>
              {gameState.isPaused && (
                                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6"
                >
                  <div className="game-stats text-4xl" style={{fontSize: '2rem'}}>PAUSED</div>
                  <div className="flex flex-col gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePause}
                      className="game-stats cursor-pointer hover:brightness-110"
                    >
                      RESUME
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRestart}
                      className="game-stats cursor-pointer hover:brightness-110"
                    >
                      RESTART
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
