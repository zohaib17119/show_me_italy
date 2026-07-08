import { Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { IconButton } from '@/components/ui';

export interface TableRowMenuItem {
  key: string;
  label: string;
  onClick: () => void;
}

interface TableRowMenuProps {
  items: TableRowMenuItem[];
  ariaLabel?: string;
}

export function TableRowMenu({ items, ariaLabel = 'Row actions' }: TableRowMenuProps) {
  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: items.map(({ key, label }) => ({ key, label })),
        onClick: ({ key, domEvent }) => {
          domEvent.stopPropagation();
          const item = items.find((entry) => entry.key === key);
          item?.onClick();
        },
      }}
    >
      <IconButton
        icon={<MoreOutlined style={{ fontSize: 16 }} />}
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
}
