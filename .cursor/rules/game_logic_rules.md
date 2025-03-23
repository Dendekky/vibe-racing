# Game Logic Rules
- **Description**: Applies to game logic and bot AI files.
- **File Pattern**: **/lib/game/**/*.js
- **Rule**: Encapsulate bot AI in a separate class (e.g., BotController) with methods for pathfinding and decision-making.
- **Rule**: Ensure game state updates occur at a fixed tick rate (e.g., 60 updates/second) to maintain consistency across clients.
- **Rule**: Use a factory pattern to spawn bots dynamically when player count < 16 at race start.
- **Reference File**: Include /lib/game/physics.js for physics-related context.