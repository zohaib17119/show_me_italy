import type { Application } from '@/mocks/applications';

export type QueueGroupRow = {
  rowType: 'group';
  key: string;
  tourSlotId: number;
  typeName: string;
};

export type QueueApplicationRow = Application & { rowType: 'application' };

export type QueueTableRow = QueueGroupRow | QueueApplicationRow;

export function isQueueGroupRow(row: QueueTableRow): row is QueueGroupRow {
  return row.rowType === 'group';
}

export function buildGroupedQueueRows(applications: Application[]): QueueTableRow[] {
  const grouped = new Map<number, Application[]>();
  const groupOrder: number[] = [];

  for (const app of applications) {
    const slotId = app.tourSlotId ?? -1;
    if (!grouped.has(slotId)) {
      grouped.set(slotId, []);
      groupOrder.push(slotId);
    }
    grouped.get(slotId)!.push(app);
  }

  const result: QueueTableRow[] = [];
  for (const slotId of groupOrder) {
    const apps = grouped.get(slotId)!;
    result.push({
      rowType: 'group',
      key: `group-${slotId}`,
      tourSlotId: slotId,
      typeName: apps[0].tour,
    });
    for (const app of apps) {
      result.push({ rowType: 'application', ...app });
    }
  }

  return result;
}
