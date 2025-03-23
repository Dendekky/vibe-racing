/**
 * Manages keyboard and gamepad inputs for the game
 */
export class Controls {
  // Keyboard state
  private keys: {
    [key: string]: boolean
  } = {};
  
  // Gamepad state
  private gamepad: Gamepad | null = null;
  private gamepadConnected: boolean = false;
  
  // Input state
  public forward: boolean = false;
  public backward: boolean = false;
  public left: boolean = false;
  public right: boolean = false;
  public nitro: boolean = false;
  
  // Event handler references for proper cleanup
  private keydownHandler: (event: KeyboardEvent) => void;
  private keyupHandler: (event: KeyboardEvent) => void;
  private gamepadConnectedHandler: (event: GamepadEvent) => void;
  private gamepadDisconnectedHandler: (event: GamepadEvent) => void;
  
  constructor() {
    // Create bound handlers (important for proper removal later)
    this.keydownHandler = this.handleKeyDown.bind(this);
    this.keyupHandler = this.handleKeyUp.bind(this);
    this.gamepadConnectedHandler = this.handleGamepadConnected.bind(this);
    this.gamepadDisconnectedHandler = this.handleGamepadDisconnected.bind(this);
    
    // Initialize keyboard listeners
    this.initKeyboard();
    
    // Initialize gamepad listeners
    this.initGamepad();
    
    console.log("Controls constructor called, event listeners set up");
  }
  
  /**
   * Set up keyboard event listeners
   */
  private initKeyboard() {
    // Key down event
    window.addEventListener('keydown', this.keydownHandler);
    
    // Key up event
    window.addEventListener('keyup', this.keyupHandler);
  }
  
  /**
   * Set up gamepad event listeners
   */
  private initGamepad() {
    // Gamepad connected
    window.addEventListener('gamepadconnected', this.gamepadConnectedHandler);
    
    // Gamepad disconnected
    window.addEventListener('gamepaddisconnected', this.gamepadDisconnectedHandler);
  }
  
  /**
   * Update the control state based on current input
   */
  update() {
    // Reset state
    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;
    this.nitro = false;
    
    // Update keyboard input
    this.updateKeyboardInput();
    
    // Update gamepad input if connected
    if (this.gamepadConnected) {
      this.updateGamepadInput();
    }
  }
  
  /**
   * Update control state based on keyboard input
   */
  private updateKeyboardInput() {
    // Forward: W or Up Arrow
    this.forward = Boolean(this.keys['w'] || this.keys['arrowup']);
    
    // Backward: S or Down Arrow
    this.backward = Boolean(this.keys['s'] || this.keys['arrowdown']);
    
    // Left: A or Left Arrow
    this.left = Boolean(this.keys['a'] || this.keys['arrowleft']);
    
    // Right: D or Right Arrow
    this.right = Boolean(this.keys['d'] || this.keys['arrowright']);
    
    // Nitro: Spacebar
    this.nitro = Boolean(this.keys[' ']);
    
    // Log active controls
    if (this.forward || this.backward || this.left || this.right || this.nitro) {
      console.log("Active controls:", {
        forward: this.forward,
        backward: this.backward,
        left: this.left,
        right: this.right,
        nitro: this.nitro,
        rawKeys: this.keys
      });
    }
  }
  
  /**
   * Update control state based on gamepad input
   */
  private updateGamepadInput() {
    if (!this.gamepad) {
      // Try to get the current gamepad state
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          this.gamepad = gamepads[i];
          break;
        }
      }
      
      if (!this.gamepad) return;
    }
    
    // Left stick for steering
    const leftStickX = this.gamepad.axes[0];
    if (Math.abs(leftStickX) > 0.1) { // Add a small deadzone
      this.left = leftStickX < -0.1;
      this.right = leftStickX > 0.1;
    }
    
    // Right trigger for acceleration (axis 2 on most gamepads)
    const rightTrigger = this.gamepad.buttons[7]?.value || 0;
    this.forward = rightTrigger > 0.1;
    
    // Left trigger for braking (axis 3 on most gamepads)
    const leftTrigger = this.gamepad.buttons[6]?.value || 0;
    this.backward = leftTrigger > 0.1;
    
    // A/X button for nitro (button 0 on most gamepads)
    this.nitro = this.gamepad.buttons[0]?.pressed || false;
  }
  
  /**
   * Get the current control state
   */
  getInputState() {
    return {
      forward: this.forward,
      backward: this.backward,
      left: this.left,
      right: this.right,
      nitro: this.nitro
    };
  }
  
  /**
   * Clean up event listeners
   */
  dispose() {
    // Remove event listeners explicitly
    window.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('keyup', this.keyupHandler);
    window.removeEventListener('gamepadconnected', this.gamepadConnectedHandler);
    window.removeEventListener('gamepaddisconnected', this.gamepadDisconnectedHandler);
    
    console.log("Controls disposed, event listeners removed");
  }
  
  // Explicit handler functions
  private handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    console.log(`Key down: ${key}`);
    this.keys[key] = true;
    
    // Special case for arrow keys which might have different implementations
    if (event.code === 'ArrowUp') this.keys['arrowup'] = true;
    if (event.code === 'ArrowDown') this.keys['arrowdown'] = true;
    if (event.code === 'ArrowLeft') this.keys['arrowleft'] = true;
    if (event.code === 'ArrowRight') this.keys['arrowright'] = true;
  }
  
  private handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    console.log(`Key up: ${key}`);
    this.keys[key] = false;
    
    // Special case for arrow keys
    if (event.code === 'ArrowUp') this.keys['arrowup'] = false;
    if (event.code === 'ArrowDown') this.keys['arrowdown'] = false;
    if (event.code === 'ArrowLeft') this.keys['arrowleft'] = false;
    if (event.code === 'ArrowRight') this.keys['arrowright'] = false;
  }
  
  private handleGamepadConnected(event: GamepadEvent) {
    this.gamepad = navigator.getGamepads()[event.gamepad.index];
    this.gamepadConnected = true;
    console.log('Gamepad connected:', this.gamepad?.id);
  }
  
  private handleGamepadDisconnected(event: GamepadEvent) {
    this.gamepad = null;
    this.gamepadConnected = false;
    console.log('Gamepad disconnected');
  }
} 