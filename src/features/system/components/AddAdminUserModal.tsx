import { useEffect, useMemo, useState } from 'react';
import { Modal, Spin } from 'antd';
import { getApiErrorMessage } from '@/api/axiosInstance';
import type { SignUpAdminPayload } from '@/api/types/adminSignUp';
import {
  AppButton,
  FormGrid,
  FormInput,
  FormSelect,
  showToast,
} from '@/components/ui';
import { agentApi } from '@/features/agent/agentApi';
import { adminRoleApi } from '@/features/system/adminRoleApi';

export interface AddAdminUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const emptyForm = () => ({
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  roleId: '',
});

export function AddAdminUserModal({ open, onClose, onSuccess }: AddAdminUserModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
      setSaving(false);
      return;
    }

    let cancelled = false;
    setLoadingRoles(true);
    void (async () => {
      try {
        const list = await adminRoleApi.getRoles();
        if (cancelled) return;
        setRoles(list.map((r) => ({ value: r.id, label: r.name })));
      } catch (err) {
        if (!cancelled) {
          setRoles([]);
          showToast(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingRoles(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const roleOptions = useMemo(
    () => [{ value: '', label: 'Select role', disabled: true }, ...roles],
    [roles],
  );

  const handleSubmit = async () => {
    if (saving) return;
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phoneNumber = form.phoneNumber.trim();
    const password = form.password;
    const roleId = form.roleId.trim();

    if (!fullName) {
      showToast('Full name is required');
      return;
    }
    if (!email) {
      showToast('Email is required');
      return;
    }
    if (!phoneNumber) {
      showToast('Phone number is required');
      return;
    }
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    if (!roleId) {
      showToast('Role is required');
      return;
    }

    const payload: SignUpAdminPayload = {
      fullName,
      email,
      phoneNumber,
      roleId,
      tourGuideLicenseOrCertificationNo: '',
      password,
      certificateUpload: '',
      languagesYouSpeak: [],
      deviceToken: '',
    };

    setSaving(true);
    try {
      await agentApi.signUpAdmin(payload);
      showToast('User created successfully');
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
      title="Add Admin User"
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
        <AppButton key="save" onClick={() => void handleSubmit()} disabled={saving || loadingRoles}>
          {saving ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Spin size="small" />
              Creating…
            </span>
          ) : (
            'Create Admin'
          )}
        </AppButton>,
      ]}
      destroyOnClose
    >
      <FormGrid>
        <FormInput
          label="Full name"
          value={form.fullName}
          disabled={saving}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        />
        <FormInput
          label="Email"
          type="email"
          value={form.email}
          disabled={saving}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <FormInput
          label="Phone number"
          value={form.phoneNumber}
          disabled={saving}
          onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
        />
        <FormInput
          label="Password"
          type="password"
          value={form.password}
          disabled={saving}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <FormSelect
          label="Role"
          value={form.roleId}
          disabled={saving || loadingRoles}
          options={roleOptions}
          onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
        />
      </FormGrid>
    </Modal>
  );
}
