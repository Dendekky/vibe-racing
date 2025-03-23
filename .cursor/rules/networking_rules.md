# Networking Rules
- **Description**: Applies to files handling Socket.IO and real-time communication.
- **File Pattern**: **/server/**/*.js, **/lib/network/**/*.js
- **Rule**: Use Socket.IO namespaces (e.g., /room-{id}) to isolate game rooms and reduce server load.
- **Rule**: Emit events with minimal payloads (e.g., { x, y, z, rotation } for car positions) to optimize network performance.
- **Rule**: Implement error handling for dropped connections and reconnection logic with a 5-second timeout.
- **Reference File**: Include /server/gameState.js as context for game room and bot management.