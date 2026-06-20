import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  SettingsRow,
  showToast,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import {
  MOCK_ADMIN_USERS,
  MOCK_LANGUAGE_SETTINGS,
  MOCK_TOUR_TYPES,
} from '@/mocks';

export function SettingsPage() {
  const meta = getRouteMeta(ROUTES.SETTINGS);

  return (
    <div>
      <PageHeader title={meta.title} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          alignItems: 'start',
        }}
      >
        <AppCard title="Tour Settings">
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 12px' }}>
            Types, meeting points, default rates
          </p>
          {MOCK_TOUR_TYPES.map((tour) => (
            <SettingsRow
              key={tour.id}
              icon="🏛️"
              title={tour.name}
              sub={
                tour.isDefault
                  ? `Default · €${tour.rate.toFixed(2)} · ${tour.durationHours}h`
                  : `€${tour.rate.toFixed(2)} · ${tour.durationHours}h`
              }
              action={
                <AppButton variant="secondary" onClick={() => showToast('Edit modal')}>
                  Edit
                </AppButton>
              }
            />
          ))}
          <AppButton
            variant="secondary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => showToast('Add tour type')}
          >
            + Add Tour Type
          </AppButton>
        </AppCard>

        <AppCard title="Language Settings">
          {MOCK_LANGUAGE_SETTINGS.map((lang) => (
            <SettingsRow
              key={lang.code}
              icon={
                <span
                  style={{
                    display: 'block',
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: lang.hex,
                  }}
                />
              }
              title={lang.name}
              sub={lang.hex}
              action={
                <>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginRight: 8,
                    }}
                  >
                    {lang.rateLabel}
                  </span>
                  <AppButton variant="secondary">Edit</AppButton>
                </>
              }
            />
          ))}
          <AppButton variant="secondary" style={{ width: '100%', marginTop: 8 }}>
            + Add Language
          </AppButton>
        </AppCard>

        <AppCard title="Admin Users">
          {MOCK_ADMIN_USERS.map((user) => (
            <SettingsRow
              key={user.id}
              icon={
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'var(--g200)',
                    color: 'var(--g700)',
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {user.initials}
                </span>
              }
              title={user.name}
              sub={user.email}
              action={
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'var(--g50)',
                    color: 'var(--g600)',
                  }}
                >
                  Active
                </span>
              }
            />
          ))}
          <AppButton
            variant="secondary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => showToast('Add admin user')}
          >
            + Add Admin User
          </AppButton>
        </AppCard>
      </div>
    </div>
  );
}
