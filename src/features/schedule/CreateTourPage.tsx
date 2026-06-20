import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  FormGrid,
  FormInput,
  FormSelect,
  FormTextarea,
  PreviewCard,
  SectionTitle,
  ToggleRow,
  formGridSpanFull,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { languageColors } from '@/theme/tokens';
import styles from './schedule.module.css';

const TOUR_OPTIONS = [
  { value: 'colosseum', label: 'Colosseum Arena Tour' },
  { value: 'pantheon', label: 'Pantheon Tour' },
  { value: 'vatican', label: 'Vatican Museums Tour' },
  { value: 'forum', label: 'Roman Forum Walking Tour' },
];

const LANGUAGE_OPTIONS = [
  { value: 'EN', label: '🇬🇧 English' },
  { value: 'IT', label: '🇮🇹 Italian' },
  { value: 'FR', label: '🇫🇷 French' },
  { value: 'ES', label: '🇪🇸 Spanish' },
  { value: 'DE', label: '🇩🇪 German' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function CreateTourPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('EN');
  const [openApplications, setOpenApplications] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Schedule', onClick: () => navigate(ROUTES.CALENDAR) },
          { label: 'Create Tour Slot' },
        ]}
      />

      <PageHeader
        title="Create Tour Slot"
        extra={
          <>
            <AppButton variant="secondary" onClick={() => navigate(ROUTES.CALENDAR)}>
              Cancel
            </AppButton>
            <AppButton variant="dark" onClick={() => showToast('✓ Draft saved')}>
              Save Draft
            </AppButton>
            <AppButton onClick={() => showToast('✓ Tour slot published!')}>
              Publish Slot
            </AppButton>
          </>
        }
      />

      <div className={styles.twoColWide}>
        <AppCard>
          <FormGrid>
            <div className={formGridSpanFull}>
              <FormSelect label="Tour Type" options={TOUR_OPTIONS} defaultValue="colosseum" />
            </div>
            <FormInput label="Date" type="date" defaultValue="2026-04-17" />
            <FormSelect
              label="Language"
              options={LANGUAGE_OPTIONS}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
            <FormInput label="Start Time" type="time" defaultValue="10:00" />
            <FormInput label="End Time" type="time" defaultValue="12:30" />
            <FormInput label="Guides Needed" type="number" defaultValue={2} />
            <FormInput label="Group Size" type="number" defaultValue={20} />
            <FormInput label="Pay Rate (€)" type="number" defaultValue={70} />
            <div className={formGridSpanFull}>
              <FormInput
                label="Meeting Point"
                defaultValue="Basilica Santi Cosma e Damiano, Via dei Fori Imperiali 1, Rome"
              />
            </div>
            <div className={formGridSpanFull}>
              <FormTextarea
                label="Admin Notes"
                defaultValue="Please arrive 15 minutes early. Bring your official guide badge."
              />
            </div>
            <FormSelect label="Status" options={STATUS_OPTIONS} defaultValue="open" />
          </FormGrid>
        </AppCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AppCard>
            <SectionTitle style={{ marginBottom: 12 }}>Live Preview</SectionTitle>
            <PreviewCard title="Colosseum Arena Tour">
              <div
                className={styles.previewAccent}
                style={{ background: languageColors[language] ?? languageColors.EN }}
              />
              <div className={styles.previewMetaRow}>
                <span className={styles.previewBadge}>🇬🇧 {language}</span>
                <span className={styles.previewBadge}>📅 Fri, 17 Apr</span>
                <span className={styles.previewBadge}>🕙 10:00–12:30</span>
                <span className={styles.previewBadge}>👥 max 20</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                📍 Basilica Santi Cosma e Damiano
              </div>
              <div className={styles.previewPrice}>€70.00</div>
            </PreviewCard>
          </AppCard>

          <AppCard>
            <SectionTitle style={{ marginBottom: 10 }}>Options</SectionTitle>
            <ToggleRow
              label="Open for Applications"
              description="Guides can apply immediately"
              checked={openApplications}
              onCheckedChange={setOpenApplications}
            />
            <ToggleRow
              label="Send Push Notification"
              description="Alert matching language guides"
              checked={sendNotification}
              onCheckedChange={setSendNotification}
            />
          </AppCard>
        </div>
      </div>
    </div>
  );
}
