import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameCanvas from '../src/GameCanvas';

// Mock Three.js since it uses browser APIs that aren't available in Jest
jest.mock('three', () => {
  return {
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      background: null,
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn(),
      aspect: 0,
      updateProjectionMatrix: jest.fn(),
    })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      render: jest.fn(),
      domElement: document.createElement('canvas'),
    })),
    BoxGeometry: jest.fn().mockImplementation(() => ({
      dispose: jest.fn(),
    })),
    PlaneGeometry: jest.fn().mockImplementation(() => ({
      dispose: jest.fn(),
    })),
    MeshStandardMaterial: jest.fn().mockImplementation(() => ({
      dispose: jest.fn(),
    })),
    Mesh: jest.fn().mockImplementation(() => ({
      rotation: { x: 0, y: 0 },
    })),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
    })),
    Color: jest.fn(),
    DoubleSide: 0,
  };
});

describe('GameCanvas component', () => {
  test('renders without crashing', () => {
    const { container } = render(<GameCanvas />);
    expect(container).toBeInTheDocument();
  });
}); 