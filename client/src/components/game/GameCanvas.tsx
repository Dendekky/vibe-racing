import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../../lib/physics';
import { Car, RaceStatus } from '../../lib/car';
import { Controls } from '../../lib/controls';
import { TERRAINS, createTerrainModel } from '../../lib/models/terrains';
import { Minimap } from '../../lib/minimap';
import { PerformanceManager } from '../../lib/performance-settings';
import { HUD } from '../ui/HUD';
import styles from './GameCanvas.module.css';

interface GameCanvasProps {
  terrainName?: string; // Optional terrain name parameter
}

const GameCanvas: React.FC<GameCanvasProps> = ({ terrainName = 'dubai' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const minimapContainerRef = useRef<HTMLDivElement>(null);
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
  const minimapInstanceRef = useRef<Minimap | null>(null);
  const performanceManagerRef = useRef<PerformanceManager | null>(null);
  
  useEffect(() => {
    if (!mountRef.current || !minimapContainerRef.current) return;
    
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
    startPos.y = 1; // Lower starting position to be closer to ground
    
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
    
    // Initialize minimap
    const minimap = new Minimap(minimapContainerRef.current);
    minimap.setTerrain(terrain);
    minimap.setCar(car.mesh);
    minimapInstanceRef.current = minimap;
    
    // Initialize performance manager
    const performanceManager = new PerformanceManager(renderer, terrain);
    performanceManagerRef.current = performanceManager;
    
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
      // Only log if any input is active
      if (inputState.forward || inputState.backward || inputState.left || inputState.right || inputState.nitro) {
        console.log("Current input state:", inputState);
      }
      
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
      
      // Update minimap
      if (minimapInstanceRef.current) {
        minimapInstanceRef.current.update();
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
      // Ctrl+Shift+D for auto-drive
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        if (carRef.current) {
          carRef.current.startAutoDrive();
        }
      }
      
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
      
      // Update minimap size
      if (minimapInstanceRef.current) {
        minimapInstanceRef.current.resize(200); // Keep minimap at fixed size
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      if (minimapInstanceRef.current) {
        minimapInstanceRef.current.dispose();
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
  }, [terrainName]);
  
  // Function to handle race restart
  const handleRestartRace = () => {
    if (carRef.current) {
      // Reset race status and teleport back to start
      const startPos = TERRAINS[terrainName].startPosition.clone();
      startPos.y = 3; // Slightly above ground
      carRef.current.teleportTo(startPos);
      carRef.current.resetRace();
      setShowRestartModal(false);
    }
  };
  
  return (
    <div className={styles.gameContainer}>
      <div ref={mountRef} className={styles.canvas} />
      <div ref={minimapContainerRef} className={styles.minimap} />
      <HUD 
        health={carRef.current?.health || 100}
        isDisabled={carRef.current?.isDisabled || false}
        disableTimeRemaining={carRef.current?.disableTimer || 0}
      />
      
      {/* Game HUD - Health and Debug Info */}
      <div className={styles.debugInfo}>
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
        <div className={styles.restartModal}>
          <h2>Race Finished!</h2>
          <p style={{ fontSize: '24px' }}>Time: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{raceStatus.raceTime.toFixed(2)}s</span></p>
          <button onClick={handleRestartRace}>
            Restart Race
          </button>
        </div>
      )}
    </div>
  );
};

export default GameCanvas; 