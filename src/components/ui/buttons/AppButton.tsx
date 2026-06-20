import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './buttons.module.css';

export type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'dark'
  | 'danger'
  | 'warn'
  | 'ghost';

export type AppButtonSize = 'sm' | 'xs';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  icon?: ReactNode;
}

export function AppButton({
  variant = 'primary',
  size = 'sm',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: AppButtonProps) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {icon}
      {children}
    </button>
  );
}
