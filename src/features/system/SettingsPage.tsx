import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/app/hooks';
import { selectAuthPermissions } from '@/features/auth/authSlice';
import { hasPermission } from '@/features/auth/permissions';
import { SETTINGS_PANEL_PERMISSIONS } from '@/features/auth/routePermissions';
import { AdminUsersSettingsPanel } from './components/AdminUsersSettingsPanel';
import { LanguagesSettingsPanel } from './components/LanguagesSettingsPanel';
import { RolesPermissionsPanel } from './components/RolesPermissionsPanel';
import { TourTypesSettingsPanel } from './components/TourTypesSettingsPanel';
import styles from './settings.module.css';

type SettingsPanelKey = 'tourTypes' | 'languages' | 'adminUsers' | 'roles';

const SETTINGS_NAV: { key: SettingsPanelKey; label: string }[] = [
  { key: 'tourTypes', label: 'Tour Types' },
  { key: 'languages', label: 'Languages' },
  { key: 'adminUsers', label: 'Admin Users' },
  { key: 'roles', label: 'Roles & Permissions' },
];

export function SettingsPage() {
  const meta = getRouteMeta(ROUTES.SETTINGS);
  const permissions = useAppSelector(selectAuthPermissions);

  const allowedNav = useMemo(
    () =>
      SETTINGS_NAV.filter((item) =>
        hasPermission(permissions, SETTINGS_PANEL_PERMISSIONS[item.key]),
      ),
    [permissions],
  );

  const [activePanel, setActivePanel] = useState<SettingsPanelKey | null>(null);

  useEffect(() => {
    if (allowedNav.length === 0) {
      setActivePanel(null);
      return;
    }
    setActivePanel((prev) => {
      if (prev && allowedNav.some((item) => item.key === prev)) return prev;
      return allowedNav[0].key;
    });
  }, [allowedNav]);

  return (
    <div>
      <PageHeader title={meta.title} subtitle={meta.subtitle} />

      {allowedNav.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          You do not have permission to manage any settings sections.
        </p>
      ) : (
        <div className={styles.layout}>
          <nav className={styles.sideNav} aria-label="Settings sections">
            <div className={styles.sideNavLabel}>Settings</div>
            {allowedNav.map((item) => (
              <button
                key={item.key}
                type="button"
                className={[
                  styles.sideNavItem,
                  activePanel === item.key ? styles.sideNavItemActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActivePanel(item.key)}
                aria-current={activePanel === item.key ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className={styles.panel}>
            {activePanel === 'tourTypes' && <TourTypesSettingsPanel />}
            {activePanel === 'languages' && <LanguagesSettingsPanel />}
            {activePanel === 'adminUsers' && <AdminUsersSettingsPanel />}
            {activePanel === 'roles' && <RolesPermissionsPanel />}
          </div>
        </div>
      )}
    </div>
  );
}
