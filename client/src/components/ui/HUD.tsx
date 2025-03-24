import React from 'react';
import styles from './HUD.module.css';

interface HUDProps {
  health: number;
  isDisabled: boolean;
  disableTimeRemaining: number;
}

export const HUD: React.FC<HUDProps> = ({ health, isDisabled, disableTimeRemaining }) => {
  return (
    <div className={styles.hud}>
      <div className={styles.healthBar}>
        <div 
          className={styles.healthFill} 
          style={{ width: `${health}%` }}
          role="progressbar"
          aria-valuenow={health}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div className={styles.healthText}>
          {Math.round(health)}%
        </div>
      </div>
      {isDisabled && (
        <div className={styles.disabledOverlay}>
          <div className={styles.disabledText}>
            Disabled for {Math.ceil(disableTimeRemaining / 1000)}s
          </div>
        </div>
      )}
    </div>
  );
}; 