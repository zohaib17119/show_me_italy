import { Table } from 'antd';
import type { TableProps } from 'antd';
import styles from './ui.module.css';

export function DataTable<T extends object = Record<string, unknown>>(
  props: TableProps<T>,
) {
  const { className, locale, scroll, ...rest } = props;

  return (
    <div className={styles.tblWrap}>
      <Table
        {...rest}
        scroll={{ x: 'max-content', ...scroll }}
        locale={{ emptyText: 'No data', ...locale }}
        className={[styles.tbl, className].filter(Boolean).join(' ')}
      />
    </div>
  );
}
