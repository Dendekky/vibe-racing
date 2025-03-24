/// <reference types="jest" />

import { Controls } from '../src/lib/controls';

describe('Controls', () => {
  let controls: Controls;
  
  beforeEach(() => {
    controls = new Controls();
  });
  
  afterEach(() => {
    controls.dispose();
  });
  
  test('should initialize with default state', () => {
    const state = controls.getInputState();
    expect(state).toEqual({
      forward: false,
      backward: false,
      left: false,
      right: false,
      nitro: false
    });
  });
  
  test('should handle keyboard input', () => {
    // Simulate key down events
    const keyDownEvent = new KeyboardEvent('keydown', {
      key: 'w',
      code: 'KeyW'
    });
    window.dispatchEvent(keyDownEvent);
    
    // Update controls
    controls.update();
    
    // Check state
    const state = controls.getInputState();
    expect(state.forward).toBe(true);
    
    // Simulate key up event
    const keyUpEvent = new KeyboardEvent('keyup', {
      key: 'w',
      code: 'KeyW'
    });
    window.dispatchEvent(keyUpEvent);
    
    // Update controls
    controls.update();
    
    // Check state
    const updatedState = controls.getInputState();
    expect(updatedState.forward).toBe(false);
  });
  
  test('should handle arrow key input', () => {
    // Simulate arrow key down events
    const keyDownEvent = new KeyboardEvent('keydown', {
      code: 'ArrowUp'
    });
    window.dispatchEvent(keyDownEvent);
    
    // Update controls
    controls.update();
    
    // Check state
    const state = controls.getInputState();
    expect(state.forward).toBe(true);
    
    // Simulate arrow key up event
    const keyUpEvent = new KeyboardEvent('keyup', {
      code: 'ArrowUp'
    });
    window.dispatchEvent(keyUpEvent);
    
    // Update controls
    controls.update();
    
    // Check state
    const updatedState = controls.getInputState();
    expect(updatedState.forward).toBe(false);
  });
  
  test('should handle multiple key inputs', () => {
    // Simulate multiple key down events
    const keyDownEvents = [
      new KeyboardEvent('keydown', { key: 'w', code: 'KeyW' }),
      new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }),
      new KeyboardEvent('keydown', { key: ' ', code: 'Space' })
    ];
    
    keyDownEvents.forEach(event => window.dispatchEvent(event));
    
    // Update controls
    controls.update();
    
    // Check state
    const state = controls.getInputState();
    expect(state.forward).toBe(true);
    expect(state.left).toBe(true);
    expect(state.nitro).toBe(true);
  });
  
  test('should handle gamepad input', () => {
    // Mock gamepad
    const mockGamepad = {
      axes: [0, 0, 0, 0],
      buttons: [
        { pressed: true, value: 1 }, // A/X button pressed
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 }
      ],
      connected: true,
      id: 'Mock Gamepad',
      index: 0,
      mapping: 'standard',
      timestamp: Date.now(),
      vibrationActuator: null,
      hapticActuator: null,
      hapticActuators: []
    } as unknown as Gamepad;
    
    // Mock navigator.getGamepads
    Object.defineProperty(navigator, 'getGamepads', {
      value: () => [mockGamepad]
    });
    
    // Create a mutable copy of the gamepad for testing
    const testGamepad = {
      ...mockGamepad,
      axes: [...mockGamepad.axes],
      buttons: mockGamepad.buttons.map(btn => ({ ...btn }))
    };
    
    // Simulate gamepad connection
    const gamepadEvent = new GamepadEvent('gamepadconnected', {
      gamepad: testGamepad
    });
    window.dispatchEvent(gamepadEvent);
    
    // Update controls
    controls.update();
    
    // Check initial state
    const initialState = controls.getInputState();
    expect(initialState.forward).toBe(false);
    expect(initialState.left).toBe(false);
    expect(initialState.right).toBe(false);
    expect(initialState.nitro).toBe(false);
    
    // Simulate gamepad input
    testGamepad.axes[0] = 1; // Full right
    testGamepad.buttons[7].value = 1; // Full throttle
    
    // Update controls
    controls.update();
    
    // Check state
    const state = controls.getInputState();
    expect(state.right).toBe(true);
    expect(state.forward).toBe(true);
  });
  
  test('should handle gamepad disconnection', () => {
    // Mock gamepad
    const mockGamepad = {
      axes: [0, 0, 0, 0],
      buttons: [
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 }
      ],
      connected: true,
      id: 'Mock Gamepad',
      index: 0,
      mapping: 'standard',
      timestamp: Date.now(),
      vibrationActuator: null,
      hapticActuator: null,
      hapticActuators: []
    } as unknown as Gamepad;
    
    // Mock navigator.getGamepads
    Object.defineProperty(navigator, 'getGamepads', {
      value: () => [mockGamepad]
    });
    
    // Create a mutable copy for testing
    const testGamepad = {
      ...mockGamepad,
      axes: [...mockGamepad.axes],
      buttons: mockGamepad.buttons.map(btn => ({ ...btn }))
    };
    
    // Simulate gamepad connection
    const connectEvent = new GamepadEvent('gamepadconnected', {
      gamepad: testGamepad
    });
    window.dispatchEvent(connectEvent);
    
    // Simulate gamepad input
    testGamepad.axes[0] = 1;
    controls.update();
    
    // Check state with gamepad
    const stateWithGamepad = controls.getInputState();
    expect(stateWithGamepad.right).toBe(true);
    
    // Simulate gamepad disconnection
    const disconnectEvent = new GamepadEvent('gamepaddisconnected', {
      gamepad: testGamepad
    });
    window.dispatchEvent(disconnectEvent);
    
    // Update controls
    controls.update();
    
    // Check state after disconnection
    const stateAfterDisconnect = controls.getInputState();
    expect(stateAfterDisconnect.right).toBe(false);
  });
  
  test('should handle nitro boost input', () => {
    // Test keyboard nitro (spacebar)
    const spaceDownEvent = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space'
    });
    window.dispatchEvent(spaceDownEvent);
    controls.update();
    let state = controls.getInputState();
    expect(state.nitro).toBe(true);

    // Test gamepad nitro (A/X button)
    const mockGamepad = {
      axes: [0, 0, 0, 0],
      buttons: [
        { pressed: true, value: 1 }, // A/X button pressed
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 }
      ],
      connected: true,
      id: 'Mock Gamepad',
      index: 0,
      mapping: 'standard',
      timestamp: Date.now(),
      vibrationActuator: null,
      hapticActuator: null,
      hapticActuators: []
    } as unknown as Gamepad;

    Object.defineProperty(navigator, 'getGamepads', {
      value: () => [mockGamepad]
    });

    const gamepadEvent = new GamepadEvent('gamepadconnected', {
      gamepad: mockGamepad as Gamepad
    });
    window.dispatchEvent(gamepadEvent);
    controls.update();
    state = controls.getInputState();
    expect(state.nitro).toBe(true);
  });

  test('should handle gamepad deadzone correctly', () => {
    const mockGamepad = {
      axes: [0, 0, 0, 0],
      buttons: [
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 }
      ],
      connected: true,
      id: 'Mock Gamepad',
      index: 0,
      mapping: 'standard',
      timestamp: Date.now(),
      vibrationActuator: null,
      hapticActuator: null,
      hapticActuators: []
    } as unknown as Gamepad;

    Object.defineProperty(navigator, 'getGamepads', {
      value: () => [mockGamepad]
    });

    // Create a mutable copy for testing
    const testGamepad = {
      ...mockGamepad,
      axes: [...mockGamepad.axes],
      buttons: mockGamepad.buttons.map(btn => ({ ...btn }))
    };

    const gamepadEvent = new GamepadEvent('gamepadconnected', {
      gamepad: testGamepad
    });
    window.dispatchEvent(gamepadEvent);

    // Test below deadzone (0.1)
    testGamepad.axes[0] = 0.05;
    controls.update();
    let state = controls.getInputState();
    expect(state.left).toBe(false);
    expect(state.right).toBe(false);

    // Test above deadzone
    testGamepad.axes[0] = 0.15;
    controls.update();
    state = controls.getInputState();
    expect(state.right).toBe(true);
  });

  test('should handle all key combinations', () => {
    // Test WASD + arrow keys
    const keyDownEvents = [
      new KeyboardEvent('keydown', { key: 'w', code: 'KeyW' }),
      new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }),
      new KeyboardEvent('keydown', { key: 's', code: 'KeyS' }),
      new KeyboardEvent('keydown', { key: 'd', code: 'KeyD' }),
      new KeyboardEvent('keydown', { code: 'ArrowUp' }),
      new KeyboardEvent('keydown', { code: 'ArrowLeft' }),
      new KeyboardEvent('keydown', { code: 'ArrowDown' }),
      new KeyboardEvent('keydown', { code: 'ArrowRight' }),
      new KeyboardEvent('keydown', { key: ' ', code: 'Space' })
    ];

    keyDownEvents.forEach(event => window.dispatchEvent(event));
    controls.update();

    const state = controls.getInputState();
    expect(state.forward).toBe(true);
    expect(state.backward).toBe(true);
    expect(state.left).toBe(true);
    expect(state.right).toBe(true);
    expect(state.nitro).toBe(true);
  });
}); 