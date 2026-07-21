import type { ReactNode } from 'react';
import { App, Dropdown, Tooltip } from 'antd';
import { LockOutlined, MoreOutlined } from '@ant-design/icons';
import { IconButton } from '@/components/ui';
import { NOT_AUTHORIZED_MESSAGE } from './LockedAction';

interface SettingsRowMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  deleteTitle?: string;
  deleteContent?: string;
  disableEdit?: boolean;
  disableDelete?: boolean;
  disabledTooltip?: string;
}

export function SettingsRowMenu({
  onEdit,
  onDelete,
  deleteTitle = 'Delete item?',
  deleteContent = 'This action cannot be undone.',
  disableEdit = false,
  disableDelete = false,
  disabledTooltip = NOT_AUTHORIZED_MESSAGE,
}: SettingsRowMenuProps) {
  const { modal } = App.useApp();

  const lockedLabel = (label: string): ReactNode => (
    <Tooltip title={disabledTooltip}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {label}
        <LockOutlined style={{ fontSize: 12 }} />
      </span>
    </Tooltip>
  );

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          {
            key: 'edit',
            label: disableEdit ? lockedLabel('Edit') : 'Edit',
            disabled: disableEdit,
          },
          {
            key: 'delete',
            label: disableDelete ? lockedLabel('Delete') : 'Delete',
            danger: true,
            disabled: disableDelete,
          },
        ],
        onClick: ({ key, domEvent }) => {
          domEvent.stopPropagation();
          if (key === 'edit') {
            if (disableEdit) return;
            onEdit();
            return;
          }
          if (key === 'delete') {
            if (disableDelete) return;
            modal.confirm({
              title: deleteTitle,
              content: deleteContent,
              okText: 'Delete',
              okType: 'danger',
              cancelText: 'Cancel',
              onOk: onDelete,
            });
          }
        },
      }}
    >
      <IconButton
        icon={<MoreOutlined style={{ fontSize: 16 }} />}
        aria-label="Row actions"
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
}
