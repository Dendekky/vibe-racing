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
  
  // Safe initialization period
  private isInitializing: boolean = true;
  private initializationTimer: number | null = null;
  private readonly INIT_SAFE_PERIOD = 2000; // 2 seconds grace period
  
  // Physics constants - increased for better responsiveness
  private readonly ACCELERATION_FORCE = 50000; // Increased from 20000
  private readonly BRAKING_FORCE = 30000;
  private readonly STEERING_FORCE = 150; // Increased from 50
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
    
    // Create the physics body with an increased starting height
    this.body = physics.createCarBody(
      { width: 2, height: 1, length: 4 },
      new CANNON.Vec3(position.x, position.y, position.z),
      this.mesh
    );
    
    // Add a collision callback to detect when car hits something
    this.body.addEventListener('collide', (event: { type: string; body: CANNON.Body; contact: CANNON.ContactEquation; }) => {
      if (this.isInitializing) {
        console.log('Car in initialization phase, ignoring collision');
        return;
      }
      
      console.log('Car collision detected:', event);
      
      // Ignore collisions with ground if velocity is low (landing/resting on ground)
      const relativeVelocity = event.contact.getImpactVelocityAlongNormal();
      const isGroundCollision = physics.isGroundBody(event.body) && 
                               Math.abs(event.contact.ni.y) > 0.8; // Normal points mostly up/down
      
      if (isGroundCollision && Math.abs(relativeVelocity) < 5) {
        console.log('Ignoring minor ground collision');
        return;
      }
      
      // Determine collision type based on relative velocity
      let collisionType: 'minor' | 'wall' | 'headOn';
      if (Math.abs(relativeVelocity) < 5) {
        collisionType = 'minor';
      } else if (Math.abs(relativeVelocity) < 10) {
        collisionType = 'wall';
      } else {
        collisionType = 'headOn';
      }
      
      this.handleCollision(collisionType);
    });
    
    console.log("Car created with physics body:", this.body);
    
    // Start initialization safety period
    this.startInitializationPeriod();
  }
  
  /**
   * Start the initialization safety period
   */
  private startInitializationPeriod() {
    this.isInitializing = true;
    console.log("Car initialization period started");
    
    this.initializationTimer = window.setTimeout(() => {
      this.isInitializing = false;
      this.initializationTimer = null;
      console.log("Car initialization period ended");
    }, this.INIT_SAFE_PERIOD);
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
    if (this.crashed) {
      console.log("Car is crashed, not applying controls");
      return;
    }
    
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
    
    // Log active forces for debugging
    if (this.acceleration > 0 || this.braking > 0 || this.steering !== 0) {
      console.log("Car forces:", {
        acceleration: this.acceleration,
        braking: this.braking,
        steering: this.steering
      });
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
    
    // Log velocity and position for debugging if car is moving
    if (Math.abs(this.body.velocity.x) > 0.1 || 
        Math.abs(this.body.velocity.y) > 0.1 || 
        Math.abs(this.body.velocity.z) > 0.1) {
      console.log("Car velocity:", this.body.velocity, "position:", this.body.position);
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
    console.log("Nitro activated!");
  }
  
  /**
   * Handle collision damage
   * @param collisionType Type of collision for damage calculation
   */
  handleCollision(collisionType: 'minor' | 'wall' | 'headOn') {
    if (this.crashed || this.isInitializing) return;
    
    // Calculate damage based on collision type
    let damage = 0;
    
    switch (collisionType) {
      case 'minor':
        damage = 2; // Reduced from 5
        break;
      case 'wall':
        damage = 8; // Reduced from 10
        break;
      case 'headOn':
        damage = 15; // Reduced from 20
        break;
    }
    
    // Apply damage
    this.health = Math.max(0, this.health - damage);
    
    console.log(`Collision: ${collisionType}, damage: ${damage}, health: ${this.health}`);
    
    // Check if crashed
    if (this.health === 0) {
      this.crashed = true;
      console.log("Car crashed! Resetting in 3 seconds...");
      
      // Reset crash after 3 seconds
      this.crashTimeout = window.setTimeout(() => {
        this.health = 100;
        this.crashed = false;
        this.crashTimeout = null;
        console.log("Car reset after crash");
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
    
    if (this.initializationTimer) {
      clearTimeout(this.initializationTimer);
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