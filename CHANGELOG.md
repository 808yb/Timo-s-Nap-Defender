# Changelog

## [v1.1.0] - 2025-01-XX

### 🎵 Audio System Implementation
- **Complete Audio Integration**: Added comprehensive sound system with multiple audio hooks
  - Background music with loop and volume control
  - Fly buzzing sound effects that play when flies are present
  - Vacuum sound effects for roomba enemies
  - UFO sound effects for boss enemies
  - Purring sound when clicking on Timo (2-second duration)
- **Audio Management**: Smart audio control that pauses/stops sounds when game is paused
- **Performance Optimized**: Audio hooks prevent memory leaks and ensure proper cleanup

### 🎮 Enhanced Game Logic
- **Improved Difficulty Scaling**: Reduced game speed increase rate (0.00005 instead of 0.0001) and lowered max speed cap to 2.5x
- **Better Wave System**: Optimized wave countdown timing and enemy spawning mechanics
- **Enhanced Collision Detection**: Improved hitbox detection and enemy-player interactions
- **Responsive Orientation Detection**: Automatic detection and handling of portrait/landscape mode changes
- **Optimized Game Loop**: Improved performance with better frame rate handling (16ms intervals)

### 🎨 UI/UX Improvements
- **Enhanced Visual Design**: Added detailed room layout with:
  - Window with curtains and scenic backgrounds
  - Couch furniture element
  - Responsive positioning for different screen orientations
- **Improved Pause Menu**: Enhanced pause functionality with:
  - Smooth animations using Framer Motion
  - Resume and restart buttons with hover effects
  - Better visual hierarchy and styling
- **Interactive Elements**: Added click-to-purr functionality on Timo character
- **Better Game Stats Display**: Improved HUD with clearer information layout
- **Responsive Design**: Enhanced mobile and desktop compatibility

### 🔧 Technical Improvements
- **Audio Hook System**: Created modular audio hooks for different sound types:
  - `useAudio.ts` - General audio management
  - `useFlyBuzz.ts` - Fly buzzing sounds
  - `useVacuumSound.ts` - Vacuum/roomba sounds
  - `useUfoSound.ts` - UFO boss sounds
  - `usePurrSound.ts` - Timo purring sounds
- **Better State Management**: Improved game state handling with proper cleanup
- **Performance Optimizations**: Reduced unnecessary re-renders and improved memory usage
- **Code Organization**: Better separation of concerns with dedicated hook files

### 🐛 Bug Fixes
- Fixed audio memory leaks when switching between game states
- Resolved orientation detection issues on mobile devices
- Fixed enemy spawning edge cases
- Improved pause/resume functionality reliability

## [Current Version]

### Core Game Features
- Implemented main game loop with wave-based enemy spawning system
- Score tracking and health (sleep) system
- Dynamic difficulty scaling with increasing game speed
- Responsive design supporting both landscape and portrait modes
- Pixel art styling with proper image rendering

### Game Mechanics
- Wave-based enemy spawning system
  - Waves get progressively harder
  - Dynamic wave countdown timer
  - Wave size increases with game progression
  - Visual countdown indicator with animations

### Character Implementation
- Timo (Main Character)
  - Sleeping animation with sprite sheet implementation
  - Centered position with responsive scaling
  - Health/Sleep tracking (100% to 0%)
  - Hitbox detection for enemy collisions

### Enemies (Annoyances)
Three types of enemies implemented:
1. Flies
   - Basic enemy type
   - 1 HP
   - Fast movement (speed: 2)
   - High spawn rate (50% weight)

2. Roombas
   - Medium-tier enemy
   - 3 HP
   - Medium movement (speed: 1.5)
   - Medium spawn rate (30% weight)
   - Draggable interaction

3. UFOs
   - Boss-type enemy
   - 6 HP
   - Fastest movement (speed: 3)
   - Low spawn rate (20% weight)
   - Non-draggable

### Technical Implementations
- Sprite Animation System
  - Custom sprite sheet handling
  - Frame-based animation
  - Configurable frame duration and count
  - Support for horizontal flipping
  - Performance-optimized with RequestAnimationFrame

- Game Engine Features
  - Dynamic enemy spawning from screen edges
  - Pathfinding towards player
  - Collision detection
  - Drag and drop interactions
  - Score calculation based on enemy type
  - Progressive difficulty scaling

### UI/UX Features
- Start/Game Over screen with score display
- Dynamic wave countdown display
- Score and sleep health HUD
- Responsive scaling for different screen sizes
- Animated transitions and effects using Framer Motion
- Interactive buttons with hover and tap animations

### Assets Integration
- Sprite sheets for character and enemies
- Background images for different screen orientations
- Start button and UI elements
- Pixel art styling with proper rendering

### Technologies Used
- Next.js for framework
- React for UI components
- Framer Motion for animations
- TypeScript for type safety
- Tailwind CSS for styling

### Known Features in Development
- Game state persistence
- Sound effects and background music
- Additional enemy types
- Power-ups and special abilities
- High score system