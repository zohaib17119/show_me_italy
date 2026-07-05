import { useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectAuthUserId } from '@/features/auth/authSlice';
import { fetchRecipientNotifications } from '@/features/notifications/notificationSlice';
import { setIsMobile, setSidebarCollapsed } from '@/features/ui/uiSlice';

const { Content } = Layout;

export function AdminLayout() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectAuthUserId);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 992;
      dispatch(setIsMobile(mobile));
      if (mobile || tablet) {
        dispatch(setSidebarCollapsed(true));
      } else {
        dispatch(setSidebarCollapsed(false));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  useEffect(() => {
    if (userId) {
      void dispatch(fetchRecipientNotifications(userId));
    }
  }, [dispatch, userId]);

  return (
    <Layout className="admin-layout">
      <Sidebar />
      <Layout className="admin-main">
        <Topbar />
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
