import styles from './ui.module.css';

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    if (totalPages <= 7) return true;
    if (p === 1 || p === totalPages) return true;
    return Math.abs(p - page) <= 1;
  });

  return (
    <div className={[styles.pagination, className].filter(Boolean).join(' ')}>
      <span className={styles.paginationInfo}>
        Showing {start}–{end} of {total}
        {pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange && (
          <>
            {' · '}
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              aria-label="Rows per page"
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </>
        )}
      </span>
      <div className={styles.paginationControls}>
        <button
          type="button"
          className={styles.pgBtn}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        {pages.map((p, idx) => {
          const prev = pages[idx - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;
          return (
            <span key={p} style={{ display: 'contents' }}>
              {showEllipsis && <span className={styles.paginationInfo}>…</span>}
              <button
                type="button"
                className={[styles.pgBtn, p === page ? styles.pgBtnActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          className={styles.pgBtn}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
