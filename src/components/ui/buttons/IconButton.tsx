import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './buttons.module.css';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'default' | 'danger';
  size?: 'default' | 'sm';
}

export function IconButton({
  icon,
  variant = 'default',
  size = 'default',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  const classes = [
    styles.iconBtn,
    variant === 'danger' ? styles.iconBtnDanger : '',
    size === 'sm' ? styles.iconBtnSm : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {icon}
    </button>
  );
}
