import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../src/lib/physics';
import { Car } from '../src/lib/car';

// Create a custom position type that matches THREE.Vector3's interface
class Position {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}
  distanceTo() { return 0; }
}

// Mock THREE.js components that aren't needed for tests
jest.mock('three', () => {
  const originalThree = jest.requireActual('three');
  
  class MockVector3 {
    x: number;
    y: number;
    z: number;

    constructor(x?: number, y?: number, z?: number) {
      this.x = x ?? 0;
      this.y = y ?? 0;
      this.z = z ?? 0;
    }
    
    set = jest.fn().mockReturnThis();
    copy = jest.fn().mockReturnThis();
    clone = jest.fn().mockImplementation(() => new MockVector3(this.x, this.y, this.z));
    distanceTo = jest.fn().mockReturnValue(0);
  }

  // Create a minimal mock for Object3D
  class MockObject3D {
    position = new MockVector3();
    quaternion = { copy: jest.fn() };
  }
  
  // Create a minimal mock for Mesh
  class MockMesh extends MockObject3D {
    geometry = { dispose: jest.fn() };
    material = { dispose: jest.fn() };
    castShadow = false;
  }
  
  return {
    ...originalThree,
    Object3D: MockObject3D,
    Mesh: MockMesh,
    Vector3: MockVector3,
    Quaternion: class {
      x: number;
      y: number;
      z: number;
      w: number;
      constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
      }
      copy() { return this; }
    },
    BoxGeometry: class {
      constructor() {}
      dispose = jest.fn();
    },
    MeshPhongMaterial: class {
      constructor() {}
      dispose = jest.fn();
    },
    Group: class {
      constructor() {
        return {
          add: jest.fn(),
          position: new MockVector3(),
          quaternion: { copy: jest.fn() }
        };
      }
    }
  };
});

describe('PhysicsWorld', () => {
  let physics: PhysicsWorld;
  
  beforeEach(() => {
    physics = new PhysicsWorld();
  });
  
  test('should initialize physics world', () => {
    expect(physics).toBeDefined();
    expect(physics.groundBody).toBeDefined();
  });
  
  test('should add ground plane', () => {
    const groundBody = physics.addGroundPlane(
      { width: 100, depth: 100 },
      new CANNON.Vec3(0, 0, 0)
    );
    
    expect(groundBody).toBeDefined();
    expect(groundBody.type).toBe(CANNON.Body.STATIC);
  });
  
  test('should create a car body', () => {
    const mesh = new THREE.Object3D();
    const carBody = physics.createCarBody(
      { width: 2, height: 1, length: 4 },
      new CANNON.Vec3(0, 1, 0),
      mesh
    );
    
    expect(carBody).toBeDefined();
    expect(carBody.mass).toBe(1000);
  });
  
  test('should add an external body', () => {
    const boxBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
      position: new CANNON.Vec3(10, 1, 10)
    });
    
    const addedBody = physics.addExternalBody(boxBody);
    expect(addedBody).toBe(boxBody);
  });
  
  test('should apply forces to car body', () => {
    const carBody = new CANNON.Body({
      mass: 1500,
      shape: new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)),
      position: new CANNON.Vec3(0, 1, 0)
    });
    
    // Spy on applyForce and applyTorque methods
    const applyForceSpy = jest.spyOn(carBody, 'applyForce');
    const applyTorqueSpy = jest.spyOn(carBody, 'applyTorque');
    
    physics.applyCarForces(carBody, {
      acceleration: 1000,
      braking: 0,
      steering: 20
    });
    
    expect(applyForceSpy).toHaveBeenCalled();
    expect(applyTorqueSpy).toHaveBeenCalled();
  });
});

describe('Car', () => {
  let physics: PhysicsWorld;
  
  beforeEach(() => {
    physics = new PhysicsWorld();
  });
  
  test('should create a car', () => {
    const position = new THREE.Vector3(0, 1, 0);
    const startPos = new THREE.Vector3(0, 0, -10);
    const finishPos = new THREE.Vector3(0, 0, 10);
    const car = new Car(position, physics, 0xff0000, startPos, finishPos);
    
    expect(car).toBeDefined();
    expect(car.health).toBe(100);
    expect(car.mesh).toBeDefined();
    expect(car.body).toBeDefined();
  });
  
  test('should activate nitro', () => {
    const position = new THREE.Vector3(0, 1, 0);
    const startPos = new THREE.Vector3(0, 0, -10);
    const finishPos = new THREE.Vector3(0, 0, 10);
    const car = new Car(position, physics, 0xff0000, startPos, finishPos);
    car.activateNitro();
    
    expect(car.nitroActive).toBe(true);
    expect(car.nitroTimeLeft).toBe(5000);
  });
  
  test('should handle collisions and reduce health', () => {
    const position = new THREE.Vector3(0, 1, 0);
    const startPos = new THREE.Vector3(0, 0, -10);
    const finishPos = new THREE.Vector3(0, 0, 10);
    const car = new Car(position, physics, 0xff0000, startPos, finishPos);
    
    // Initial health is 100%
    expect(car.health).toBe(100);
    
    // Minor collision (5% damage)
    car.handleCollision('minor');
    expect(car.health).toBe(95);
    
    // Wall collision (10% damage)
    car.handleCollision('wall');
    expect(car.health).toBe(85);
    
    // Head-on collision (20% damage)
    car.handleCollision('headOn');
    expect(car.health).toBe(65);
  });
  
  test('should crash when health reaches 0', () => {
    const position = new THREE.Vector3(0, 1, 0);
    const startPos = new THREE.Vector3(0, 0, -10);
    const finishPos = new THREE.Vector3(0, 0, 10);
    const car = new Car(position, physics, 0xff0000, startPos, finishPos);
    
    // Apply enough damage to crash the car
    car.handleCollision('headOn'); // -20%
    car.handleCollision('headOn'); // -20%
    car.handleCollision('headOn'); // -20%
    car.handleCollision('headOn'); // -20%
    car.handleCollision('headOn'); // -20%
    
    expect(car.health).toBe(0);
    expect(car.crashed).toBe(true);
  });
  
  test('should update nitro state', () => {
    const position = new THREE.Vector3(0, 1, 0);
    const startPos = new THREE.Vector3(0, 0, -10);
    const finishPos = new THREE.Vector3(0, 0, 10);
    const car = new Car(position, physics, 0xff0000, startPos, finishPos);
    
    // Activate nitro
    car.activateNitro();
    expect(car.nitroActive).toBe(true);
    expect(car.nitroTimeLeft).toBe(5000);
    
    // Update with 1 second elapsed
    car.update(1);
    expect(car.nitroTimeLeft).toBe(4000);
    
    // Update with remaining time
    car.update(4);
    expect(car.nitroActive).toBe(false);
    expect(car.nitroTimeLeft).toBe(0);
  });
}); 