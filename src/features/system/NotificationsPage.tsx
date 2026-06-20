import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  FormInput,
  FormSelect,
  FormTextarea,
  NotificationItem,
  RecipientChip,
  SectionTitle,
  showToast,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import {
  ANNOUNCEMENT_RECIPIENT_OPTIONS,
  ANNOUNCEMENT_TYPES,
  MOCK_INBOX_ITEMS,
} from '@/mocks';

export function NotificationsPage() {
  const meta = getRouteMeta(ROUTES.NOTIFICATIONS);
  const [recipients, setRecipients] = useState<string[]>(['all']);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const toggleRecipient = (id: string) => {
    setRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  return (
    <div>
      <PageHeader title={meta.title} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: 14,
          alignItems: 'start',
        }}
      >
        <AppCard>
          <SectionTitle style={{ marginBottom: 16 }}>Compose Announcement</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--text-secondary)',
                  marginBottom: 5,
                }}
              >
                Recipients
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 5 }}>
                {ANNOUNCEMENT_RECIPIENT_OPTIONS.map((opt) => (
                  <RecipientChip
                    key={opt.id}
                    selected={recipients.includes(opt.id)}
                    onClick={() => toggleRecipient(opt.id)}
                  >
                    {opt.label}
                    {opt.count != null ? ` (${opt.count})` : ''}
                  </RecipientChip>
                ))}
              </div>
            </div>

            <FormSelect
              label="Type"
              options={ANNOUNCEMENT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              defaultValue="announcement"
            />
            <FormInput label="Title" placeholder="Announcement title…" />
            <FormTextarea label="Message" placeholder="Write your message…" rows={4} />

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                }}
              >
                Send Via
              </label>
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                <CheckboxLabel
                  label="Push"
                  checked={pushEnabled}
                  onChange={setPushEnabled}
                />
                <CheckboxLabel
                  label="In-App"
                  checked={inAppEnabled}
                  onChange={setInAppEnabled}
                />
                <CheckboxLabel
                  label="Email"
                  checked={emailEnabled}
                  onChange={setEmailEnabled}
                />
              </div>
            </div>

            <FormInput label="Schedule (optional)" type="date" />

            <AppButton
              variant="primary"
              style={{ width: '100%' }}
              onClick={() => showToast('✓ Announcement sent to all 48 guides!')}
            >
              Send Now →
            </AppButton>
          </div>
        </AppCard>

        <div>
          <SectionTitle style={{ marginBottom: 10 }}>Admin Inbox</SectionTitle>
          <AppCard padding="sm">
            {MOCK_INBOX_ITEMS.map((item) => (
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
                    }}
                  >
                    {item.icon}
                  </span>
                }
                title={item.title}
                sub={item.body}
                time={item.time}
                unread={item.unread}
              />
            ))}
          </AppCard>
        </div>
      </div>
    </div>
  );
}

function CheckboxLabel({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        cursor: 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: 'var(--g500)' }}
      />
      {label}
    </label>
  );
}
