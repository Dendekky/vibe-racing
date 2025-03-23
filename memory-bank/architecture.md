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
   - Responsibilities:
     - Initializes the Three.js scene, camera, and renderer
     - Sets up lighting and basic environment
     - Handles window resize events
     - Manages animation loop
     - Cleans up resources to prevent memory leaks

2. **Physics Integration** (planned):
   - Purpose: Handle car physics and collisions using Cannon.js
   - Responsibilities:
     - Define car physical properties (mass, velocity, etc.)
     - Calculate collisions with terrain and other cars
     - Sync physics state with rendering

3. **Control System** (planned):
   - Purpose: Handle user input for car control
   - Responsibilities:
     - Process keyboard and gamepad input
     - Map inputs to car actions (accelerate, brake, steer)
     - Implement nitro boost functionality

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
