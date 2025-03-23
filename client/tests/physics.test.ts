import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../src/lib/physics';
import { Car } from '../src/lib/car';

// Mock THREE.js components that aren't needed for tests
jest.mock('three', () => {
  const originalThree = jest.requireActual('three');
  
  // Create a minimal mock for Object3D
  class MockObject3D {
    position = { copy: jest.fn() };
    quaternion = { copy: jest.fn() };
  }
  
  // Create a minimal mock for Mesh
  class MockMesh extends MockObject3D {
    geometry = { dispose: jest.fn() };
    material = { dispose: jest.fn() };
  }
  
  return {
    ...originalThree,
    Object3D: MockObject3D,
    Mesh: MockMesh,
    Vector3: class {
      x: number;
      y: number;
      z: number;
      constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
      }
      copy() { return this; }
      clone() { return new this.constructor(this.x, this.y, this.z); }
    },
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
      dispose = jest.fn();
    },
    MeshStandardMaterial: class {
      dispose = jest.fn();
    }
  };
});

describe('PhysicsWorld', () => {
  let physics: PhysicsWorld;
  
  beforeEach(() => {
    physics = new PhysicsWorld();
  });
  
  test('should create a physics world', () => {
    expect(physics).toBeDefined();
  });
  
  test('should add a ground plane', () => {
    const groundBody = physics.addGroundPlane(
      { width: 100, depth: 100 },
      new CANNON.Vec3(0, 0, 0)
    );
    
    expect(groundBody).toBeDefined();
    expect(groundBody.type).toBe(CANNON.BODY_TYPES.STATIC);
  });
  
  test('should create a car body', () => {
    const mesh = new THREE.Object3D();
    const carBody = physics.createCarBody(
      { width: 2, height: 1, length: 4 },
      new CANNON.Vec3(0, 1, 0),
      mesh
    );
    
    expect(carBody).toBeDefined();
    expect(carBody.mass).toBe(1500);
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
  
  test('should update physics world', () => {
    const mesh = new THREE.Object3D();
    physics.createCarBody(
      { width: 2, height: 1, length: 4 },
      new CANNON.Vec3(0, 1, 0),
      mesh
    );
    
    physics.update();
    
    // Verify that mesh position and quaternion are updated
    expect(mesh.position.copy).toHaveBeenCalled();
    expect(mesh.quaternion.copy).toHaveBeenCalled();
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
    const car = new Car(new THREE.Vector3(0, 1, 0), physics);
    
    expect(car).toBeDefined();
    expect(car.health).toBe(100);
    expect(car.mesh).toBeDefined();
    expect(car.body).toBeDefined();
  });
  
  test('should activate nitro', () => {
    const car = new Car(new THREE.Vector3(0, 1, 0), physics);
    car.activateNitro();
    
    expect(car.nitroActive).toBe(true);
    expect(car.nitroTimeLeft).toBe(5000);
  });
  
  test('should handle collisions and reduce health', () => {
    const car = new Car(new THREE.Vector3(0, 1, 0), physics);
    
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
    jest.useFakeTimers();
    
    const car = new Car(new THREE.Vector3(0, 1, 0), physics);
    
    // Multiple collisions to reduce health to 0
    car.handleCollision('headOn'); // -20%, health = 80%
    car.handleCollision('headOn'); // -20%, health = 60%
    car.handleCollision('headOn'); // -20%, health = 40%
    car.handleCollision('headOn'); // -20%, health = 20%
    car.handleCollision('headOn'); // -20%, health = 0%
    
    expect(car.health).toBe(0);
    expect(car.crashed).toBe(true);
    
    // Fast-forward time 3 seconds
    jest.advanceTimersByTime(3000);
    
    // Car should be repaired
    expect(car.health).toBe(100);
    expect(car.crashed).toBe(false);
    
    jest.useRealTimers();
  });
  
  test('should update nitro state', () => {
    const car = new Car(new THREE.Vector3(0, 1, 0), physics);
    car.activateNitro();
    
    // Initial nitro state
    expect(car.nitroActive).toBe(true);
    expect(car.nitroTimeLeft).toBe(5000);
    
    // Update with 1 second delta time
    car.update(1);
    
    // Nitro time should be reduced by 1 second (1000ms)
    expect(car.nitroTimeLeft).toBe(4000);
    
    // Update with 4 seconds delta time
    car.update(4);
    
    // Nitro should be depleted
    expect(car.nitroActive).toBe(false);
    expect(car.nitroTimeLeft).toBe(0);
  });
}); 