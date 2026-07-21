import { Dropdown, Tooltip } from 'antd';
import { LockOutlined, MoreOutlined } from '@ant-design/icons';
import { IconButton } from '@/components/ui';
import { NOT_AUTHORIZED_MESSAGE } from './LockedAction';

export interface TableRowMenuItem {
  key: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
  danger?: boolean;
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
        items: items.map(({ key, label, disabled, danger, disabledTooltip }) => ({
          key,
          danger,
          disabled,
          label: disabled ? (
            <Tooltip title={disabledTooltip ?? NOT_AUTHORIZED_MESSAGE}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {label}
                <LockOutlined style={{ fontSize: 12 }} />
              </span>
            </Tooltip>
          ) : (
            label
          ),
        })),
        onClick: ({ key, domEvent }) => {
          domEvent.stopPropagation();
          const item = items.find((entry) => entry.key === key);
          if (item?.disabled) return;
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
