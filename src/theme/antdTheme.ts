import type { ThemeConfig } from 'antd';
import { tokens } from './tokens';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: tokens.colorPrimary,
    colorSuccess: tokens.colorPrimary,
    colorInfo: tokens.blue,
    colorError: tokens.red,
    colorWarning: tokens.orange,
    borderRadius: tokens.borderRadius,
    fontFamily: tokens.fontFamily,
    colorBgLayout: tokens.contentBg,
    colorBgContainer: tokens.cardBg,
    colorText: tokens.textPrimary,
    colorTextSecondary: tokens.textSecondary,
    colorBorder: tokens.borderColor,
  },
  components: {
    Layout: {
      siderBg: tokens.sidebarBg,
      headerBg: tokens.cardBg,
      bodyBg: tokens.contentBg,
      headerHeight: 56,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.14)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.07)',
      itemBorderRadius: 8,
      itemHeight: 38,
    },
    Button: {
      primaryShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
      controlHeight: 36,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Tag: {
      borderRadiusSM: 999,
    },
  },
};
