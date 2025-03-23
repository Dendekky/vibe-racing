import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from './physics';
import { createCarModel } from './models/car';

export class Car {
  // THREE.js mesh
  public mesh: THREE.Object3D;
  // CANNON.js body
  public body: CANNON.Body;
  // Car state
  public health: number = 100;
  public maxSpeed: number = 50; // m/s
  public acceleration: number = 0;
  public braking: number = 0;
  public steering: number = 0;
  public nitroActive: boolean = false;
  public nitroTimeLeft: number = 0;
  public crashed: boolean = false;
  public crashTimeout: number | null = null;
  
  // Physics constants
  private readonly ACCELERATION_FORCE = 20000;
  private readonly BRAKING_FORCE = 30000;
  private readonly STEERING_FORCE = 50;
  private readonly NITRO_MULTIPLIER = 1.3;
  private readonly NITRO_DURATION = 5000; // 5 seconds in ms
  
  constructor(
    position: THREE.Vector3,
    physics: PhysicsWorld,
    color: number = 0xff0000
  ) {
    // Create a detailed car mesh using our model function
    this.mesh = createCarModel(color);
    this.mesh.position.copy(position);
    
    // Create the physics body
    this.body = physics.createCarBody(
      { width: 2, height: 1, length: 4 },
      new CANNON.Vec3(position.x, position.y, position.z),
      this.mesh
    );
  }
  
  /**
   * Apply controls input to the car
   * @param input Input controls
   * @param physics Physics world for applying forces
   */
  applyControls(
    input: { forward: boolean, backward: boolean, left: boolean, right: boolean, nitro: boolean },
    physics: PhysicsWorld
  ) {
    // Don't allow controls when crashed
    if (this.crashed) return;
    
    // Reset forces
    this.acceleration = 0;
    this.braking = 0;
    this.steering = 0;
    
    // Handle acceleration
    if (input.forward) {
      this.acceleration = this.ACCELERATION_FORCE;
      if (this.nitroActive) {
        this.acceleration *= this.NITRO_MULTIPLIER;
      }
    }
    
    // Handle braking
    if (input.backward) {
      this.braking = this.BRAKING_FORCE;
    }
    
    // Handle steering
    if (input.left) {
      this.steering = -this.STEERING_FORCE;
    }
    if (input.right) {
      this.steering = this.STEERING_FORCE;
    }
    
    // Apply forces to the physics body
    physics.applyCarForces(this.body, {
      acceleration: this.acceleration,
      braking: this.braking,
      steering: this.steering
    });
    
    // Handle nitro activation
    if (input.nitro && !this.nitroActive && this.nitroTimeLeft === 0) {
      this.activateNitro();
    }
  }
  
  /**
   * Update car state
   * @param deltaTime Time since last update in seconds
   */
  update(deltaTime: number) {
    // Update nitro state
    if (this.nitroActive) {
      this.nitroTimeLeft -= deltaTime * 1000; // Convert to ms
      
      if (this.nitroTimeLeft <= 0) {
        this.nitroActive = false;
        this.nitroTimeLeft = 0;
      }
    }
  }
  
  /**
   * Activate nitro boost
   */
  activateNitro() {
    this.nitroActive = true;
    this.nitroTimeLeft = this.NITRO_DURATION;
  }
  
  /**
   * Handle collision damage
   * @param collisionType Type of collision for damage calculation
   */
  handleCollision(collisionType: 'minor' | 'wall' | 'headOn') {
    if (this.crashed) return;
    
    // Calculate damage based on collision type
    let damage = 0;
    
    switch (collisionType) {
      case 'minor':
        damage = 5;
        break;
      case 'wall':
        damage = 10;
        break;
      case 'headOn':
        damage = 20;
        break;
    }
    
    // Apply damage
    this.health = Math.max(0, this.health - damage);
    
    // Check if crashed
    if (this.health === 0) {
      this.crashed = true;
      
      // Reset crash after 3 seconds
      this.crashTimeout = window.setTimeout(() => {
        this.health = 100;
        this.crashed = false;
        this.crashTimeout = null;
      }, 3000);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Clear any timers
    if (this.crashTimeout) {
      clearTimeout(this.crashTimeout);
    }
    
    // Dispose THREE.js geometries and materials
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });
  }
} 