import { Card, Empty } from 'antd';

export function TourTargets() {
  return (
    <Card title="Tour Targets" size="small">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            Tour targets — <strong>Phase 2</strong>
            <br />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Monthly goal 75% · Revenue 85% · Payout clearance 40%
            </span>
          </span>
        }
      />
    </Card>
  );
}
