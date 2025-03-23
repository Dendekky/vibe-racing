import * as THREE from 'three';

/**
 * Terrain configuration for all locations
 */
export interface TerrainConfig {
  name: string;
  size: { width: number; depth: number };
  length: number; // Track length in km
  trackWidth: number;
  heightMap: (x: number, z: number) => number;
  groundColor: number;
  trackColor: number;
  obstacles?: ObstacleConfig[];
  skyColor: number;
  difficulty: 'easy' | 'medium' | 'hard';
  startPosition: THREE.Vector3;
  finishPosition: THREE.Vector3;
}

/**
 * Obstacle configuration
 */
interface ObstacleConfig {
  type: 'box' | 'cylinder' | 'sphere';
  position: { x: number; y: number; z: number };
  size: { width?: number; height?: number; depth?: number; radius?: number };
  color: number;
}

/**
 * Available terrains
 */
export const TERRAINS: Record<string, TerrainConfig> = {
  monaco: {
    name: 'Monaco Grand Prix',
    size: { width: 100, depth: 100 },
    length: 2.0, // 2.0 km
    trackWidth: 10,
    heightMap: (x, z) => {
      // Monaco has tight turns and mild elevation changes
      return (
        Math.sin(x * 0.05) * 2 +
        Math.cos(z * 0.08) * 2 +
        Math.sin(x * 0.02 + z * 0.02) * 1
      );
    },
    groundColor: 0x3e5641, // Dark green
    trackColor: 0x333333, // Darker gray
    obstacles: [
      // Strategic obstacles for Monaco
      { type: 'box', position: { x: 20, y: 1, z: 30 }, size: { width: 4, height: 2, depth: 4 }, color: 0xd0d0d0 },
      { type: 'box', position: { x: -25, y: 1, z: -40 }, size: { width: 6, height: 3, depth: 3 }, color: 0xc0c0c0 },
      { type: 'cylinder', position: { x: 40, y: 1.5, z: -20 }, size: { radius: 3, height: 3 }, color: 0xb0b0b0 }
    ],
    skyColor: 0x87ceeb, // Light blue
    difficulty: 'medium',
    startPosition: new THREE.Vector3(0, 0.5, -40),
    finishPosition: new THREE.Vector3(0, 0.5, 40)
  },
  
  alpines: {
    name: 'Alpine Circuit',
    size: { width: 100, depth: 100 },
    length: 2.5, // 2.5 km
    trackWidth: 12,
    heightMap: (x, z) => {
      // Alpine track has significant height variations
      return (
        Math.sin(x * 0.03) * 8 +
        Math.cos(z * 0.03) * 8 +
        Math.sin(x * 0.08) * 2 +
        Math.cos(z * 0.08) * 2
      );
    },
    groundColor: 0xf0f0f0, // White/snow
    trackColor: 0x505050, // Mountain road
    obstacles: [
      // Alpine rocks and obstacles
      { type: 'cylinder', position: { x: 50, y: 4, z: 70 }, size: { radius: 5, height: 8 }, color: 0x808080 },
      { type: 'box', position: { x: -60, y: 3, z: -50 }, size: { width: 10, height: 6, depth: 7 }, color: 0x707070 },
      { type: 'sphere', position: { x: 30, y: 4, z: -60 }, size: { radius: 4 }, color: 0x909090 }
    ],
    skyColor: 0xc0c9d0, // Light gray
    difficulty: 'hard',
    startPosition: new THREE.Vector3(-40, 0.5, 0),
    finishPosition: new THREE.Vector3(40, 0.5, 0)
  },
  
  dubai: {
    name: 'Dubai Desert',
    size: { width: 100, depth: 100 },
    length: 3.0, // 3.0 km
    trackWidth: 15,
    heightMap: (x, z) => {
      // Dubai has gentle desert dunes
      return (
        Math.sin(x * 0.02) * 3 +
        Math.cos(z * 0.02) * 3 +
        Math.sin(x * 0.05 + z * 0.05) * 0.5
      );
    },
    groundColor: 0xdeb887, // Sand color
    trackColor: 0x666666, // Asphalt
    obstacles: [
      // Dubai-themed obstacles
      { type: 'box', position: { x: 70, y: 5, z: 100 }, size: { width: 8, height: 10, depth: 8 }, color: 0xe0e0e0 },
      { type: 'cylinder', position: { x: -80, y: 7, z: -90 }, size: { radius: 4, height: 14 }, color: 0xd0d0d0 },
      { type: 'box', position: { x: 50, y: 6, z: -70 }, size: { width: 12, height: 12, depth: 6 }, color: 0xf0f0f0 }
    ],
    skyColor: 0xfad6a5, // Light orange
    difficulty: 'easy',
    startPosition: new THREE.Vector3(-30, 0.5, -30),
    finishPosition: new THREE.Vector3(30, 0.5, 30)
  },
  
  baku: {
    name: 'Baku City Circuit',
    size: { width: 100, depth: 100 },
    length: 2.8, // 2.8 km
    trackWidth: 12,
    heightMap: (x, z) => {
      // Baku has a mix of flat areas and mild hills with some city-like grid patterns
      return (
        Math.sin(x * 0.04) * 1.5 +
        Math.cos(z * 0.04) * 1.5 +
        (Math.abs(Math.sin(x * 0.1)) + Math.abs(Math.sin(z * 0.1))) * 0.5
      );
    },
    groundColor: 0x808080, // Gray (asphalt)
    trackColor: 0x3c3c3c, // Dark asphalt
    obstacles: [
      // City-like obstacles for Baku
      { type: 'box', position: { x: 40, y: 4, z: 60 }, size: { width: 8, height: 8, depth: 6 }, color: 0xb0b0b0 },
      { type: 'box', position: { x: -45, y: 5, z: -65 }, size: { width: 7, height: 10, depth: 5 }, color: 0xc0c0c0 },
      { type: 'box', position: { x: 60, y: 3, z: -50 }, size: { width: 6, height: 6, depth: 4 }, color: 0xa0a0a0 }
    ],
    skyColor: 0x1e3c72, // Dark blue
    difficulty: 'medium',
    startPosition: new THREE.Vector3(0, 0.5, -40),
    finishPosition: new THREE.Vector3(0, 0.5, 40)
  },
  
  shanghai: {
    name: 'Shanghai International',
    size: { width: 100, depth: 100 },
    length: 2.7, // 2.7 km
    trackWidth: 14,
    heightMap: (x, z) => {
      // Shanghai has a mix of flat straights and technical sections
      return (
        Math.sin(x * 0.03) * 2 +
        Math.cos(z * 0.03) * 2 +
        Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5
      );
    },
    groundColor: 0x7f8c8d, // Medium gray
    trackColor: 0x444444, // Modern asphalt
    obstacles: [
      // Shanghai-themed obstacles
      { type: 'cylinder', position: { x: 55, y: 6, z: 75 }, size: { radius: 3, height: 12 }, color: 0xd0d0d0 },
      { type: 'box', position: { x: -60, y: 4, z: -80 }, size: { width: 8, height: 8, depth: 5 }, color: 0xe0e0e0 },
      { type: 'sphere', position: { x: 70, y: 3, z: -40 }, size: { radius: 3 }, color: 0xc0c0c0 }
    ],
    skyColor: 0x2c3e50, // Dark blue-gray
    difficulty: 'medium',
    startPosition: new THREE.Vector3(-40, 0.5, -40),
    finishPosition: new THREE.Vector3(40, 0.5, 40)
  }
};

/**
 * Create a terrain mesh based on the specified config
 * @param config The terrain configuration
 * @returns The terrain group containing ground and track
 */
export function createTerrainModel(config: TerrainConfig): THREE.Group {
  const terrainGroup = new THREE.Group();
  
  // Create the ground
  const { width, depth } = config.size;
  const groundGeometry = new THREE.PlaneGeometry(width, depth, 64, 64);
  
  // Apply height map to vertices
  const positions = groundGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    positions[i + 1] = config.heightMap(x, z);
  }
  
  // Update normals after modifying vertices
  groundGeometry.computeVertexNormals();
  
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: config.groundColor,
    roughness: 0.8,
    metalness: 0.2,
    flatShading: false
  });
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  ground.receiveShadow = true;
  terrainGroup.add(ground);
  
  // Create a simple track (we'll improve this later with actual track paths)
  // For now, let's create a circular track
  const trackRadius = Math.min(width, depth) * 0.3;
  const trackGeometry = new THREE.TorusGeometry(
    trackRadius,
    config.trackWidth / 2,
    16,
    100
  );
  
  const trackMaterial = new THREE.MeshStandardMaterial({
    color: config.trackColor,
    roughness: 0.6,
    metalness: 0.1
  });
  
  const track = new THREE.Mesh(trackGeometry, trackMaterial);
  track.rotation.x = Math.PI / 2; // Make it horizontal
  track.position.y = 0.1; // Slightly above ground to prevent z-fighting
  track.receiveShadow = true;
  terrainGroup.add(track);
  
  // Add obstacles if defined
  if (config.obstacles) {
    config.obstacles.forEach(obstacle => {
      let mesh: THREE.Mesh;
      
      // Create the geometry based on obstacle type
      if (obstacle.type === 'box') {
        const geometry = new THREE.BoxGeometry(
          obstacle.size.width || 1,
          obstacle.size.height || 1,
          obstacle.size.depth || 1
        );
        const material = new THREE.MeshStandardMaterial({ color: obstacle.color });
        mesh = new THREE.Mesh(geometry, material);
      } else if (obstacle.type === 'cylinder') {
        const geometry = new THREE.CylinderGeometry(
          obstacle.size.radius || 1,
          obstacle.size.radius || 1,
          obstacle.size.height || 2,
          32
        );
        const material = new THREE.MeshStandardMaterial({ color: obstacle.color });
        mesh = new THREE.Mesh(geometry, material);
      } else if (obstacle.type === 'sphere') {
        const geometry = new THREE.SphereGeometry(obstacle.size.radius || 1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: obstacle.color });
        mesh = new THREE.Mesh(geometry, material);
      } else {
        // Default to a box if type is not recognized
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: obstacle.color });
        mesh = new THREE.Mesh(geometry, material);
      }
      
      // Set position and shadows
      mesh.position.set(
        obstacle.position.x,
        obstacle.position.y,
        obstacle.position.z
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      terrainGroup.add(mesh);
    });
  }
  
  // Create start flag
  const startFlag = createFlag(0xff0000); // Red flag
  startFlag.position.copy(config.startPosition);
  terrainGroup.add(startFlag);
  
  // Create finish flag
  const finishFlag = createFlag(0x00ff00); // Green flag
  finishFlag.position.copy(config.finishPosition);
  terrainGroup.add(finishFlag);
  
  // Create start line
  const startLine = createLine(0xffffff); // White line
  startLine.position.copy(config.startPosition);
  startLine.position.y = 0.01; // Slightly above ground to prevent z-fighting
  terrainGroup.add(startLine);
  
  // Create finish line
  const finishLine = createLine(0xffffff); // White line
  finishLine.position.copy(config.finishPosition);
  finishLine.position.y = 0.01; // Slightly above ground
  terrainGroup.add(finishLine);
  
  return terrainGroup;
}

/**
 * Create a flag
 * @param color Flag color
 * @returns THREE.js group containing the flag
 */
function createFlag(color: number): THREE.Group {
  const group = new THREE.Group();
  
  // Create pole
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 2.5; // Half height
  pole.castShadow = true;
  group.add(pole);
  
  // Create flag
  const flagGeometry = new THREE.PlaneGeometry(2, 1);
  const flagMaterial = new THREE.MeshStandardMaterial({ 
    color: color,
    side: THREE.DoubleSide
  });
  const flag = new THREE.Mesh(flagGeometry, flagMaterial);
  flag.position.set(1, 4, 0); // Position at top of pole
  flag.castShadow = true;
  group.add(flag);
  
  return group;
}

/**
 * Create a line on the ground
 * @param color Line color
 * @returns THREE.js mesh containing the line
 */
function createLine(color: number): THREE.Mesh {
  const lineGeometry = new THREE.PlaneGeometry(10, 1);
  const lineMaterial = new THREE.MeshStandardMaterial({ 
    color: color,
    side: THREE.DoubleSide
  });
  const line = new THREE.Mesh(lineGeometry, lineMaterial);
  line.rotation.x = -Math.PI / 2; // Lay flat on ground
  return line;
} 