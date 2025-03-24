import React from 'react';
import { render, screen } from '@testing-library/react';
import { HUD } from '../src/components/ui/HUD';

describe('HUD', () => {
  test('should render health bar with correct percentage', () => {
    render(<HUD health={75} isDisabled={false} disableTimeRemaining={0} />);
    
    const healthBar = screen.getByRole('progressbar');
    expect(healthBar).toHaveStyle({ width: '75%' });
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('should not show disabled overlay when car is not disabled', () => {
    render(<HUD health={100} isDisabled={false} disableTimeRemaining={0} />);
    
    expect(screen.queryByText(/Disabled for/)).not.toBeInTheDocument();
  });

  test('should show disabled overlay with correct time when car is disabled', () => {
    render(<HUD health={0} isDisabled={true} disableTimeRemaining={2500} />);
    
    const disabledText = screen.getByText('Disabled for 3s');
    expect(disabledText).toBeInTheDocument();
  });

  test('should round health percentage to nearest integer', () => {
    render(<HUD health={75.7} isDisabled={false} disableTimeRemaining={0} />);
    
    expect(screen.getByText('76%')).toBeInTheDocument();
  });

  test('should round disable time to nearest second', () => {
    render(<HUD health={0} isDisabled={true} disableTimeRemaining={1500} />);
    
    expect(screen.getByText('Disabled for 2s')).toBeInTheDocument();
  });
}); 