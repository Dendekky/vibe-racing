/**
 * Represents a car in the game with health and crash mechanics
 */
export class Car {
  // Health state
  private health: number = 100;
  private isDisabled: boolean = false;
  private disableTimer: number = 0;
  private readonly DISABLE_DURATION: number = 3000; // 3 seconds in milliseconds

  // Damage constants
  private readonly MINOR_BUMP_DAMAGE: number = 5;
  private readonly WALL_CRASH_DAMAGE: number = 10;
  private readonly HEAD_ON_CRASH_DAMAGE: number = 20;

  // Position and state
  private position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private velocity: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

  constructor() {
    console.log('Car initialized with 100% health');
  }

  /**
   * Update the car's state
   * @param deltaTime Time since last update in milliseconds
   */
  update(deltaTime: number): void {
    if (this.isDisabled) {
      this.disableTimer -= deltaTime;
      if (this.disableTimer <= 0) {
        this.repair();
      }
    }
  }

  /**
   * Apply damage to the car
   * @param damageType Type of damage to apply
   */
  applyDamage(damageType: 'minor' | 'wall' | 'headOn'): void {
    if (this.isDisabled) return;

    let damage: number;
    switch (damageType) {
      case 'minor':
        damage = this.MINOR_BUMP_DAMAGE;
        break;
      case 'wall':
        damage = this.WALL_CRASH_DAMAGE;
        break;
      case 'headOn':
        damage = this.HEAD_ON_CRASH_DAMAGE;
        break;
      default:
        damage = this.MINOR_BUMP_DAMAGE;
    }

    this.health = Math.max(0, this.health - damage);
    console.log(`Car took ${damage} damage. Health: ${this.health}%`);

    if (this.health <= 0) {
      this.disable();
    }
  }

  /**
   * Disable the car temporarily
   */
  private disable(): void {
    this.isDisabled = true;
    this.disableTimer = this.DISABLE_DURATION;
    this.velocity = { x: 0, y: 0, z: 0 };
    console.log('Car disabled for 3 seconds');
  }

  /**
   * Repair the car to full health
   */
  repair(): void {
    this.health = 100;
    this.isDisabled = false;
    this.disableTimer = 0;
    console.log('Car repaired to 100% health');
  }

  /**
   * Get the current health percentage
   */
  getHealth(): number {
    return this.health;
  }

  /**
   * Check if the car is currently disabled
   */
  isCarDisabled(): boolean {
    return this.isDisabled;
  }

  /**
   * Get the remaining disable time in milliseconds
   */
  getDisableTimeRemaining(): number {
    return this.disableTimer;
  }

  /**
   * Get the car's current position
   */
  getPosition(): { x: number; y: number; z: number } {
    return { ...this.position };
  }

  /**
   * Get the car's current rotation
   */
  getRotation(): { x: number; y: number; z: number } {
    return { ...this.rotation };
  }

  /**
   * Get the car's current velocity
   */
  getVelocity(): { x: number; y: number; z: number } {
    return { ...this.velocity };
  }

  /**
   * Set the car's position
   */
  setPosition(position: { x: number; y: number; z: number }): void {
    this.position = { ...position };
  }

  /**
   * Set the car's rotation
   */
  setRotation(rotation: { x: number; y: number; z: number }): void {
    this.rotation = { ...rotation };
  }

  /**
   * Set the car's velocity
   */
  setVelocity(velocity: { x: number; y: number; z: number }): void {
    this.velocity = { ...velocity };
  }
} 