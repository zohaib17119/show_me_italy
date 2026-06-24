import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
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
import { ANNOUNCEMENT_RECIPIENT_OPTIONS, ANNOUNCEMENT_TYPES } from '@/mocks';
import {
  fetchNotifications,
  selectInboxItems,
  selectInboxStatus,
  sendNotification,
} from '@/features/notifications/notificationSlice';

export function NotificationsPage() {
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.NOTIFICATIONS);
  const inbox = useAppSelector(selectInboxItems);
  const inboxStatus = useAppSelector(selectInboxStatus);

  const [recipients, setRecipients] = useState<string[]>(['all']);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  const toggleRecipient = (id: string) => {
    setRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      showToast('Title and message are required');
      return;
    }
    setSending(true);
    try {
      await dispatch(
        sendNotification({
          title,
          description: message,
          type: type === 'announcement' ? 1 : 2,
          isRead: false,
        }),
      ).unwrap();
      showToast('✓ Announcement sent!');
      setTitle('');
      setMessage('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setSending(false);
    }
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
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <FormInput
              label="Title"
              placeholder="Announcement title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FormTextarea
              label="Message"
              placeholder="Write your message…"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

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
                <CheckboxLabel label="Push" checked={pushEnabled} onChange={setPushEnabled} />
                <CheckboxLabel label="In-App" checked={inAppEnabled} onChange={setInAppEnabled} />
                <CheckboxLabel label="Email" checked={emailEnabled} onChange={setEmailEnabled} />
              </div>
            </div>

            <FormInput label="Schedule (optional)" type="date" />

            <AppButton
              variant="primary"
              style={{ width: '100%' }}
              onClick={() => void handleSend()}
              disabled={sending}
            >
              {sending ? 'Sending…' : 'Send Now →'}
            </AppButton>
          </div>
        </AppCard>

        <div>
          <SectionTitle style={{ marginBottom: 10 }}>Admin Inbox</SectionTitle>
          {inboxStatus === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <Spin />
            </div>
          )}
          <AppCard padding="sm">
            {inbox.map((item) => (
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
            {inbox.length === 0 && inboxStatus !== 'loading' && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 12 }}>
                No notifications yet
              </div>
            )}
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
