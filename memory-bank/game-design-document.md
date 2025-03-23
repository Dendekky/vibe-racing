# Game Design Document: 3D Car Racing PvP

## Overview
- **Title**: *Unnamed 3D Car Racing PvP Game*
- **Genre**: Racing, Multiplayer PvP
- **Platform**: Web (Browser-based)
- **Target Audience**: Casual and competitive gamers aged 13+ who enjoy fast-paced racing and multiplayer competition
- **Core Concept**: A 3D car racing game where players compete in PvP races across iconic terrains, supported by bots to ensure full lobbies. Players use nitro boosts, manage car health, and race to victory over 4 laps.

## Game Features

### Core Gameplay
- **Objective**: Be the first player to complete 4 laps around the selected race terrain.
- **Perspective**: Third-person 3D view with an optional minimap showing player and bot positions.
- **Race Structure**:
  - Fixed 4-lap races.
  - Distance varies by terrain (customized for balance and pacing).
- **Winning Condition**: The first player to cross the finish line after 4 laps wins.

### Multiplayer & Bots
- **Game Rooms**:
  - Players can create or join a game room via a lobby system.
  - Maximum of 8 participants per room (players + bots).
  - If fewer than 8 players join by race start, bots fill the remaining slots to reach 8.
- **Bots**:
  - Finite number of bot AI opponents with basic pathfinding and racing behavior.
  - Bots dynamically adjust to maintain a full 8-participant race.

### Race Terrains
- **Selection**: Players choose from 5 predefined terrains in the lobby:
  1. **Monaco**: Tight urban streets with sharp turns (shortest distance, ~2 km/lap).
  2. **The Alpines**: Mountainous roads with elevation changes (~2.5 km/lap).
  3. **Dubai**: Wide desert highways with long straights (~3 km/lap).
  4. **Baku**: Mix of city streets and open stretches (~2.8 km/lap).
  5. **Shanghai**: Modern cityscape with sweeping curves (~2.7 km/lap).
- **Customization**: Terrain selection occurs before the race starts in the game room.

### Controls
- **Keyboard**:
  - **WASD**: Accelerate (W), Brake/Reverse (S), Steer Left (A), Steer Right (D).
  - **Arrow Keys**: Alternative steering (Left/Right) and acceleration (Up/Down).
- **Gamepad**:
  - Analog stick for steering.
  - Triggers for acceleration/braking.
  - Button mapping for nitro (e.g., A/X button).
- **Nitro Activation**: Spacebar (keyboard) or designated gamepad button.

### Car Mechanics
- **Standard Car**: All players and bots start with the same car model (balanced stats for fairness).
- **Health System**:
  - Cars have a health bar (100% at start).
  - Damage occurs gradually from collisions (e.g., 10% per crash into walls/players).
  - At 0% health, the car stops moving for 3 seconds, then respawns with full health (100%).
- **Nitro Boost**:
  - Randomly spawned nitro pickups on the track.
  - Grants a temporary speed/acceleration boost (e.g., +30% max speed for 5 seconds).
  - Limited to one active nitro boost at a time (no stacking).
- **Crashing**:
  - Players can crash into walls, obstacles, or other cars, causing health degradation.
  - Physics-based collisions affect car trajectory and speed.

### HUD & Feedback
- **Minimap**: Displays real-time positions of all players and bots.
- **Health Bar**: Visual indicator of car health (e.g., green to red gradient).
- **Lap Counter**: Shows current lap (e.g., "Lap 2/4").
- **Position Tracker**: Displays player’s current rank (e.g., "3rd/8").

## Gameplay Flow

### Pre-Race
1. **Lobby**:
   - Players create or join a game room (max 8 participants).
   - Host selects the terrain from the 5 options.
   - Players wait for others to join; bots fill remaining slots if needed.
2. **Countdown**: 3-second countdown before the race begins.

### During Race
1. **Start**: All 8 cars (players + bots) begin at the starting line.
2. **Racing**:
   - Players navigate the track using WASD, arrow keys, or gamepad.
   - Collect nitro pickups for speed boosts.
   - Avoid or endure crashes, managing health.
3. **Health Depletion**:
   - If health reaches 0%, the car halts for 3 seconds, then resumes with full health.
4. **Progress**: Minimap and HUD update positions, laps, and health in real-time.

### Post-Race
1. **Finish**: First player to complete 4 laps wins.
2. **Results Screen**: Displays final rankings (e.g., 1st: PlayerX, 2nd: Bot3, etc.).
3. **Return to Lobby**: Players can start a new race or exit.

## Technical Details

### Tech Stack (Reference)
- **Frontend**: Next.js (UI/lobby), Three.js (3D rendering), React (state management).
- **Backend**: Node.js + Socket.IO (real-time multiplayer), Express.js (API).
- **Physics**: Cannon.js (car physics and collisions).
- **Database**: Redis (room state), MongoDB (optional persistence).

### Performance Goals
- **Frame Rate**: Target 60 FPS for smooth 3D rendering.
- **Latency**: Keep server-client sync under 100ms for responsive multiplayer.
- **Load Time**: Terrain and car models load in under 5 seconds.

## Art & Audio

### Visuals
- **Car**: Single low-poly car model (~5k polygons) with customizable colors in future updates.
- **Terrains**: Distinct 3D environments reflecting real-world inspirations (e.g., Monaco’s tight streets, Dubai’s sandy dunes).
- **Pickups**: Glowing nitro orbs (simple sphere with particle effects).

### Audio
- **Sound Effects**:
  - Engine revving (looped, pitch varies with speed).
  - Nitro activation (sharp whoosh).
  - Crash (metal crunch).
  - Health reset (repair hum).
- **Background Music**: Fast-paced electronic tracks per terrain (e.g., upbeat for Dubai, tense for Alpines).

## Future Considerations
- **Car Customization**: Unlockable cars or skins.
- **Leaderboards**: Track top players globally.
- **Power-Ups**: Additional items like shields or oil slicks.
- **Terrain Expansion**: Add more locations (e.g., Tokyo, Miami).

## Appendix

### Terrain Distances (Per Lap)
| Terrain      | Distance (km) | Notes                     |
|--------------|---------------|---------------------------|
| Monaco       | 2.0           | Tight, technical turns    |
| The Alpines  | 2.5           | Hilly, scenic             |
| Dubai        | 3.0           | Fast, open straights      |
| Baku         | 2.8           | Mixed layout              |
| Shanghai     | 2.7           | Smooth, flowing curves    |

### Health Degradation Examples
- Minor bump: -5% health.
- Wall crash: -10% health.
- Head-on collision: -20% health.