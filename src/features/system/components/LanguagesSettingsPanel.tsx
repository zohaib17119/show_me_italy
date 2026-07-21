import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { Language } from '@/api/types';
import {
  AppButton,
  AppCard,
  FormGrid,
  FormInput,
  SettingsRow,
  SettingsRowMenu,
  ToggleSwitch,
  showToast,
} from '@/components/ui';
import {
  createLanguage,
  deleteLanguage,
  fetchLanguages,
  selectLanguages,
  updateLanguage,
} from '@/features/language/languageSlice';
import styles from '../settings.module.css';

const emptyLangForm = (): Partial<Language> => ({
  code: '',
  name: '',
  colorHex: '#27AE60',
  rateModifier: 0,
  isActive: true,
});

export function LanguagesSettingsPanel() {
  const dispatch = useAppDispatch();
  const languages = useAppSelector(selectLanguages);

  const [langModalOpen, setLangModalOpen] = useState(false);
  const [langForm, setLangForm] = useState<Partial<Language>>(emptyLangForm());
  const [editingLangId, setEditingLangId] = useState<number | null>(null);

  useEffect(() => {
    void dispatch(fetchLanguages());
  }, [dispatch]);

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

  const handleDeleteLang = async (id: number) => {
    try {
      await dispatch(deleteLanguage(id)).unwrap();
      showToast('Language deleted');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete language');
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Languages</h2>
          <p className={styles.panelSub}>Language codes, colors, and rate modifiers</p>
        </div>
        <AppButton variant="secondary" onClick={openCreateLang}>
          + Add Language
        </AppButton>
      </div>

      <AppCard>
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
        {languages.length === 0 && (
          <p className={styles.panelSub}>No languages yet.</p>
        )}
      </AppCard>

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
