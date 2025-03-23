# Database Rules
- **Description**: Applies to database interaction files.
- **File Pattern**: **/lib/db/**/*.js
- **Rule**: Use Redis for ephemeral data (e.g., room state, player positions) with a TTL of 1 hour after race ends.
- **Rule**: If using MongoDB, define schemas for persistent data (e.g., User, RaceHistory) and index frequently queried fields (e.g., username).
- **Rule**: Abstract database calls into service files (e.g., redisService.js) for reusability.