import * as CANNON from 'cannon-es';
import * as THREE from 'three';

/**
 * Physics world class to handle car physics and collisions
 */
export class PhysicsWorld {
  private world: CANNON.World;
  private timeStep: number = 1 / 60;
  private bodies: Map<THREE.Object3D, CANNON.Body> = new Map();
  private externalBodies: CANNON.Body[] = [];
  public groundBody: CANNON.Body | null = null;

  constructor() {
    // Initialize the Cannon.js world with reduced gravity
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -7.82, 0) // Reduced gravity (default is -9.82)
    });
    
    // Set up default world settings
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    
    // Increase stability with solver configuration
    // @ts-ignore: Cannon-es type definitions might be incomplete
    this.world.solver.iterations = 10; // Default is 10
    // @ts-ignore: Cannon-es type definitions might be incomplete
    this.world.solver.tolerance = 0.01; // Default is 0.01
    
    // Create default materials and contact properties
    this.setupDefaultMaterials();
    
    // Add collision event listener for debugging
    this.world.addEventListener('beginContact', (event: { bodyA: CANNON.Body; bodyB: CANNON.Body }) => {
      console.log('Collision detected between bodies:', event.bodyA.id, event.bodyB.id);
    });
    
    console.log("Physics world initialized with custom settings");
  }
  
  /**
   * Set up default materials and contact properties
   */
  private setupDefaultMaterials() {
    // Create default materials
    const defaultMaterial = new CANNON.Material('default');
    const groundMaterial = new CANNON.Material('ground');
    const carMaterial = new CANNON.Material('car');
    
    // Define contact properties between materials
    const groundCarContact = new CANNON.ContactMaterial(
      groundMaterial, 
      carMaterial, 
      {
        friction: 0.3,       // Lower friction for easier movement
        restitution: 0.2,    // Some bounce but not too much
        contactEquationStiffness: 1e6,  // Soft contact
        contactEquationRelaxation: 3    // Soft contact
      }
    );
    
    const defaultContact = new CANNON.ContactMaterial(
      defaultMaterial, 
      defaultMaterial, 
      {
        friction: 0.3,
        restitution: 0.3,
      }
    );
    
    // Add contact materials to the world
    this.world.addContactMaterial(groundCarContact);
    this.world.addContactMaterial(defaultContact);
    
    // Set default material for the world
    this.world.defaultContactMaterial.friction = 0.3;
    this.world.defaultContactMaterial.restitution = 0.2;
  }

  /**
   * Add a ground plane to the physics world
   * @param size Width and depth of the plane
   * @param position Position of the plane
   * @returns The created Cannon.js body
   */
  addGroundPlane(size: { width: number; depth: number }, position: CANNON.Vec3): CANNON.Body {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      type: CANNON.BODY_TYPES.STATIC,
      shape: groundShape,
      position: position,
      material: new CANNON.Material('ground')
    });
    
    // Rotate the ground plane to be horizontal (facing up)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    
    // Store reference to ground
    this.groundBody = groundBody;
    
    // Add the ground to the world
    this.world.addBody(groundBody);
    console.log("Ground plane added:", {
      size,
      position: groundBody.position,
      rotation: groundBody.quaternion
    });
    return groundBody;
  }

  /**
   * Creates a car body in the physics world
   * @param dimensions Car dimensions (width, height, length)
   * @param position Initial position
   * @param mesh Three.js mesh to link with the physics body
   * @returns The created Cannon.js body
   */
  createCarBody(
    dimensions: { width: number, height: number, length: number },
    position: CANNON.Vec3,
    mesh: THREE.Object3D
  ): CANNON.Body {
    // Create a box shape for the car
    const carShape = new CANNON.Box(new CANNON.Vec3(
      dimensions.width / 2,
      dimensions.height / 2,
      dimensions.length / 2
    ));
    
    // Car material
    const carMaterial = new CANNON.Material('car');
    carShape.material = carMaterial;
    
    // Create the car body with higher mass to improve stability
    const carBody = new CANNON.Body({
      mass: 1000, // Reduced from 1500 for more responsive handling
      position: position,
      material: carMaterial,
      // Add damping to prevent excessive bouncing and improve control
      linearDamping: 0.3, // Reduced from 0.4
      angularDamping: 0.4  // Reduced from 0.6
    });
    
    // Add the shape to the body
    carBody.addShape(carShape);
    
    // Lower center of mass for better stability
    carBody.shapeOffsets[0].set(0, -0.1, 0);
    
    // Set car body properties
    carBody.allowSleep = false; // Cars should never sleep
    
    // Tweak inertia for better handling
    const inertia = carBody.inertia;
    carBody.inertia.set(
      inertia.x * 1.2, // More resistance to roll
      inertia.y,       // Keep original yaw inertia
      inertia.z * 1.2  // More resistance to pitch
    );
    carBody.updateMassProperties();
    
    // Add the body to the world
    this.world.addBody(carBody);
    
    // Map the Three.js mesh to the Cannon.js body for syncing
    this.bodies.set(mesh, carBody);
    
    console.log("Car body created:", {
      dimensions,
      position: carBody.position,
      mass: carBody.mass,
      inertia: carBody.inertia
    });
    
    return carBody;
  }

  /**
   * Add an external body to the physics world (for obstacles, etc.)
   * @param body The CANNON.js body to add
   * @returns The added body
   */
  addExternalBody(body: CANNON.Body): CANNON.Body {
    this.world.addBody(body);
    this.externalBodies.push(body);
    return body;
  }

  /**
   * Updates the physics world and syncs the Three.js meshes with their physics bodies
   */
  update() {
    // Step the physics world
    this.world.step(this.timeStep);
    
    // Update positions and rotations of all Three.js objects
    this.bodies.forEach((body, mesh) => {
      // Update position
      mesh.position.copy(
        new THREE.Vector3(body.position.x, body.position.y, body.position.z)
      );
      
      // Update rotation
      mesh.quaternion.copy(
        new THREE.Quaternion(
          body.quaternion.x,
          body.quaternion.y,
          body.quaternion.z,
          body.quaternion.w
        )
      );
    });
  }

  /**
   * Applies forces to a car body for movement
   * @param carBody The car physics body
   * @param forces Object containing the forces to apply
   */
  applyCarForces(carBody: CANNON.Body, forces: {
    acceleration: number,
    braking: number,
    steering: number
  }) {
    const {acceleration, braking, steering} = forces;
    
    // Get current velocity and car orientation
    const currentVelocity = carBody.velocity.length();
    const maxSpeed = 30; // Maximum speed in m/s (about 108 km/h)
    const speedFactor = Math.max(0, 1 - (currentVelocity / maxSpeed));
    
    // Calculate final force with speed limiting
    let finalForce = 0;
    if (acceleration > 0) {
      // Apply acceleration with speed limiting
      finalForce = acceleration * speedFactor;
    } else if (braking > 0) {
      // Braking force increases with speed
      finalForce = -braking * (currentVelocity / maxSpeed + 0.2);
    }
    
    // Apply forward/backward force in local space
    if (finalForce !== 0) {
      const force = new CANNON.Vec3(0, 0, finalForce);
      carBody.applyLocalForce(force, new CANNON.Vec3(0, 0, 0));
    }
    
    // Apply steering torque (in car's local Y axis)
    if (steering !== 0) {
      // Apply steering based on speed - less steering at high speeds
      const steeringFactor = Math.max(0.2, 1 - (currentVelocity / maxSpeed * 0.8));
      const steeringAmount = steering * steeringFactor;
      
      // Apply steering torque in world space
      const steeringTorque = new CANNON.Vec3(0, steeringAmount, 0);
      carBody.quaternion.vmult(steeringTorque, steeringTorque);
      carBody.applyTorque(steeringTorque);
    }
    
    // Apply artificial gravity to keep the car grounded
    const artificialGravity = new CANNON.Vec3(0, -50, 0);
    carBody.applyForce(artificialGravity, carBody.position);
    
    // Apply stabilizing torque to keep car upright
    const upVector = new CANNON.Vec3(0, 1, 0);
    const carUp = new CANNON.Vec3(0, 1, 0);
    carBody.quaternion.vmult(carUp, carUp);
    
    // Calculate the axis of rotation needed to align car.up with world.up
    const stabilizationTorque = new CANNON.Vec3();
    upVector.cross(carUp, stabilizationTorque);
    stabilizationTorque.scale(50, stabilizationTorque); // Strong stabilization
    
    carBody.applyTorque(stabilizationTorque);
    
    // Apply damping to rotation around X and Z axes to prevent somersaults
    carBody.angularVelocity.x *= 0.9;
    carBody.angularVelocity.z *= 0.9;
  }

  /**
   * Checks collision between two bodies
   * @param bodyA First body
   * @param bodyB Second body
   * @returns Boolean indicating if the bodies are colliding
   */
  checkCollision(bodyA: CANNON.Body, bodyB: CANNON.Body): boolean {
    // Get all contacts in the world
    for (let i = 0; i < this.world.contacts.length; i++) {
      const contact = this.world.contacts[i];
      
      // Check if the contact involves our two bodies
      if (
        (contact.bi === bodyA && contact.bj === bodyB) ||
        (contact.bi === bodyB && contact.bj === bodyA)
      ) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if a body is the ground
   * @param body The body to check
   * @returns Boolean indicating if the body is the ground
   */
  isGroundBody(body: CANNON.Body): boolean {
    return this.groundBody === body;
  }
} 