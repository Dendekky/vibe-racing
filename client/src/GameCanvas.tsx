import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from './lib/physics';
import { Car, RaceStatus } from './lib/car';
import { Controls } from './lib/controls';
import { TERRAINS, createTerrainModel } from './lib/models/terrains';

interface GameCanvasProps {
  terrainName?: string; // Optional terrain name parameter
}

const GameCanvas: React.FC<GameCanvasProps> = ({ terrainName = 'monaco' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [health, setHealth] = useState<number>(100);
  const [raceStatus, setRaceStatus] = useState<RaceStatus>({
    raceStarted: false,
    raceFinished: false,
    raceTime: 0
  });
  const [showRestartModal, setShowRestartModal] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<{
    position: string;
    velocity: string;
    controls: string;
    forces: string;
  }>({
    position: "0,0,0",
    velocity: "0,0,0",
    controls: "none",
    forces: "0,0,0"
  });
  
  // Reference to car for restart function
  const carRef = useRef<Car | null>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Get terrain config (default to Monaco if not found)
    const terrainConfig = TERRAINS[terrainName] || TERRAINS.monaco;
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(terrainConfig.skyColor);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    camera.position.set(0, 5, 10);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    
    // Initialize physics
    const physics = new PhysicsWorld();
    
    // Create terrain model
    const terrain = createTerrainModel(terrainConfig);
    scene.add(terrain);
    
    // Add ground plane physics (simplified flat version for physics)
    const groundSize = terrainConfig.size;
    physics.addGroundPlane(groundSize, new CANNON.Vec3(0, 0, 0));
    
    // Create car with a color based on terrain (just for fun)
    const carColors = {
      monaco: 0xff0000, // Red
      alpines: 0x0088ff, // Blue
      dubai: 0xffcc00, // Yellow
      baku: 0x00cc66, // Green
      shanghai: 0xff5500 // Orange
    };
    const carColor = carColors[terrainName as keyof typeof carColors] || 0xff0000;
    
    // Position the car a bit above the start position
    const startPos = terrainConfig.startPosition.clone();
    startPos.y = 5; // Higher starting position to avoid collision
    
    // Create car with start and finish positions
    const car = new Car(
      startPos,
      physics,
      carColor,
      terrainConfig.startPosition,
      terrainConfig.finishPosition
    );
    scene.add(car.mesh);
    carRef.current = car;
    
    // Log car and physics details for debugging
    console.log("Car created:", {
      position: car.mesh.position,
      physicsBody: car.body,
      mass: car.body.mass,
      type: car.body.type
    });
    
    // Initialize controls
    const controls = new Controls();
    console.log("Controls initialized");
    
    // Add a helper visual to see the car's position and orientation
    const axesHelper = new THREE.AxesHelper(5);
    car.mesh.add(axesHelper);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    
    // Set up shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // For tracking time between frames
    let lastTime = 0;
    
    // Camera follow settings
    const cameraOffset = new THREE.Vector3(0, 3, 8);
    const cameraLookOffset = new THREE.Vector3(0, 0, -5);
    
    // Create a visual helper for the ground plane
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);
    
    // Animation loop
    const animate = (time: number) => {
      requestAnimationFrame(animate);
      
      // Calculate delta time in seconds
      const deltaTime = lastTime === 0 ? 0 : (time - lastTime) / 1000;
      lastTime = time;
      
      // Skip first frame
      if (deltaTime === 0) return;
      
      // Update controls
      controls.update();
      
      // Get and log control state for debugging
      const inputState = controls.getInputState();
      
      // Apply controls to car
      car.applyControls(inputState, physics);
      
      // Update car state
      car.update(deltaTime);
      
      // Update race status in React state
      setRaceStatus(car.raceStatus);
      
      // Show restart modal when race is finished
      if (car.raceStatus.raceFinished && !showRestartModal) {
        setShowRestartModal(true);
      }
      
      // Update physics world
      physics.update();
      
      // Update health state
      setHealth(car.health);
      
      // Update debug info
      setDebugInfo({
        position: `x:${car.mesh.position.x.toFixed(2)}, y:${car.mesh.position.y.toFixed(2)}, z:${car.mesh.position.z.toFixed(2)}`,
        velocity: `x:${car.body.velocity.x.toFixed(2)}, y:${car.body.velocity.y.toFixed(2)}, z:${car.body.velocity.z.toFixed(2)}`,
        controls: `fwd:${inputState.forward}, back:${inputState.backward}, left:${inputState.left}, right:${inputState.right}, nitro:${inputState.nitro}`,
        forces: `acc:${car.acceleration.toFixed(0)}, brake:${car.braking.toFixed(0)}, steer:${car.steering.toFixed(0)}`
      });
      
      // Log car movement if it changes
      if (Math.abs(car.body.velocity.x) > 0.1 || 
          Math.abs(car.body.velocity.y) > 0.1 || 
          Math.abs(car.body.velocity.z) > 0.1) {
        console.log("Car is moving:", car.body.velocity);
      }
      
      // Update camera position to follow car
      const carPosition = car.mesh.position.clone();
      const camPosition = carPosition.clone().add(cameraOffset);
      camera.position.copy(camPosition);
      
      // Calculate look target
      const lookTarget = carPosition.clone().add(cameraLookOffset);
      camera.lookAt(lookTarget);
      
      renderer.render(scene, camera);
    };
    
    animate(0);
    
    // Handle keyboard events directly for debugging
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("Key pressed:", e.key);
      
      // 'R' key to teleport back to start
      if (e.key.toLowerCase() === 'r' && !car.raceStatus.raceStarted) {
        const teleportPos = terrainConfig.startPosition.clone();
        teleportPos.y = 3; // Slightly above ground
        car.teleportTo(teleportPos);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      terrain.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });
      
      // Dispose controls
      controls.dispose();
      
      // Dispose car
      car.dispose();
    };
  }, [terrainName, showRestartModal]);
  
  // Function to handle race restart
  const handleRestartRace = () => {
    if (carRef.current) {
      // Reset race status
      carRef.current.resetRace();
      
      // Teleport car back to start position
      const startPos = TERRAINS[terrainName].startPosition.clone();
      startPos.y = 3; // Slightly above ground
      carRef.current.teleportTo(startPos);
      
      // Close the modal
      setShowRestartModal(false);
    }
  };
  
  return (
    <>
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
      
      {/* Game HUD - Health and Debug Info */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          background: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white',
          width: '300px'
        }}
      >
        <div>Health: {health}%</div>
        <div style={{ 
          width: '200px', 
          height: '20px', 
          background: '#333',
          borderRadius: '5px',
          overflow: 'hidden',
          marginTop: '5px'
        }}>
          <div style={{ 
            width: `${health}%`, 
            height: '100%', 
            background: health > 50 ? '#4CAF50' : health > 25 ? '#FFC107' : '#F44336',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        {/* Race status display */}
        <div style={{ marginTop: '10px' }}>
          <div>
            <strong>RACE STATUS:</strong> {
              raceStatus.raceFinished ? 'FINISHED' : 
              raceStatus.raceStarted ? 'RACING' : 
              'NOT STARTED'
            }
          </div>
          
          {raceStatus.raceStarted && (
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              fontFamily: 'monospace' 
            }}>
              {raceStatus.raceTime.toFixed(2)}s
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '10px', fontSize: '12px' }}>
          <div><strong>DEBUG INFO:</strong></div>
          <div>Position: {debugInfo.position}</div>
          <div>Velocity: {debugInfo.velocity}</div>
          <div>Controls: {debugInfo.controls}</div>
          <div>Forces: {debugInfo.forces}</div>
          <div style={{ marginTop: '5px', fontSize: '10px' }}>
            Controls: WASD or Arrow Keys, Space for nitro
          </div>
        </div>
      </div>
      
      {/* Race completion modal */}
      {showRestartModal && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.85)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          width: '400px',
          textAlign: 'center',
          zIndex: 100
        }}>
          <h2>Race Completed!</h2>
          <p style={{ fontSize: '24px' }}>Your time: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{raceStatus.raceTime.toFixed(2)}s</span></p>
          <button 
            onClick={handleRestartRace}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Restart Race
          </button>
        </div>
      )}
    </>
  );
};

export default GameCanvas; 