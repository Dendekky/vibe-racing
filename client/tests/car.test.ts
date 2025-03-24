import { Car } from '../src/lib/game/car';

describe('Car', () => {
  let car: Car;

  beforeEach(() => {
    car = new Car();
  });

  test('should initialize with 100% health', () => {
    expect(car.getHealth()).toBe(100);
  });

  test('should take minor bump damage', () => {
    car.applyDamage('minor');
    expect(car.getHealth()).toBe(95);
  });

  test('should take wall crash damage', () => {
    car.applyDamage('wall');
    expect(car.getHealth()).toBe(90);
  });

  test('should take head-on crash damage', () => {
    car.applyDamage('headOn');
    expect(car.getHealth()).toBe(80);
  });

  test('should not go below 0 health', () => {
    // Apply 6 minor bumps (30 damage)
    for (let i = 0; i < 6; i++) {
      car.applyDamage('minor');
    }
    expect(car.getHealth()).toBe(70);
  });

  test('should disable car at 0 health', () => {
    // Apply 20 minor bumps (100 damage)
    for (let i = 0; i < 20; i++) {
      car.applyDamage('minor');
    }
    expect(car.getHealth()).toBe(0);
    expect(car.isCarDisabled()).toBe(true);
  });

  test('should repair car to full health', () => {
    // Apply some damage first
    car.applyDamage('wall');
    car.applyDamage('headOn');
    expect(car.getHealth()).toBe(70);

    car.repair();
    expect(car.getHealth()).toBe(100);
    expect(car.isCarDisabled()).toBe(false);
  });

  test('should not take damage while disabled', () => {
    // Disable the car
    for (let i = 0; i < 20; i++) {
      car.applyDamage('minor');
    }
    expect(car.isCarDisabled()).toBe(true);

    // Try to apply more damage
    car.applyDamage('headOn');
    expect(car.getHealth()).toBe(0);
  });

  test('should update disable timer', () => {
    // Disable the car
    for (let i = 0; i < 20; i++) {
      car.applyDamage('minor');
    }

    // Update with 1 second
    car.update(1000);
    expect(car.getDisableTimeRemaining()).toBe(2000);

    // Update with 2 more seconds
    car.update(2000);
    expect(car.getDisableTimeRemaining()).toBe(0);
    expect(car.isCarDisabled()).toBe(false);
    expect(car.getHealth()).toBe(100);
  });

  test('should handle position updates', () => {
    const position = { x: 1, y: 2, z: 3 };
    car.setPosition(position);
    expect(car.getPosition()).toEqual(position);
  });

  test('should handle rotation updates', () => {
    const rotation = { x: 1, y: 2, z: 3 };
    car.setRotation(rotation);
    expect(car.getRotation()).toEqual(rotation);
  });

  test('should handle velocity updates', () => {
    const velocity = { x: 1, y: 2, z: 3 };
    car.setVelocity(velocity);
    expect(car.getVelocity()).toEqual(velocity);
  });
}); 