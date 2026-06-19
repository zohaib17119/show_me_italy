import { Card, Empty } from 'antd';

export function RecentActivityTable() {
  return (
    <Card title="Recent Activity" size="small">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            Activity table — <strong>Phase 2</strong>
            <br />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Marco Rossi · Sofia Conti · Hans Müller
            </span>
          </span>
        }
      />
    </Card>
  );
}
