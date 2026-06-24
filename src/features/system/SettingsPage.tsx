import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { Language, TourType } from '@/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  FormGrid,
  FormInput,
  SettingsRow,
  ToggleSwitch,
  showToast,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { MOCK_ADMIN_USERS } from '@/mocks';
import {
  createLanguage,
  fetchLanguages,
  selectLanguages,
  selectLanguageStatus,
  updateLanguage,
} from '@/features/language/languageSlice';
import {
  createTourType,
  fetchTourTypes,
  selectTourTypes,
  selectTourTypeStatus,
  updateTourType,
} from '@/features/tourType/tourTypeSlice';

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.SETTINGS);
  const tourTypes = useAppSelector(selectTourTypes);
  const languages = useAppSelector(selectLanguages);
  const tourTypeStatus = useAppSelector(selectTourTypeStatus);
  const languageStatus = useAppSelector(selectLanguageStatus);

  const [showTourForm, setShowTourForm] = useState(false);
  const [showLangForm, setShowLangForm] = useState(false);
  const [tourForm, setTourForm] = useState<Partial<TourType>>({
    name: '',
    basePrice: 70,
    durationMinutes: 150,
    isActive: true,
  });
  const [langForm, setLangForm] = useState<Partial<Language>>({
    code: '',
    name: '',
    colorHex: '#27AE60',
    rateModifier: 0,
    isActive: true,
  });

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
  }, [dispatch]);

  const handleSaveTourType = async () => {
    if (!tourForm.name) {
      showToast('Tour type name is required');
      return;
    }
    try {
      await dispatch(
        createTourType({
          name: tourForm.name,
          description: tourForm.description ?? '',
          location: tourForm.location ?? 'Rome',
          meetingPointName: tourForm.meetingPointName ?? tourForm.name,
          meetingPointAddress: tourForm.meetingPointAddress ?? '',
          basePrice: Number(tourForm.basePrice ?? 0),
          durationMinutes: Number(tourForm.durationMinutes ?? 120),
          isActive: true,
        }),
      ).unwrap();
      showToast('✓ Tour type saved');
      setShowTourForm(false);
      setTourForm({ name: '', basePrice: 70, durationMinutes: 150, isActive: true });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save tour type');
    }
  };

  const handleSaveLanguage = async () => {
    if (!langForm.code || !langForm.name) {
      showToast('Language code and name are required');
      return;
    }
    try {
      await dispatch(
        createLanguage({
          code: langForm.code,
          name: langForm.name,
          colorHex: langForm.colorHex ?? '#27AE60',
          rateModifier: Number(langForm.rateModifier ?? 0),
          isActive: true,
        }),
      ).unwrap();
      showToast('✓ Language saved');
      setShowLangForm(false);
      setLangForm({ code: '', name: '', colorHex: '#27AE60', rateModifier: 0, isActive: true });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save language');
    }
  };

  const loading = tourTypeStatus === 'loading' || languageStatus === 'loading';

  return (
    <div>
      <PageHeader title={meta.title} />

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

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
          {tourTypes.map((tour) => (
            <SettingsRow
              key={tour.tourTypeId}
              icon="🏛️"
              title={tour.name ?? 'Unnamed'}
              sub={`€${(tour.basePrice ?? 0).toFixed(2)} · ${Math.round((tour.durationMinutes ?? 0) / 60)}h`}
              action={
                <AppButton
                  variant="secondary"
                  onClick={() => {
                    void dispatch(
                      updateTourType({
                        ...tour,
                        isActive: !(tour.isActive ?? true),
                      }),
                    );
                    showToast('Tour type updated');
                  }}
                >
                  Toggle Active
                </AppButton>
              }
            />
          ))}
          {showTourForm && (
            <div style={{ marginTop: 12 }}>
              <FormGrid>
              <FormInput
                label="Name"
                value={tourForm.name ?? ''}
                onChange={(e) => setTourForm((f) => ({ ...f, name: e.target.value }))}
              />
              <FormInput
                label="Base Price (€)"
                type="number"
                value={tourForm.basePrice ?? 0}
                onChange={(e) => setTourForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
              />
              <FormInput
                label="Duration (minutes)"
                type="number"
                value={tourForm.durationMinutes ?? 120}
                onChange={(e) =>
                  setTourForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))
                }
              />
              <AppButton variant="primary" onClick={() => void handleSaveTourType()}>
                Save Tour Type
              </AppButton>
              </FormGrid>
            </div>
          )}
          <AppButton
            variant="secondary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => setShowTourForm((v) => !v)}
          >
            + Add Tour Type
          </AppButton>
        </AppCard>

        <AppCard title="Language Settings">
          {languages.map((lang) => (
            <SettingsRow
              key={lang.languageId}
              icon={
                <span
                  style={{
                    display: 'block',
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: lang.colorHex ?? '#ccc',
                    opacity: lang.isActive !== false ? 1 : 0.45,
                  }}
                />
              }
              title={lang.name ?? lang.code ?? ''}
              sub={
                lang.rateModifier != null && lang.rateModifier > 0
                  ? `${lang.colorHex ?? ''} · +${lang.rateModifier}%`
                  : (lang.colorHex ?? '')
              }
              action={
                <>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: lang.isActive !== false ? 'var(--g600)' : 'var(--text-muted)',
                      marginRight: 8,
                      minWidth: 52,
                      textAlign: 'right',
                    }}
                  >
                    {lang.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  <ToggleSwitch
                    checked={lang.isActive !== false}
                    onCheckedChange={(checked) => {
                      void dispatch(
                        updateLanguage({
                          ...lang,
                          isActive: checked,
                        }),
                      );
                      showToast(checked ? 'Language activated' : 'Language deactivated');
                    }}
                    aria-label={`${lang.name ?? lang.code} active status`}
                  />
                </>
              }
            />
          ))}
          {showLangForm && (
            <div style={{ marginTop: 12 }}>
              <FormGrid>
              <FormInput
                label="Code"
                value={langForm.code ?? ''}
                onChange={(e) => setLangForm((f) => ({ ...f, code: e.target.value }))}
              />
              <FormInput
                label="Name"
                value={langForm.name ?? ''}
                onChange={(e) => setLangForm((f) => ({ ...f, name: e.target.value }))}
              />
              <FormInput
                label="Color Hex"
                value={langForm.colorHex ?? ''}
                onChange={(e) => setLangForm((f) => ({ ...f, colorHex: e.target.value }))}
              />
              <FormInput
                label="Rate Modifier (%)"
                type="number"
                value={langForm.rateModifier ?? 0}
                onChange={(e) =>
                  setLangForm((f) => ({ ...f, rateModifier: Number(e.target.value) }))
                }
              />
              <AppButton variant="primary" onClick={() => void handleSaveLanguage()}>
                Save Language
              </AppButton>
              </FormGrid>
            </div>
          )}
          <AppButton
            variant="secondary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => setShowLangForm((v) => !v)}
          >
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
            onClick={() => showToast('Add admin user — auth phase')}
          >
            + Add Admin User
          </AppButton>
        </AppCard>
      </div>
    </div>
  );
}
