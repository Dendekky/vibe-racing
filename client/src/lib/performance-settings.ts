import * as THREE from 'three';

export interface PerformanceSettings {
  shadowQuality: 'low' | 'medium' | 'high';
  antialiasing: boolean;
  terrainDetail: 'low' | 'medium' | 'high';
  particleEffects: boolean;
  drawDistance: number;
  fpsTarget: number;
}

export const DEFAULT_SETTINGS: PerformanceSettings = {
  shadowQuality: 'high',
  antialiasing: true,
  terrainDetail: 'high',
  particleEffects: true,
  drawDistance: 1000,
  fpsTarget: 60
};

export const LOW_END_SETTINGS: PerformanceSettings = {
  shadowQuality: 'low',
  antialiasing: false,
  terrainDetail: 'low',
  particleEffects: false,
  drawDistance: 500,
  fpsTarget: 30
};

export class PerformanceManager {
  private settings: PerformanceSettings;
  private renderer: THREE.WebGLRenderer;
  private terrain: THREE.Object3D;

  constructor(renderer: THREE.WebGLRenderer, terrain: THREE.Object3D) {
    this.renderer = renderer;
    this.terrain = terrain;
    this.settings = this.detectHardwareCapabilities();
    this.applySettings();
  }

  private detectHardwareCapabilities(): PerformanceSettings {
    // Check if running on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for WebGL support and capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const hasWebGL2 = !!canvas.getContext('webgl2');
    
    // Check for high DPI display
    const hasHighDPI = window.devicePixelRatio > 1;
    
    // Check for dedicated GPU
    const hasDedicatedGPU = this.checkForDedicatedGPU();
    
    // Determine settings based on hardware
    if (isMobile || !hasWebGL2 || !hasDedicatedGPU) {
      return LOW_END_SETTINGS;
    }
    
    return DEFAULT_SETTINGS;
  }

  private checkForDedicatedGPU(): boolean {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return false;
    
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return !renderer.toLowerCase().includes('intel');
  }

  private applySettings() {
    // Apply shadow quality
    switch (this.settings.shadowQuality) {
      case 'low':
        this.renderer.shadowMap.enabled = false;
        break;
      case 'medium':
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        break;
      case 'high':
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        break;
    }

    // Apply antialiasing
    this.renderer.setPixelRatio(this.settings.antialiasing ? window.devicePixelRatio : 1);

    // Apply terrain detail
    this.updateTerrainDetail();

    // Apply draw distance
    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight,
      false
    );
  }

  private updateTerrainDetail() {
    this.terrain.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const geometry = object.geometry;
        if (geometry) {
          switch (this.settings.terrainDetail) {
            case 'low':
              geometry.setDrawRange(0, geometry.attributes.position.count / 4);
              break;
            case 'medium':
              geometry.setDrawRange(0, geometry.attributes.position.count / 2);
              break;
            case 'high':
              geometry.setDrawRange(0, geometry.attributes.position.count);
              break;
          }
        }
      }
    });
  }

  getSettings(): PerformanceSettings {
    return this.settings;
  }

  updateSettings(newSettings: Partial<PerformanceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
  }
} 