import * as THREE from 'three';

export class Minimap {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLDivElement;
  private size: number;
  private terrain: THREE.Object3D | null = null;
  private car: THREE.Object3D | null = null;

  constructor(container: HTMLDivElement, size: number = 200) {
    this.container = container;
    this.size = size;
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    
    // Create orthographic camera for top-down view
    const aspect = size / size;
    this.camera = new THREE.OrthographicCamera(
      -50, 50, // left, right
      50, -50, // top, bottom
      1, 1000 // near, far
    );
    this.camera.position.set(0, 100, 0);
    this.camera.lookAt(0, 0, 0);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(size, size);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 100, 0);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  setTerrain(terrain: THREE.Object3D) {
    this.terrain = terrain.clone();
    this.scene.add(this.terrain);
  }

  setCar(car: THREE.Object3D) {
    this.car = car.clone();
    this.scene.add(this.car);
  }

  update() {
    if (this.car && this.terrain) {
      // Update car position in minimap
      this.car.position.copy(this.car.position);
      this.car.rotation.y = this.car.rotation.y;
      
      // Render the scene
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize(size: number) {
    this.size = size;
    this.renderer.setSize(size, size);
  }

  dispose() {
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    
    // Dispose of Three.js resources
    if (this.terrain) {
      this.terrain.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });
    }
  }
} 