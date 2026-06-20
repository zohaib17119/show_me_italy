import type { ButtonHTMLAttributes } from 'react';
import styles from './forms.module.css';

export interface ToggleSwitchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function ToggleSwitch({
  checked = false,
  onCheckedChange,
  className,
  onClick,
  type = 'button',
  ...props
}: ToggleSwitchProps) {
  return (
    <button
      type={type}
      role="switch"
      aria-checked={checked}
      className={[styles.toggle, checked ? styles.toggleOn : '', className]
        .filter(Boolean)
        .join(' ')}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          onCheckedChange?.(!checked);
        }
      }}
      {...props}
    />
  );
}
