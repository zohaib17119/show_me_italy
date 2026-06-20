import type { ReactNode } from 'react';
import styles from './forms.module.css';
import { ToggleSwitch } from './ToggleSwitch';

export interface ToggleRowProps {
  label: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  action?: ReactNode;
}

export function ToggleRow({
  label,
  description,
  checked = false,
  onCheckedChange,
  disabled,
  action,
}: ToggleRowProps) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleRowBody}>
        <div className={styles.toggleRowLabel}>{label}</div>
        {description && <div className={styles.toggleRowDesc}>{description}</div>}
      </div>
      {action ?? (
        <ToggleSwitch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}
