import { Card, Empty } from 'antd';

export function LanguageDonut() {
  return (
    <Card title="Language Breakdown" size="small">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            Donut chart — <strong>Phase 2</strong>
            <br />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              34 tours · EN 36% · IT 20% · FR 14%
            </span>
          </span>
        }
      />
    </Card>
  );
}
