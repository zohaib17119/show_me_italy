import { App, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { IconButton } from '@/components/ui';

interface SettingsRowMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  deleteTitle?: string;
  deleteContent?: string;
}

export function SettingsRowMenu({
  onEdit,
  onDelete,
  deleteTitle = 'Delete item?',
  deleteContent = 'This action cannot be undone.',
}: SettingsRowMenuProps) {
  const { modal } = App.useApp();

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          { key: 'edit', label: 'Edit' },
          { key: 'delete', label: 'Delete', danger: true },
        ],
        onClick: ({ key, domEvent }) => {
          domEvent.stopPropagation();
          if (key === 'edit') {
            onEdit();
            return;
          }
          if (key === 'delete') {
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
