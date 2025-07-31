# Changelog

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