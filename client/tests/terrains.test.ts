import * as THREE from 'three';
import { TERRAINS, createTerrainModel, TerrainConfig } from '../src/lib/models/terrains';

// Mock THREE.js components that aren't needed for tests
jest.mock('three', () => {
  const originalThree = jest.requireActual('three');
  
  return {
    ...originalThree,
    Group: class {
      add = jest.fn();
      traverse = jest.fn();
    },
    PlaneGeometry: class {
      attributes = {
        position: {
          array: new Float32Array(100 * 3) // Mock vertex positions
        }
      };
      computeVertexNormals = jest.fn();
    },
    TorusGeometry: class {},
    BoxGeometry: class {},
    CylinderGeometry: class {},
    SphereGeometry: class {},
    MeshStandardMaterial: class {},
    Mesh: class {
      position = { set: jest.fn() };
      rotation = { x: 0 };
      castShadow = false;
      receiveShadow = false;
    }
  };
});

describe('Terrain Models', () => {
  test('should have 5 different terrains', () => {
    // Expect 5 different terrains: Monaco, Alpines, Dubai, Baku, Shanghai
    expect(Object.keys(TERRAINS).length).toBe(5);
    
    // Check if each terrain is defined
    expect(TERRAINS.monaco).toBeDefined();
    expect(TERRAINS.alpines).toBeDefined();
    expect(TERRAINS.dubai).toBeDefined();
    expect(TERRAINS.baku).toBeDefined();
    expect(TERRAINS.shanghai).toBeDefined();
  });
  
  test('each terrain should have correct properties', () => {
    Object.values(TERRAINS).forEach(terrain => {
      // Check required properties
      expect(terrain.name).toBeDefined();
      expect(terrain.size).toBeDefined();
      expect(terrain.length).toBeDefined();
      expect(terrain.trackWidth).toBeDefined();
      expect(terrain.heightMap).toBeDefined();
      expect(terrain.groundColor).toBeDefined();
      expect(terrain.trackColor).toBeDefined();
      expect(terrain.skyColor).toBeDefined();
      expect(terrain.difficulty).toBeDefined();
      
      // Type checks
      expect(typeof terrain.name).toBe('string');
      expect(typeof terrain.size.width).toBe('number');
      expect(typeof terrain.size.depth).toBe('number');
      expect(typeof terrain.length).toBe('number');
      expect(typeof terrain.trackWidth).toBe('number');
      expect(typeof terrain.heightMap).toBe('function');
      expect(typeof terrain.groundColor).toBe('number');
      expect(typeof terrain.trackColor).toBe('number');
      expect(typeof terrain.skyColor).toBe('number');
      expect(['easy', 'medium', 'hard'].includes(terrain.difficulty)).toBe(true);
    });
  });

  test('terrain distances should match specification', () => {
    // Check the track lengths specified in the implementation plan
    expect(TERRAINS.monaco.length).toBe(2.0); // Monaco: 2.0 km
    expect(TERRAINS.alpines.length).toBe(2.5); // Alpines: 2.5 km
    expect(TERRAINS.dubai.length).toBe(3.0); // Dubai: 3.0 km
    expect(TERRAINS.baku.length).toBe(2.8); // Baku: 2.8 km
    expect(TERRAINS.shanghai.length).toBe(2.7); // Shanghai: 2.7 km
  });
  
  test('height map functions should return valid heights', () => {
    Object.values(TERRAINS).forEach(terrain => {
      // Test height map with various coordinates
      const height1 = terrain.heightMap(0, 0);
      const height2 = terrain.heightMap(10, 20);
      const height3 = terrain.heightMap(-15, 5);
      
      // Heights should be numbers
      expect(typeof height1).toBe('number');
      expect(typeof height2).toBe('number');
      expect(typeof height3).toBe('number');
      
      // They shouldn't return NaN or Infinity
      expect(isNaN(height1)).toBe(false);
      expect(isNaN(height2)).toBe(false);
      expect(isNaN(height3)).toBe(false);
      expect(isFinite(height1)).toBe(true);
      expect(isFinite(height2)).toBe(true);
      expect(isFinite(height3)).toBe(true);
    });
  });
  
  test('should create a terrain model', () => {
    // Test with Monaco terrain
    const terrain = createTerrainModel(TERRAINS.monaco);
    
    // The function should return a THREE.Group
    expect(terrain).toBeDefined();
    expect(terrain.add).toBeDefined();
    
    // For better coverage, we could check that the add method was called
    // the correct number of times (ground + track + obstacles)
    const expectedCalls = 2 + (TERRAINS.monaco.obstacles?.length || 0);
    expect(terrain.add).toHaveBeenCalledTimes(expectedCalls);
  });
}); 