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

  constructor() {
    // Initialize the Cannon.js world
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0) // Earth's gravity
    });
    
    // Set up default world settings
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
  }

  /**
   * Add a ground plane to the physics world
   * @param size Width and depth of the plane
   * @param position Position of the plane
   * @returns The created Cannon.js body
   */
  addGroundPlane(size: { width: number, depth: number }, position: CANNON.Vec3): CANNON.Body {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      type: CANNON.BODY_TYPES.STATIC,
      shape: groundShape,
      position: position
    });
    
    // Rotate the ground plane to be horizontal (facing up)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    
    this.world.addBody(groundBody);
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
    
    // Create the car body
    const carBody = new CANNON.Body({
      mass: 1500, // 1500 kg, typical car mass
      position: position,
      shape: carShape
    });
    
    // Add the body to the world
    this.world.addBody(carBody);
    
    // Map the Three.js mesh to the Cannon.js body for syncing
    this.bodies.set(mesh, carBody);
    
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
    
    // Apply forward/backward force
    const forceDirection = new CANNON.Vec3(0, 0, acceleration - braking);
    const worldForce = carBody.quaternion.vmult(forceDirection);
    carBody.applyForce(worldForce, carBody.position);
    
    // Apply steering as a torque around the Y axis
    const steeringTorque = new CANNON.Vec3(0, steering, 0);
    carBody.applyTorque(steeringTorque);
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
} 