import type { ButtonHTMLAttributes } from 'react';
import styles from './buttons.module.css';

export interface RecipientChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function RecipientChip({
  selected = false,
  className,
  children,
  type = 'button',
  ...props
}: RecipientChipProps) {
  const classes = [
    styles.recipientChip,
    selected ? styles.recipientChipSelected : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} aria-pressed={selected} {...props}>
      <span className={styles.recipientCheck}>{selected ? '✓' : ''}</span>
      {children}
    </button>
  );
}
