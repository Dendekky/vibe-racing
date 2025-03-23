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
  
  constructor() {
    // Initialize keyboard listeners
    this.initKeyboard();
    
    // Initialize gamepad listeners
    this.initGamepad();
  }
  
  /**
   * Set up keyboard event listeners
   */
  private initKeyboard() {
    // Key down event
    window.addEventListener('keydown', (event) => {
      this.keys[event.key.toLowerCase()] = true;
    });
    
    // Key up event
    window.addEventListener('keyup', (event) => {
      this.keys[event.key.toLowerCase()] = false;
    });
  }
  
  /**
   * Set up gamepad event listeners
   */
  private initGamepad() {
    // Gamepad connected
    window.addEventListener('gamepadconnected', (event) => {
      this.gamepad = navigator.getGamepads()[event.gamepad.index];
      this.gamepadConnected = true;
      console.log('Gamepad connected:', this.gamepad?.id);
    });
    
    // Gamepad disconnected
    window.addEventListener('gamepaddisconnected', (event) => {
      this.gamepad = null;
      this.gamepadConnected = false;
      console.log('Gamepad disconnected');
    });
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
    this.forward = this.keys['w'] || this.keys['arrowup'] || false;
    
    // Backward: S or Down Arrow
    this.backward = this.keys['s'] || this.keys['arrowdown'] || false;
    
    // Left: A or Left Arrow
    this.left = this.keys['a'] || this.keys['arrowleft'] || false;
    
    // Right: D or Right Arrow
    this.right = this.keys['d'] || this.keys['arrowright'] || false;
    
    // Nitro: Spacebar
    this.nitro = this.keys[' '] || false;
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
    // Remove event listeners (if needed)
    // Typically browsers will clean these up when the page is unloaded
  }
} 