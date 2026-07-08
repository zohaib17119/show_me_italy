import { Layout, Badge, Avatar, Dropdown, Button, Spin } from 'antd';
import {
  BellOutlined,
  // AppstoreOutlined,
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout, selectAuthUserId } from '@/features/auth/authSlice';
import { ROUTES } from '@/constants/routes';
import { setMobileDrawerOpen } from '@/features/ui/uiSlice';
import { getRouteMeta } from '@/constants/navigation';
import { NotificationItem, AppButton } from '@/components/ui';
import {
  markAllRecipientNotificationsRead,
  markRecipientNotificationRead,
  selectRecipientInbox,
  selectRecipientStatus,
  selectUnreadNotificationCount,
} from '@/features/notifications/notificationSlice';

const { Header } = Layout;

export function Topbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const isMobile = useAppSelector((s) => s.ui.isMobile);
  const meta = getRouteMeta(location.pathname);
  const recipientInbox = useAppSelector(selectRecipientInbox);
  const recipientStatus = useAppSelector(selectRecipientStatus);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);
  const userId = useAppSelector(selectAuthUserId);
  const markingRead = recipientStatus === 'loading' && recipientInbox.length > 0;

  const handleMarkAsRead = (notificationRecipientId: number) => {
    if (!userId || notificationRecipientId == null) return;
    void dispatch(
      markRecipientNotificationRead({ guideId: userId, notificationRecipientId }),
    );
  };

  const handleMarkAllAsRead = () => {
    if (!userId || unreadCount === 0) return;
    void dispatch(markAllRecipientNotificationsRead(userId));
  };

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

  const notificationDropdown = (
    <div
      style={{
        width: 360,
        maxWidth: '92vw',
        background: 'var(--card-bg)',
        borderRadius: 12,
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
        {unreadCount > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--g600)',
              background: 'var(--g50)',
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            {unreadCount} unread
          </span>
        )}
      </div>

      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {recipientStatus === 'loading' && recipientInbox.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <Spin size="small" />
          </div>
        )}

        {recipientStatus !== 'loading' && recipientInbox.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '20px 14px' }}>
            No notifications
          </div>
        )}

        {recipientInbox.map((item) => (
          <NotificationItem
            key={item.id}
            icon={
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  background: item.iconBg,
                  borderRadius: 10,
                  fontSize: 16,
                }}
              >
                {item.icon}
              </span>
            }
            title={item.title}
            sub={item.message}
            meta={item.meta}
            time={item.time}
            unread={item.unread}
            titleAction={
              item.recipientId != null && item.unread ? (
                <AppButton
                  variant="secondary"
                  size="xs"
                  disabled={markingRead}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(item.recipientId!);
                  }}
                >
                  Mark as read
                </AppButton>
              ) : null
            }
          />
        ))}
      </div>

      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
        }}
      >
        <Button
          type="link"
          size="small"
          disabled={markingRead || unreadCount === 0 || !userId}
          onClick={handleMarkAllAsRead}
          style={{ fontSize: 12, fontWeight: 600, padding: 0 }}
        >
          Mark all as read
        </Button>
      </div>
    </div>
  );

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
      {/* <Input
        className="admin-header-search"
        prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
        placeholder="Search guides, tours…"
        style={{
          width: isMobile ? 140 : 210,
          borderRadius: 999,
          background: '#F7FAF8',
        }}
        size="middle"
      /> */}
      {/* <Button
        type="text"
        icon={<AppstoreOutlined />}
        style={{ width: 34, height: 34 }}
      /> */}
      <Dropdown dropdownRender={() => notificationDropdown} trigger={['click']} placement="bottomRight">
        <Badge count={unreadCount} size="small" offset={[-2, 2]} overflowCount={99}>
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ width: 34, height: 34 }}
            aria-label="Notifications"
          />
        </Badge>
      </Dropdown>
      <Dropdown
        menu={{
          items: userMenuItems,
          onClick: ({ key }) => {
            if (key === 'logout') {
              dispatch(logout());
              navigate(ROUTES.LOGIN, { replace: true });
            }
          },
        }}
        trigger={['click']}
      >
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
