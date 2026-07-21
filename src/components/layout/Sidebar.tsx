import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  AppstoreOutlined,
  ImportOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
  FileTextOutlined,
  SwapOutlined,
  WalletOutlined,
  ProfileOutlined,
  LineChartOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMobileDrawerOpen, toggleSidebar } from '@/features/ui/uiSlice';
import { selectBadgeCount } from '@/features/notifications/notificationSlice';
import { selectAuthPermissions } from '@/features/auth/authSlice';
import { hasPermission } from '@/features/auth/permissions';
import { NAV_PERMISSION_BY_KEY } from '@/features/auth/routePermissions';
import { navigationGroups, findNavKeyByPath } from '@/constants/navigation';
import type { BadgeKey } from '@/types';

const { Sider } = Layout;

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <HomeOutlined />,
  calendar: <CalendarOutlined />,
  'create-tour': <PlusCircleOutlined />,
  bulk: <AppstoreOutlined />,
  import: <ImportOutlined />,
  guides: <TeamOutlined />,
  approvals: <UserAddOutlined />,
  'guide-detail': <UserOutlined />,
  applications: <FileTextOutlined />,
  assignment: <SwapOutlined />,
  payouts: <WalletOutlined />,
  'payout-detail': <ProfileOutlined />,
  reports: <LineChartOutlined />,
  notifications: <BellOutlined />,
  settings: <SettingOutlined />,
};

const badgeColors: Record<string, string> = {
  green: 'var(--g500)',
  red: 'var(--red)',
  orange: 'var(--orange)',
};

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const counts = useAppSelector((s) => s.notifications.counts);
  const permissions = useAppSelector(selectAuthPermissions);

  const selectedKey = findNavKeyByPath(location.pathname);

  const menuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [];

    navigationGroups.forEach((group) => {
      const children = group.items
        .filter((item) => {
          const required = NAV_PERMISSION_BY_KEY[item.key];
          if (!required) return true;
          return hasPermission(permissions, required);
        })
        .map((item) => {
          let label: React.ReactNode = item.label;
          if (item.badgeKey && !collapsed) {
            const count = selectBadgeCount(counts, item.badgeKey as BadgeKey);
            label = (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                {item.label}
                <Badge
                  count={count}
                  style={{
                    backgroundColor: badgeColors[item.badgeColor ?? 'green'],
                    boxShadow: 'none',
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                />
              </span>
            );
          }

          return {
            key: item.key,
            icon: iconMap[item.key],
            label,
            onClick: () => navigate(item.path),
          };
        });

      if (children.length === 0) return;

      items.push({
        type: 'group',
        label: collapsed ? null : group.label,
        children,
      });
    });

    return items;
  }, [collapsed, counts, navigate, permissions]);

  return (
    <>
      <div className="sidebar-logo">
        
        <img src="/favicon.png" alt="Show Me Italy" className="sidebar-logo-mark" /> :
         {!collapsed && (
          <div>
            <div className="sidebar-logo-name">Show Me Italy</div>
            <div className="sidebar-logo-sub">Admin Dashboard</div>
          </div>
        )}
      </div>
      <div className="sidebar-nav-scroll">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="sidebar-menu"
          style={{ background: 'transparent', border: 'none' }}
        />
      </div>
    </>
  );
}

export function Sidebar() {
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, mobileDrawerOpen, isMobile } = useAppSelector(
    (s) => s.ui,
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileDrawerOpen}
        onClose={() => dispatch(setMobileDrawerOpen(false))}
        width={228}
        styles={{
          body: { padding: 0, background: '#0d2318' },
          header: { display: 'none' },
        }}
      >
        <SidebarContent collapsed={false} />
      </Drawer>
    );
  }

  return (
    <Sider
      width={228}
      collapsible
      collapsed={sidebarCollapsed}
      onCollapse={() => dispatch(toggleSidebar())}
      className="admin-layout-sider"
      style={{ background: 'var(--sidebar-bg)', overflow: 'hidden' }}
    >
      <div className="sidebar-inner">
        <SidebarContent collapsed={sidebarCollapsed} />
      </div>
    </Sider>
  );
}
