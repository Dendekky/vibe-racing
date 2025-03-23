import * as THREE from 'three';

/**
 * Creates a car mesh with detailed geometry
 * @param color The color of the car
 * @returns The car mesh
 */
export function createCarModel(color: number = 0xff0000): THREE.Group {
  // Create a group to hold all car components
  const carGroup = new THREE.Group();
  
  // Car dimensions
  const chassisWidth = 2;
  const chassisHeight = 0.6;
  const chassisLength = 4;
  
  // Create car chassis (main body)
  const chassisGeometry = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisLength);
  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.5,
    roughness: 0.2
  });
  const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
  chassis.position.y = 0.4; // Lift off the ground a bit
  chassis.castShadow = true;
  carGroup.add(chassis);
  
  // Add cabin/windshield
  const cabinGeometry = new THREE.BoxGeometry(1.7, 0.6, 1.5);
  const cabinMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.7
  });
  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.position.set(0, 0.9, -0.2); // Position on top of the chassis, slightly to the front
  cabin.castShadow = true;
  carGroup.add(cabin);
  
  // Create wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8
  });
  
  // Position wheels at the four corners
  const wheelPositions = [
    { x: -0.9, y: 0.4, z: -1.3 }, // Front left
    { x: 0.9, y: 0.4, z: -1.3 },  // Front right
    { x: -0.9, y: 0.4, z: 1.3 },  // Rear left
    { x: 0.9, y: 0.4, z: 1.3 }    // Rear right
  ];
  
  wheelPositions.forEach(position => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(position.x, position.y, position.z);
    wheel.rotation.x = Math.PI / 2; // Rotate to correct orientation
    wheel.castShadow = true;
    carGroup.add(wheel);
  });
  
  // Add headlights
  const headlightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    emissive: 0xffffcc,
    emissiveIntensity: 1
  });
  
  // Front headlights
  const headlightPositions = [
    { x: -0.7, y: 0.4, z: -2 }, // Left
    { x: 0.7, y: 0.4, z: -2 }   // Right
  ];
  
  headlightPositions.forEach(position => {
    const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight.position.set(position.x, position.y, position.z);
    carGroup.add(headlight);
  });
  
  // Add taillights
  const taillightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const taillightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 1
  });
  
  // Rear taillights
  const taillightPositions = [
    { x: -0.7, y: 0.4, z: 2 }, // Left
    { x: 0.7, y: 0.4, z: 2 }   // Right
  ];
  
  taillightPositions.forEach(position => {
    const taillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    taillight.position.set(position.x, position.y, position.z);
    carGroup.add(taillight);
  });
  
  // Set the whole car to cast and receive shadows
  carGroup.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return carGroup;
} 