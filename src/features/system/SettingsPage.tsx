import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { Language, TourType } from '@/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  FormGrid,
  FormInput,
  FormTextarea,
  LoadingOverlay,
  SettingsRow,
  SettingsRowMenu,
  ToggleSwitch,
  showToast,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { MOCK_ADMIN_USERS } from '@/mocks';
import {
  createLanguage,
  deleteLanguage,
  fetchLanguages,
  selectLanguages,
  selectLanguageStatus,
  updateLanguage,
} from '@/features/language/languageSlice';
import {
  createTourType,
  deleteTourType,
  fetchTourTypes,
  selectTourTypes,
  selectTourTypeStatus,
  updateTourType,
} from '@/features/tourType/tourTypeSlice';

const emptyTourForm = (): Partial<TourType> => ({
  name: '',
  description: '',
  location: 'Rome',
  meetingPointName: '',
  meetingPointAddress: '',
  basePrice: 70,
  durationMinutes: 150,
  isActive: true,
});

const emptyLangForm = (): Partial<Language> => ({
  code: '',
  name: '',
  colorHex: '#27AE60',
  rateModifier: 0,
  isActive: true,
});

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.SETTINGS);
  const tourTypes = useAppSelector(selectTourTypes);
  const languages = useAppSelector(selectLanguages);
  const tourTypeStatus = useAppSelector(selectTourTypeStatus);
  const languageStatus = useAppSelector(selectLanguageStatus);

  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [tourForm, setTourForm] = useState<Partial<TourType>>(emptyTourForm());
  const [langForm, setLangForm] = useState<Partial<Language>>(emptyLangForm());
  const [editingTourId, setEditingTourId] = useState<number | null>(null);
  const [editingLangId, setEditingLangId] = useState<number | null>(null);

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
  }, [dispatch]);

  const openCreateTour = () => {
    setEditingTourId(null);
    setTourForm(emptyTourForm());
    setTourModalOpen(true);
  };

  const openEditTour = (tour: TourType) => {
    setEditingTourId(tour.tourTypeId ?? null);
    setTourForm({ ...tour });
    setTourModalOpen(true);
  };

  const openCreateLang = () => {
    setEditingLangId(null);
    setLangForm(emptyLangForm());
    setLangModalOpen(true);
  };

  const openEditLang = (lang: Language) => {
    setEditingLangId(lang.languageId ?? null);
    setLangForm({ ...lang });
    setLangModalOpen(true);
  };

  const handleSaveTourType = async () => {
    if (!tourForm.name?.trim()) {
      showToast('Tour type name is required');
      return;
    }
    const payload: TourType = {
      tourTypeId: editingTourId ?? undefined,
      name: tourForm.name.trim(),
      description: tourForm.description ?? '',
      location: tourForm.location ?? 'Rome',
      meetingPointName: tourForm.meetingPointName ?? tourForm.name.trim(),
      meetingPointAddress: tourForm.meetingPointAddress ?? '',
      basePrice: Number(tourForm.basePrice ?? 0),
      durationMinutes: Number(tourForm.durationMinutes ?? 120),
      isActive: tourForm.isActive !== false,
    };
    try {
      if (editingTourId != null) {
        await dispatch(updateTourType(payload)).unwrap();
        showToast('✓ Tour type updated');
      } else {
        await dispatch(createTourType(payload)).unwrap();
        showToast('✓ Tour type saved');
      }
      setTourModalOpen(false);
      setTourForm(emptyTourForm());
      setEditingTourId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save tour type');
    }
  };

  const handleSaveLanguage = async () => {
    if (!langForm.code?.trim() || !langForm.name?.trim()) {
      showToast('Language code and name are required');
      return;
    }
    const payload: Language = {
      languageId: editingLangId ?? undefined,
      code: langForm.code.trim().toUpperCase(),
      name: langForm.name.trim(),
      colorHex: langForm.colorHex ?? '#27AE60',
      rateModifier: Number(langForm.rateModifier ?? 0),
      isActive: langForm.isActive !== false,
    };
    try {
      if (editingLangId != null) {
        await dispatch(updateLanguage(payload)).unwrap();
        showToast('✓ Language updated');
      } else {
        await dispatch(createLanguage(payload)).unwrap();
        showToast('✓ Language saved');
      }
      setLangModalOpen(false);
      setLangForm(emptyLangForm());
      setEditingLangId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save language');
    }
  };

  const handleDeleteTour = async (id: number) => {
    try {
      await dispatch(deleteTourType(id)).unwrap();
      showToast('Tour type deleted');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete tour type');
    }
  };

  const handleDeleteLang = async (id: number) => {
    try {
      await dispatch(deleteLanguage(id)).unwrap();
      showToast('Language deleted');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete language');
    }
  };

  const loading = tourTypeStatus === 'loading' || languageStatus === 'loading';

  return (
    <div>
      <LoadingOverlay visible={loading} />
      <PageHeader title={meta.title} />

      <div className="layoutThreeCol">
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: tour.isActive !== false ? 'var(--g600)' : 'var(--text-muted)',
                      minWidth: 52,
                      textAlign: 'right',
                      opacity: tour.isActive !== false ? 1 : 0.65,
                    }}
                  >
                    {tour.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  <ToggleSwitch
                    checked={tour.isActive !== false}
                    onCheckedChange={(checked) => {
                      void dispatch(
                        updateTourType({
                          ...tour,
                          isActive: checked,
                        }),
                      );
                      showToast(checked ? 'Tour type activated' : 'Tour type deactivated');
                    }}
                    aria-label={`${tour.name ?? 'Tour type'} active status`}
                  />
                  <SettingsRowMenu
                    onEdit={() => openEditTour(tour)}
                    onDelete={() => {
                      if (tour.tourTypeId != null) void handleDeleteTour(tour.tourTypeId);
                    }}
                    deleteTitle={`Delete ${tour.name ?? 'tour type'}?`}
                    deleteContent="This tour type will be removed permanently."
                  />
                </div>
              }
            />
          ))}
          <AppButton
            variant="secondary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={openCreateTour}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: lang.isActive !== false ? 'var(--g600)' : 'var(--text-muted)',
                      minWidth: 52,
                      textAlign: 'right',
                      opacity: lang.isActive !== false ? 1 : 0.65,
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
                  <SettingsRowMenu
                    onEdit={() => openEditLang(lang)}
                    onDelete={() => {
                      if (lang.languageId != null) void handleDeleteLang(lang.languageId);
                    }}
                    deleteTitle={`Delete ${lang.name ?? lang.code}?`}
                    deleteContent="This language will be removed permanently."
                  />
                </div>
              }
            />
          ))}
          <AppButton
            variant="secondary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={openCreateLang}
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

      <Modal
        title={editingTourId != null ? 'Edit Tour Type' : 'Add Tour Type'}
        open={tourModalOpen}
        onCancel={() => setTourModalOpen(false)}
        footer={[
          <AppButton key="cancel" variant="secondary" onClick={() => setTourModalOpen(false)}>
            Cancel
          </AppButton>,
          <AppButton key="save" onClick={() => void handleSaveTourType()}>
            Save
          </AppButton>,
        ]}
        destroyOnClose
      >
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
          <FormInput
            label="Location"
            value={tourForm.location ?? ''}
            onChange={(e) => setTourForm((f) => ({ ...f, location: e.target.value }))}
          />
          <FormInput
            label="Meeting Point Name"
            value={tourForm.meetingPointName ?? ''}
            onChange={(e) => setTourForm((f) => ({ ...f, meetingPointName: e.target.value }))}
          />
          <FormInput
            label="Meeting Point Address"
            value={tourForm.meetingPointAddress ?? ''}
            onChange={(e) => setTourForm((f) => ({ ...f, meetingPointAddress: e.target.value }))}
          />
          <FormTextarea
            label="Description"
            value={tourForm.description ?? ''}
            onChange={(e) => setTourForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
          />
        </FormGrid>
      </Modal>

      <Modal
        title={editingLangId != null ? 'Edit Language' : 'Add Language'}
        open={langModalOpen}
        onCancel={() => setLangModalOpen(false)}
        footer={[
          <AppButton key="cancel" variant="secondary" onClick={() => setLangModalOpen(false)}>
            Cancel
          </AppButton>,
          <AppButton key="save" onClick={() => void handleSaveLanguage()}>
            Save
          </AppButton>,
        ]}
        destroyOnClose
      >
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
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 6,
              }}
            >
              Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={langForm.colorHex ?? '#27AE60'}
                onChange={(e) => setLangForm((f) => ({ ...f, colorHex: e.target.value }))}
                style={{ width: 40, height: 32, padding: 0, border: 'none', cursor: 'pointer' }}
              />
              <FormInput
                value={langForm.colorHex ?? '#27AE60'}
                readOnly
                style={{ flex: 1 }}
              />
            </div>
          </div>
          <FormInput
            label="Rate Modifier (%)"
            type="number"
            value={langForm.rateModifier ?? 0}
            onChange={(e) =>
              setLangForm((f) => ({ ...f, rateModifier: Number(e.target.value) }))
            }
          />
        </FormGrid>
      </Modal>
    </div>
  );
}
