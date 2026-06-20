import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './buttons.module.css';

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
}

export function FilterChip({
  active = false,
  icon,
  className,
  children,
  type = 'button',
  ...props
}: FilterChipProps) {
  const classes = [
    styles.filterChip,
    active ? styles.filterChipOn : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} aria-pressed={active} {...props}>
      {icon}
      {children}
    </button>
  );
}
