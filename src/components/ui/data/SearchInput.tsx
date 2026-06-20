import { SearchOutlined } from '@ant-design/icons';
import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './ui.module.css';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  icon?: ReactNode;
}

export function SearchInput({ icon, className, ...props }: SearchInputProps) {
  return (
    <div className={[styles.searchInput, className].filter(Boolean).join(' ')}>
      <span className={styles.searchInputIcon}>{icon ?? <SearchOutlined />}</span>
      <input type="search" className={styles.searchInputField} {...props} />
    </div>
  );
}
