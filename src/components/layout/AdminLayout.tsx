import { useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppDispatch } from '@/app/hooks';
import { setIsMobile, setSidebarCollapsed } from '@/features/ui/uiSlice';

const { Content } = Layout;

export function AdminLayout() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      dispatch(setIsMobile(mobile));
      if (mobile) {
        dispatch(setSidebarCollapsed(true));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

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
