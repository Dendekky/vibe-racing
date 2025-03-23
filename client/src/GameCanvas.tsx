import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from './lib/physics';
import { Car } from './lib/car';
import { Controls } from './lib/controls';
import { TERRAINS, createTerrainModel } from './lib/models/terrains';

interface GameCanvasProps {
  terrainName?: string; // Optional terrain name parameter
}

const GameCanvas: React.FC<GameCanvasProps> = ({ terrainName = 'monaco' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [health, setHealth] = useState<number>(100);
  
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
    
    const car = new Car(new THREE.Vector3(0, 1, 0), physics, carColor);
    scene.add(car.mesh);
    
    // Initialize controls
    const controls = new Controls();
    
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
      
      // Apply controls to car
      car.applyControls(controls.getInputState(), physics);
      
      // Update car state
      car.update(deltaTime);
      
      // Update physics world
      physics.update();
      
      // Update health state
      setHealth(car.health);
      
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
  }, [terrainName]);
  
  return (
    <>
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
      <div 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          background: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white'
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
      </div>
    </>
  );
};

export default GameCanvas; 