import { Card, Empty } from 'antd';

export function CashflowChart() {
  return (
    <Card title="Tour Activity" size="small">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>
            Cashflow chart — <strong>Phase 2</strong>
            <br />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Confirmed €8,240 · 34 pending applications
            </span>
          </span>
        }
      />
    </Card>
  );
}
