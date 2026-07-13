import type { FormSelectOption } from '@/components/ui/forms/FormSelect';
import type { TourSlotFormValues } from '@/api/mappers/tourMapper';
import {
  AppCard,
  FormGrid,
  FormInput,
  FormSelect,
  FormTextarea,
  PreviewCard,
  SectionTitle,
  ToggleRow,
  formGridSpanFull,
} from '@/components/ui';
import { languageColors } from '@/theme/tokens';
import type { LangCode } from '@/types';
import type { TourSlotFieldErrors } from '../utils/tourSlotValidation';
import { TourTicketField } from './TourTicketField';
import styles from '../schedule.module.css';

const STATUS_OPTIONS: FormSelectOption[] = [
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export interface TourSlotFormViewProps {
  values: TourSlotFormValues;
  tourTypeOptions: FormSelectOption[];
  languageOptions: FormSelectOption[];
  selectedTourTypeName?: string;
  langCode?: LangCode;
  readOnly?: boolean;
  showOptions?: boolean;
  showExtraFields?: boolean;
  showGuidesNeeded?: boolean;
  meetingPointReadOnly?: boolean;
  errors?: TourSlotFieldErrors;
  onTourTypeIdChange?: (value: number) => void;
  onLanguageIdChange?: (value: number) => void;
  onSlotDateChange?: (value: string) => void;
  onStartTimeChange?: (value: string) => void;
  onEndTimeChange?: (value: string) => void;
  onGuidesNeededChange?: (value: number) => void;
  onGuestCountChange?: (value: number) => void;
  onPayRatePerHourChange?: (value: number) => void;
  onMeetingPointChange?: (value: string) => void;
  onAdminNotesChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onTicketsChange?: (value: string | null) => void;
  onOpenApplicationsChange?: (value: boolean) => void;
  onSendNotificationChange?: (value: boolean) => void;
}

export function TourSlotFormView({
  values,
  tourTypeOptions,
  languageOptions,
  selectedTourTypeName = 'Tour',
  langCode = 'EN',
  readOnly = false,
  showOptions = true,
  showExtraFields = false,
  showGuidesNeeded = true,
  meetingPointReadOnly = false,
  errors,
  onTourTypeIdChange,
  onLanguageIdChange,
  onSlotDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onGuidesNeededChange,
  onGuestCountChange,
  onPayRatePerHourChange,
  onMeetingPointChange,
  onAdminNotesChange,
  onStatusChange,
  onTicketsChange,
  onOpenApplicationsChange,
  onSendNotificationChange,
}: TourSlotFormViewProps) {
  const disabled = readOnly;

  return (
    <div className={styles.twoColWide}>
      <AppCard>
        <FormGrid>
          <div className={formGridSpanFull}>
            <FormSelect
              label="Tour Type"
              options={tourTypeOptions}
              value={values.tourTypeId ? String(values.tourTypeId) : ''}
              placeholder="Select tour type"
              disabled={disabled}
              error={errors?.tourTypeId}
              onChange={(e) => onTourTypeIdChange?.(Number(e.target.value))}
            />
          </div>
          <FormInput
            label="Date"
            type="date"
            value={values.slotDate}
            disabled={disabled}
            error={errors?.slotDate}
            onChange={(e) => onSlotDateChange?.(e.target.value)}
          />
          <FormSelect
            label="Language"
            options={languageOptions}
            value={values.languageId ? String(values.languageId) : ''}
            placeholder="Select language"
            disabled={disabled}
            error={errors?.languageId}
            onChange={(e) => onLanguageIdChange?.(Number(e.target.value))}
          />
          <FormInput
            label="Start Time"
            type="time"
            value={values.startTime}
            disabled={disabled}
            error={errors?.startTime}
            onChange={(e) => onStartTimeChange?.(e.target.value)}
          />
          <FormInput
            label="End Time"
            type="time"
            value={values.endTime}
            disabled={disabled}
            error={errors?.endTime}
            onChange={(e) => onEndTimeChange?.(e.target.value)}
          />
          {showGuidesNeeded && (
            <FormInput
              label="Guides Needed"
              type="number"
              value={values.guidesNeeded}
              disabled={disabled}
              onChange={(e) => onGuidesNeededChange?.(Number(e.target.value))}
            />
          )}
          <FormInput
            label="Group Size"
            type="number"
            value={values.guestCount}
            disabled={disabled}
            error={errors?.guestCount}
            onChange={(e) => onGuestCountChange?.(Number(e.target.value))}
          />
          <FormInput
            label="Pay Rate (€)"
            type="number"
            value={values.payRatePerHour}
            disabled={disabled}
            onChange={(e) => onPayRatePerHourChange?.(Number(e.target.value))}
          />
          <div className={formGridSpanFull}>
            <FormInput
              label="Meeting Point"
              value={values.meetingPoint}
              disabled={disabled || meetingPointReadOnly}
              error={errors?.meetingPoint}
              onChange={(e) => onMeetingPointChange?.(e.target.value)}
            />
          </div>
          <div className={formGridSpanFull}>
            <FormTextarea
              label="Admin Notes"
              value={values.adminNotes}
              disabled={disabled}
              onChange={(e) => onAdminNotesChange?.(e.target.value)}
            />
          </div>
          <FormSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={values.status}
            disabled={disabled}
            onChange={(e) => onStatusChange?.(e.target.value)}
          />
          <div className={formGridSpanFull}>
            <TourTicketField
              value={values.tickets}
              disabled={disabled}
              onChange={(next) => onTicketsChange?.(next)}
            />
          </div>
          {showExtraFields && (
            <>
              <FormInput
                label="Guides Filled"
                type="number"
                value={values.guidesFilled ?? 0}
                disabled
              />
              <FormInput
                label="Openings Count"
                type="number"
                value={values.openingsCount ?? 0}
                disabled
              />
              <div className={formGridSpanFull}>
                <FormInput label="External Ref" value={values.externalRef ?? '—'} disabled />
              </div>
              <FormInput
                label="Imported"
                value={values.isImported ? 'Yes' : 'No'}
                disabled
              />
              <FormInput
                label="Conflict Flag"
                value={values.conflictFlag ? 'Yes' : 'No'}
                disabled
              />
            </>
          )}
        </FormGrid>
      </AppCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AppCard>
          <SectionTitle style={{ marginBottom: 12 }}>Live Preview</SectionTitle>
          <PreviewCard title={selectedTourTypeName}>
            <div
              className={styles.previewAccent}
              style={{ background: languageColors[langCode] ?? languageColors.EN }}
            />
            <div className={styles.previewMetaRow}>
              <span className={styles.previewBadge}>
                {values.languageName ?? langCode}
              </span>
              <span className={styles.previewBadge}>📅 {values.slotDate}</span>
              <span className={styles.previewBadge}>
                🕙 {values.startTime}–{values.endTime}
              </span>
              <span className={styles.previewBadge}>👥 max {values.guestCount}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {values.meetingPoint}</div>
            <div className={styles.previewPrice}>€{values.payRatePerHour.toFixed(2)}</div>
            {values.tourImages && values.tourImages.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {values.tourImages.map((image) => (
                  <span
                    key={image}
                    style={{
                      fontSize: 11,
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: 'var(--bg-muted)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {image}
                  </span>
                ))}
              </div>
            )}
          </PreviewCard>
        </AppCard>

        {showOptions && (
          <AppCard>
            <SectionTitle style={{ marginBottom: 10 }}>Options</SectionTitle>
            <ToggleRow
              label="Open for Applications"
              description="Guides can apply immediately"
              checked={values.openApplications}
              disabled={disabled}
              onCheckedChange={onOpenApplicationsChange}
            />
            <ToggleRow
              label="Send Push Notification"
              description="Alert matching language guides"
              checked={values.sendNotification}
              disabled={disabled}
              onCheckedChange={onSendNotificationChange}
            />
          </AppCard>
        )}
      </div>
    </div>
  );
}
