import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from './physics';
import { createCarModel } from './models/car';

export interface RaceStatus {
  raceStarted: boolean;
  raceFinished: boolean;
  raceTime: number;  // Time in seconds
}

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
  
  // Race status
  public raceStatus: RaceStatus = {
    raceStarted: false,
    raceFinished: false,
    raceTime: 0
  };
  private raceStartTime: number = 0;
  private raceFinishTime: number = 0;
  
  // Start and finish positions
  private startPosition: THREE.Vector3;
  private finishPosition: THREE.Vector3;
  private readonly CHECKPOINT_RADIUS = 10; // How close to get to start/finish
  
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
    color: number = 0xff0000,
    startPosition: THREE.Vector3,
    finishPosition: THREE.Vector3
  ) {
    // Store race track positions
    this.startPosition = startPosition;
    this.finishPosition = finishPosition;
    
    // Create a detailed car mesh using our model function
    this.mesh = createCarModel(color);
    this.mesh.position.copy(position);
    
    // Rotate car to face forward based on start/finish positions
    this.orientCarTowardsFinish();
    
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
   * Orient the car to face the finish line
   */
  private orientCarTowardsFinish() {
    // Get direction from start to finish
    const direction = new THREE.Vector3();
    direction.subVectors(this.finishPosition, this.startPosition).normalize();
    
    // Create a rotation to face this direction
    // Default car faces z direction (0,0,1)
    // We need to rotate it to face the finish
    const angle = Math.atan2(direction.x, direction.z);
    this.mesh.rotation.y = angle;
    
    console.log("Car oriented towards finish with angle:", angle);
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
    
    // Don't allow controls when race is finished
    if (this.raceStatus.raceFinished) {
      console.log("Race is finished, not applying controls");
      return;
    }
    
    // If near start line and not started, trigger race start
    if (!this.raceStatus.raceStarted) {
      const distanceToStart = this.mesh.position.distanceTo(this.startPosition);
      if (distanceToStart < this.CHECKPOINT_RADIUS) {
        this.startRace();
      }
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
    
    // Update race time if race is in progress
    if (this.raceStatus.raceStarted && !this.raceStatus.raceFinished) {
      this.raceStatus.raceTime = (Date.now() - this.raceStartTime) / 1000;
      
      // Check if car has reached the finish line
      const distanceToFinish = this.mesh.position.distanceTo(this.finishPosition);
      if (distanceToFinish < this.CHECKPOINT_RADIUS) {
        this.finishRace();
      }
    }
  }
  
  /**
   * Start the race
   */
  startRace() {
    if (this.raceStatus.raceStarted) return;
    
    console.log("Race started!");
    this.raceStatus.raceStarted = true;
    this.raceStartTime = Date.now();
  }
  
  /**
   * Finish the race
   */
  finishRace() {
    if (this.raceStatus.raceFinished) return;
    
    this.raceFinishTime = Date.now();
    this.raceStatus.raceFinished = true;
    this.raceStatus.raceTime = (this.raceFinishTime - this.raceStartTime) / 1000;
    
    console.log(`Race finished! Time: ${this.raceStatus.raceTime.toFixed(2)} seconds`);
    
    // Apply braking forces to slow the car down
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  }
  
  /**
   * Reset the race
   */
  resetRace() {
    console.log("Race reset");
    
    // Reset race status
    this.raceStatus.raceStarted = false;
    this.raceStatus.raceFinished = false;
    this.raceStatus.raceTime = 0;
    
    // Reset car state (optional - depends on if you want to reset position)
    // this.body.position.copy(new CANNON.Vec3(this.startPosition.x, this.startPosition.y, this.startPosition.z));
    // this.body.velocity.set(0, 0, 0);
    // this.body.angularVelocity.set(0, 0, 0);
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
   * Teleport car to specified position
   * @param position New position
   */
  teleportTo(position: THREE.Vector3) {
    this.body.position.x = position.x;
    this.body.position.y = position.y;
    this.body.position.z = position.z;
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    console.log("Car teleported to:", position);
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