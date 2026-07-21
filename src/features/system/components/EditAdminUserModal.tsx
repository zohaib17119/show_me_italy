import { useEffect, useMemo, useState } from 'react';
import { Modal, Spin } from 'antd';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { toTourTypeImagePreview } from '@/api/utils/fileToBase64';
import type { UpdateAdminProfilePayload } from '@/api/types/adminProfile';
import {
  AppButton,
  FormGrid,
  FormInput,
  FormSelect,
  showToast,
} from '@/components/ui';
import { agentApi } from '@/features/agent/agentApi';
import { adminRoleApi } from '@/features/system/adminRoleApi';
import {
  AdminProfilePicturePicker,
  type AdminProfilePictureValue,
} from './AdminProfilePicturePicker';

export interface EditAdminUserModalProps {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const emptyForm = () => ({
  fullName: '',
  country: '',
  city: '',
  roleId: '',
});

const emptyProfilePicture = (): AdminProfilePictureValue => ({
  previewUrl: null,
  base64: null,
});

export function EditAdminUserModal({
  open,
  userId,
  onClose,
  onSuccess,
}: EditAdminUserModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [profilePicture, setProfilePicture] = useState<AdminProfilePictureValue>(emptyProfilePicture);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !userId) {
      setForm(emptyForm());
      setProfilePicture(emptyProfilePicture());
      setSaving(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setForm(emptyForm());
    setProfilePicture(emptyProfilePicture());

    void (async () => {
      try {
        const [roleList, adminRecords] = await Promise.all([
          adminRoleApi.getRoles(),
          agentApi.getAllAdmins(userId),
        ]);
        if (cancelled) return;

        setRoles(roleList.map((r) => ({ value: r.id, label: r.name })));

        const admin = adminRecords[0];
        let roleId = String(admin?.roleId ?? '').trim();

        if (!roleId) {
          const userRole = await adminRoleApi.getUserRole(userId);
          roleId = String(userRole?.roleId ?? '').trim();
        }

        const existingPicture = admin?.profilePicture?.trim();
        setForm({
          fullName: admin?.fullName?.trim() || '',
          country: admin?.country?.trim() || '',
          city: admin?.city?.trim() || '',
          roleId,
        });
        setProfilePicture(
          existingPicture
            ? {
                previewUrl: toTourTypeImagePreview(existingPicture, 0).previewUrl,
                base64: null,
              }
            : emptyProfilePicture(),
        );
      } catch (err) {
        if (!cancelled) {
          setRoles([]);
          showToast(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  const roleOptions = useMemo(
    () => [{ value: '', label: 'Select role', disabled: true }, ...roles],
    [roles],
  );

  const handleSubmit = async () => {
    if (saving || !userId) return;
    const fullName = form.fullName.trim();
    const country = form.country.trim();
    const city = form.city.trim();
    const roleId = form.roleId.trim();

    if (!fullName) {
      showToast('Full name is required');
      return;
    }
    if (!roleId) {
      showToast('Role is required');
      return;
    }

    const payload: UpdateAdminProfilePayload = {
      id: userId,
      fullName,
      country,
      city,
      tourGuideLicenseOrCertificationNo: '',
      certificateUpload: '',
      languagesYouSpeak: [],
      roleId,
    };

    if (profilePicture.base64) {
      payload.profilePicture = profilePicture.base64;
    }

    setSaving(true);
    try {
      await agentApi.updateAdminProfile(payload);
      showToast('User updated successfully');
      onClose();
      onSuccess?.();
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Edit Admin User"
      open={open}
      onCancel={() => {
        if (!saving) onClose();
      }}
      maskClosable={!saving}
      closable={!saving}
      width={520}
      footer={[
        <AppButton key="cancel" variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </AppButton>,
        <AppButton key="save" onClick={() => void handleSubmit()} disabled={saving || loading}>
          {saving ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Spin size="small" />
              Saving…
            </span>
          ) : (
            'Save Changes'
          )}
        </AppButton>,
      ]}
      destroyOnClose
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spin />
        </div>
      ) : (
        <FormGrid>
          <AdminProfilePicturePicker
            value={profilePicture}
            onChange={setProfilePicture}
            disabled={saving}
          />
          <FormInput
            label="Full name"
            value={form.fullName}
            disabled={saving}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <FormInput
            label="Country"
            value={form.country}
            disabled={saving}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          />
          <FormInput
            label="City"
            value={form.city}
            disabled={saving}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
          <FormSelect
            label="Role"
            value={form.roleId}
            disabled={saving}
            options={roleOptions}
            onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
          />
        </FormGrid>
      )}
    </Modal>
  );
}
