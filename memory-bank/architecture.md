# Project Architecture

## Overview
This document outlines the architectural structure of the 3D Car Racing PvP game, detailing component interactions, data flow, and technical decisions.

## Directory Structure

```
/
├── client/                   # Next.js frontend (TypeScript)
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   │   ├── game/         # Game-specific components
│   │   │   │   └── GameCanvas.tsx   # Main Three.js rendering component
│   │   │   └── ui/           # User interface components
│   │   ├── lib/              # Utilities and game logic
│   │   │   ├── physics.ts    # Physics engine integration
│   │   │   ├── controls.ts   # User input handling
│   │   │   └── game/         # Game logic
│   │   │       └── car.ts    # Car entity management
│   │   └── pages/            # Next.js pages
│   └── tests/                # Frontend tests
├── server/                   # Node.js backend (TypeScript)
│   ├── src/                  # TypeScript source code
│   │   ├── index.ts          # Main server entry point
│   │   ├── lib/              # Server logic
│   │   │   ├── bot.ts        # Bot AI logic
│   │   │   └── gameState.ts  # Game state management
│   │   ├── services/         # Business logic
│   │   └── tests/            # Backend tests
│   │       ├── server.test.ts # Server API tests
│   │       └── setup.ts      # Test initialization and cleanup
│   ├── dist/                 # Compiled JavaScript output
│   ├── tsconfig.json         # TypeScript configuration
│   └── jest.config.js        # Jest testing configuration
└── docs/                     # Documentation
```

## Key Components

### Client Side

1. **GameCanvas.tsx**:
   - Purpose: Main 3D rendering component using Three.js
   - Location: `src/components/game/GameCanvas.tsx`
   - Responsibilities:
     - Initializes the Three.js scene, camera, and renderer
     - Sets up lighting and basic environment
     - Handles window resize events
     - Manages animation loop
     - Cleans up resources to prevent memory leaks
     - Manages game state (health, race status, debug info)
     - Handles race completion and restart functionality
   - Key Features:
     - Responsive design with proper window resize handling
     - Debug information display for development
     - Health and race status HUD
     - Minimap integration
     - Race completion modal
     - Performance optimization through proper resource cleanup

2. **GameCanvas.module.css**:
   - Purpose: Component-specific styling using CSS Modules
   - Location: `src/components/game/GameCanvas.module.css`
   - Responsibilities:
     - Defines layout for game container and canvas
     - Styles minimap positioning and appearance
     - Manages HUD element positioning and visibility
     - Handles modal styling and animations
     - Ensures proper z-indexing for UI elements
   - Key Features:
     - Modular CSS to prevent style conflicts
     - Responsive design considerations
     - Consistent styling across different screen sizes
     - Proper layering of UI elements
     - Smooth transitions and animations

3. **Physics Integration** (planned):
   - Purpose: Handle car physics and collisions using Cannon.js
   - Responsibilities:
     - Define car physical properties (mass, velocity, etc.)
     - Calculate collisions with terrain and other cars
     - Sync physics state with rendering

4. **Control System**:
   - Purpose: Handle user input for car control
   - Location: `src/lib/controls.ts`
   - Responsibilities:
     - Process keyboard and gamepad input
     - Map inputs to car actions (accelerate, brake, steer)
     - Implement nitro boost functionality
   - Key Features:
     - Dual input support (keyboard and gamepad)
     - WASD and arrow key support for keyboard
     - Full gamepad support with proper event handling
     - Nitro boost (spacebar for keyboard, A/X button for gamepad)
     - Deadzone handling for gamepad inputs
     - Proper cleanup of event listeners
     - Comprehensive test coverage
   - Technical Details:
     - Uses native Gamepad API for controller support
     - Implements proper event cleanup to prevent memory leaks
     - Handles read-only properties in Gamepad interface
     - Provides a clean interface for the physics system
     - Updates at 60 FPS in the game loop

5. **Car Class**:
   - Purpose: Manage car state and behavior
   - Location: `src/lib/game/car.ts`
   - Responsibilities:
     - Track car position, rotation, and velocity
     - Manage health and damage system
     - Handle crash mechanics and recovery
     - Provide state updates for rendering
   - Key Features:
     - Health system with different damage types
     - Automatic disable and recovery at 0% health
     - Position and physics state management
     - Clean interface for physics integration
   - Technical Details:
     - Health starts at 100%
     - Damage types: minor (-5%), wall (-10%), head-on (-20%)
     - 3-second disable period at 0% health
     - Auto-repair to 100% after disable period
     - Updates at 60 FPS in the game loop

6. **HUD Component**:
   - Purpose: Display game status and feedback
   - Location: `src/components/ui/HUD.tsx`
   - Responsibilities:
     - Show health status with visual bar
     - Display disable countdown when car is disabled
     - Provide visual feedback for game state
   - Key Features:
     - Animated health bar with percentage
     - Disable overlay with countdown timer
     - Smooth transitions for state changes
     - Accessibility support (ARIA attributes)
   - Technical Details:
     - Uses CSS Modules for styling
     - Implements proper React patterns
     - Handles real-time updates efficiently
     - Provides visual feedback for all game states

### Server Side

1. **index.ts**:
   - Purpose: Main server entry point
   - Responsibilities:
     - Set up Express server with middleware
     - Configure Socket.IO for real-time communication
     - Define basic API endpoints
     - Initialize socket event handlers
     - Define TypeScript interfaces for data structures

2. **Game State Management** (planned):
   - Purpose: Track and manage the state of ongoing races
   - Responsibilities:
     - Store room and player data
     - Track lap progress and race position
     - Manage health and crash mechanics

3. **Bot AI** (planned):
   - Purpose: Control AI opponents
   - Responsibilities:
     - Implement pathfinding along race tracks
     - Simulate human-like driving behavior
     - Adjust difficulty based on track selection

### Testing Infrastructure

1. **Jest Configuration**:
   - Purpose: Configure testing environment for TypeScript
   - Features:
     - TypeScript support via ts-jest
     - Automatic server cleanup after tests
     - Handles asynchronous tests properly

2. **Test Setup**:
   - Purpose: Manage environment initialization and cleanup for tests
   - Responsibilities:
     - Initialize resources before tests run
     - Clean up resources (like server connections) after tests
     - Prevent memory leaks from hanging server instances

## Data Flow

1. **Real-time Updates**:
   - Client sends position and actions via Socket.IO
   - Server validates, updates game state
   - Server broadcasts updated positions to all clients in the room
   - Clients render updates with interpolation

2. **Race Events**:
   - Server calculates lap completions, collisions, pickups
   - Events broadcast to all clients
   - Clients update UI and play appropriate effects

## Technical Decisions

1. **TypeScript**:
   - Used throughout both client and server for type safety
   - Provides better developer experience with autocompletion and error detection
   - Improves maintainability with explicit interfaces and types
   - ESLint configured for TypeScript code quality

2. **Three.js for 3D Rendering**:
   - Chosen for its robust WebGL capabilities and active community
   - Integrates well with React via useEffect hook
   - Provides necessary 3D primitives and lighting system

3. **Socket.IO for Multiplayer**:
   - Enables real-time bidirectional communication
   - Provides room functionality for race organization
   - Handles reconnections gracefully

4. **Cannon.js for Physics**:
   - Lightweight physics engine that pairs well with Three.js
   - Sufficient for car physics simulation
   - Easy to integrate with the rendering loop

5. **Server Architecture**:
   - Express for HTTP endpoints and static file serving
   - Socket.IO for real-time game state sync
   - Redis planned for temporary game data storage

6. **Testing Strategy**:
   - Jest for both frontend and backend testing
   - Isolated component tests for React components
   - API testing for server endpoints
   - Mocks for external dependencies

## Future Considerations

1. **Performance Optimization**:
   - Implement level of detail (LOD) for distant objects
   - Optimize network packet size and update frequency
   - Add configurable graphics settings

2. **Scaling**:
   - Implement horizontal scaling for game servers
   - Shard Redis by race room

This architecture provides a solid foundation for the game while maintaining flexibility for future enhancements.
