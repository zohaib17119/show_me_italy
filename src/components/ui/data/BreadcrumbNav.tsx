import styles from './ui.module.css';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  return (
    <nav
      className={[styles.breadcrumb, className].filter(Boolean).join(' ')}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} style={{ display: 'contents' }}>
            {index > 0 && <span className={styles.breadcrumbSep}>/</span>}
            {isLast || !item.onClick ? (
              <span
                className={[styles.breadcrumbItem, styles.breadcrumbItemCurrent]
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                className={styles.breadcrumbItem}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
