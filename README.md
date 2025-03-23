# 3D Car Racing PvP Game

A real-time multiplayer car racing game built with Next.js, Three.js, and Socket.IO.

## Features

- 3D racing experience with realistic physics
- Multiplayer support for up to 8 players
- AI bots to fill empty slots
- 5 unique race terrains
- Real-time position tracking and lap counting
- Nitro boosts and health mechanics

## Tech Stack

- **Frontend**: Next.js, React, Three.js
- **Backend**: Node.js, Express, Socket.IO
- **Physics**: Cannon.js
- **Database**: Redis
- **Deployment**: Vercel (frontend), AWS/DigitalOcean (backend)

## Project Structure

```
/
├── client/               # Next.js frontend
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and game logic
│   │   └── pages/        # Next.js pages
│   └── tests/            # Frontend tests
├── server/               # Node.js backend
│   ├── lib/              # Server logic
│   ├── services/         # Business logic
│   └── tests/            # Backend tests
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Redis (for development)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/car-racing-pvp.git
   cd car-racing-pvp
   ```

2. Install dependencies
   ```
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Run the development servers
   ```
   # Start the client
   cd client
   npm run dev

   # Start the server
   cd ../server
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Development Workflow

- Create or fix issues
- Write tests
- Submit pull requests
- Documentation is maintained in the `/docs` directory

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
