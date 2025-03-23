import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Define interfaces
interface RoomData {
  name: string;
  terrain: string;
  maxPlayers: number;
}

// Basic routes
app.get('/', (_req: Request, res: Response) => {
  res.send('Racing Game Server Running');
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO setup
io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
  
  // Handle room creation
  socket.on('createRoom', (roomData: RoomData) => {
    // Logic for creating a room will be implemented in Phase 3
    console.log(`Room created: ${JSON.stringify(roomData)}`);
  });
  
  // Handle joining a room
  socket.on('joinRoom', (roomId: string) => {
    // Logic for joining a room will be implemented in Phase 3
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
});

// Function to start the server
const startServer = () => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Start the server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}

export { app, server, io, startServer }; 