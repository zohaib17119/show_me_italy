import { useEffect, useMemo, useState } from 'react';
import { Spin } from 'antd';
import type { Language } from '@/api/types';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  FormInput,
  FormSelect,
  FormTextarea,
  ListErrorState,
  NotificationItem,
  RecipientChip,
  SectionTitle,
  showToast,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { ANNOUNCEMENT_TYPES } from '@/mocks';
import { selectAuthUser } from '@/features/auth/authSlice';
import {
  fetchLanguages,
  selectActiveLanguages,
  selectLanguageStatus,
} from '@/features/language/languageSlice';
import {
  createAnnouncement,
  fetchNotifications,
  selectInboxError,
  selectInboxItems,
  selectInboxStatus,
} from '@/features/notifications/notificationSlice';
import type { CreateNotificationPayload } from '@/api/types';

function languageAudienceLabel(lang: Language): string {
  return lang.name?.trim() || lang.code?.trim() || 'Unknown';
}

function buildChannels(inApp: boolean, email: boolean): string {
  return [
    inApp ? 'in-app' : null,
    email ? 'email' : null,
  ]
    .filter(Boolean)
    .join(',');
}

function dateToIso(date: string): string {
  if (!date.trim()) return '';
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

function buildCreatePayload(input: {
  notificationType: string;
  title: string;
  message: string;
  allGuides: boolean;
  selectedLanguages: Language[];
  inAppEnabled: boolean;
  emailEnabled: boolean;
  scheduledDate: string;
  createdBy: string;
}): CreateNotificationPayload {
  const now = new Date().toISOString();
  const scheduledAt = dateToIso(input.scheduledDate);

  const audience = input.allGuides
    ? 'All Guides'
    : input.selectedLanguages.map(languageAudienceLabel).join(',');

  return {
    id: '',
    notificationType: input.notificationType,
    title: input.title.trim(),
    message: input.message.trim(),
    audience,
    channels: buildChannels(input.inAppEnabled, input.emailEnabled),
    scheduledAt,
    status: '',
    createdBy: input.createdBy,
    createdAt: now,
    sentAt: now,
  };
}

export function NotificationsPage() {
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.NOTIFICATIONS);
  const inbox = useAppSelector(selectInboxItems);
  const inboxStatus = useAppSelector(selectInboxStatus);
  const inboxError = useAppSelector(selectInboxError);
  const authUser = useAppSelector(selectAuthUser);
  const languages = useAppSelector(selectActiveLanguages);
  const languageStatus = useAppSelector(selectLanguageStatus);

  const [allGuides, setAllGuides] = useState(true);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([]);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [scheduledDate, setScheduledDate] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void dispatch(fetchNotifications());
    void dispatch(fetchLanguages());
  }, [dispatch]);

  const selectedLanguages = useMemo(
    () =>
      languages.filter(
        (lang) => lang.languageId != null && selectedLanguageIds.includes(lang.languageId),
      ),
    [languages, selectedLanguageIds],
  );

  const handleAllGuidesClick = () => {
    setAllGuides(true);
    setSelectedLanguageIds([]);
  };

  const toggleLanguage = (languageId: number) => {
    setAllGuides(false);
    setSelectedLanguageIds((prev) =>
      prev.includes(languageId)
        ? prev.filter((id) => id !== languageId)
        : [...prev, languageId],
    );
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setScheduledDate('');
    setAllGuides(true);
    setSelectedLanguageIds([]);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      showToast('Title and message are required');
      return;
    }
    if (!allGuides && selectedLanguageIds.length === 0) {
      showToast('Select All Guides or at least one language');
      return;
    }

    const payload = buildCreatePayload({
      notificationType: type,
      title,
      message,
      allGuides,
      selectedLanguages,
      inAppEnabled,
      emailEnabled,
      scheduledDate,
      createdBy: authUser?.email ?? '',
    });

    setSending(true);
    try {
      await dispatch(createAnnouncement(payload)).unwrap();
      showToast('Announcement sent');
      resetForm();
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader title={meta.title} />

      <div className="layoutTwoCol">
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
                <RecipientChip selected={allGuides} onClick={handleAllGuidesClick}>
                  All Guides
                </RecipientChip>
                {languageStatus === 'loading' && languages.length === 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading languages…</span>
                )}
                {languages.map((lang) => {
                  const id = lang.languageId;
                  if (id == null) return null;
                  const label = languageAudienceLabel(lang);
                  return (
                    <RecipientChip
                      key={id}
                      selected={!allGuides && selectedLanguageIds.includes(id)}
                      onClick={() => toggleLanguage(id)}
                    >
                      {label}
                    </RecipientChip>
                  );
                })}
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
              <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                <CheckboxLabel label="In-App" checked={inAppEnabled} onChange={setInAppEnabled} />
                <CheckboxLabel label="Email" checked={emailEnabled} onChange={setEmailEnabled} />
              </div>
            </div>

            <FormInput
              label="Schedule (optional)"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />

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
          {inboxStatus === 'failed' && (
            <ListErrorState
              message={inboxError}
              onRetry={() => void dispatch(fetchNotifications())}
            />
          )}
          {inboxStatus !== 'failed' && (
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
                      fontSize: 16,
                    }}
                  >
                    {item.icon}
                  </span>
                }
                title={item.title}
                sub={item.message}
                meta={item.meta}
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
          )}
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
