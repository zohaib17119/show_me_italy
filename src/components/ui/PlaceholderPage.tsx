import { Empty } from 'antd';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { getRouteMeta } from '@/constants/navigation';

interface PlaceholderPageProps {
  title?: string;
  subtitle?: string;
}

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  const location = useLocation();
  const meta = getRouteMeta(location.pathname);

  return (
    <div>
      <PageHeader
        title={title ?? meta.title}
        subtitle={subtitle ?? meta.subtitle}
      />
      <Empty
        description={
          <span style={{ color: 'var(--text-muted)' }}>
            <strong>{title ?? meta.title}</strong> — coming soon
          </span>
        }
        style={{
          padding: '60px 20px',
          background: 'white',
          borderRadius: 16,
          border: '1px solid var(--border-color)',
        }}
      />
    </div>
  );
}
