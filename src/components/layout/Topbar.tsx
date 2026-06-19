import { Layout, Input, Badge, Avatar, Dropdown, Button } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  AppstoreOutlined,
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMobileDrawerOpen } from '@/features/ui/uiSlice';
import { getRouteMeta } from '@/constants/navigation';
import { showToast } from '@/components/ui/AppToast';

const { Header } = Layout;

export function Topbar() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const isMobile = useAppSelector((s) => s.ui.isMobile);
  const meta = getRouteMeta(location.pathname);

  const breadcrumbParts = meta.breadcrumb.split(' / ');
  const breadcrumbHtml = (
    <>
      {breadcrumbParts[0]}
      {breadcrumbParts[1] && (
        <>
          {' '}
          <strong>/ {breadcrumbParts.slice(1).join(' / ')}</strong>
        </>
      )}
    </>
  );

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Sign out', danger: true },
  ];

  return (
    <Header className="admin-header" style={{ padding: 0, height: 56, lineHeight: '56px' }}>
      {isMobile && (
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => dispatch(setMobileDrawerOpen(true))}
          style={{ marginLeft: 8 }}
        />
      )}
      <div className="admin-header-breadcrumb">{breadcrumbHtml}</div>
      <Input
        prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
        placeholder="Search guides, tours…"
        style={{
          width: isMobile ? 140 : 210,
          borderRadius: 999,
          background: '#F7FAF8',
        }}
        size="middle"
      />
      <Button
        type="text"
        icon={<AppstoreOutlined />}
        style={{ width: 34, height: 34 }}
      />
      <Badge dot offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ width: 34, height: 34 }}
          onClick={() => showToast('4 new notifications')}
        />
      </Badge>
      <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            marginRight: 16,
          }}
        >
          <Avatar
            style={{ backgroundColor: '#1E8449', fontSize: 11, fontWeight: 800 }}
          >
            {user?.initials ?? 'SA'}
          </Avatar>
          {!isMobile && user && (
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {user.email}
              </div>
            </div>
          )}
        </div>
      </Dropdown>
    </Header>
  );
}
