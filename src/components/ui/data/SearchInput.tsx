import { SearchOutlined } from '@ant-design/icons';
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import styles from './ui.module.css';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  icon?: ReactNode;
  wrapperStyle?: CSSProperties;
}

export function SearchInput({ icon, className, wrapperStyle, style, ...props }: SearchInputProps) {
  return (
    <div
      className={[styles.searchInput, className].filter(Boolean).join(' ')}
      style={wrapperStyle}
    >
      <span className={styles.searchInputIcon}>{icon ?? <SearchOutlined />}</span>
      <input type="search" className={styles.searchInputField} style={style} {...props} />
    </div>
  );
}
