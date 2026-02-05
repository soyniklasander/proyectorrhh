import type { GlobalThemeOverrides } from 'naive-ui'

/**
 * Apple Design System Theme for Naive UI
 * Based on Apple's Human Interface Guidelines
 * Colors, typography, and visual style matching macOS/iOS aesthetic
 */

export const appleColors = {
  // Primary Apple Blue
  primary: '#007AFF',
  primaryHover: '#0051D5',
  primaryPressed: '#0043B0',
  
  // System Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  
  // Grays
  gray100: '#F5F5F7',
  gray200: '#E8E8ED',
  gray300: '#D2D2D7',
  gray400: '#86868B',
  gray500: '#6E6E73',
  gray600: '#424245',
  gray700: '#1D1D1F',
  
  // Backgrounds
  background: '#F5F5F7',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  
  // Text
  textPrimary: '#1D1D1F',
  textSecondary: '#86868B',
  textTertiary: '#6E6E73',
  textInverse: '#FFFFFF',
  
  // Borders
  border: 'rgba(0, 0, 0, 0.08)',
  borderHover: 'rgba(0, 0, 0, 0.15)',
  divider: 'rgba(0, 0, 0, 0.08)',
  
  // Accents
  indigo: '#5856D6',
  purple: '#AF52DE',
  pink: '#FF2D55',
  teal: '#5AC8FA',
  yellow: '#FFCC00',
}

export const appleBorderRadius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
}

export const appleShadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 4px 16px rgba(0, 0, 0, 0.08)',
  lg: '0 12px 48px rgba(0, 0, 0, 0.12)',
  elevated: '0 20px 60px rgba(0, 0, 0, 0.15)',
}

export const appleTypography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontMono: '"SF Mono", SFMono-Regular, ui-monospace, Menlo, Monaco, monospace',
  letterSpacing: {
    tight: '-0.03em',
    normal: '-0.02em',
    wide: '-0.01em',
    looser: '0.03em',
  },
}

export const appleTransitions = {
  default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.15s ease',
  slow: 'all 0.3s ease',
  button: 'transform 0.15s ease, background 0.15s ease',
  card: 'transform 0.2s ease, box-shadow 0.2s ease',
}

/**
 * Naive UI Theme Overrides - Apple Style
 * This configuration customizes Naive UI components to match Apple Design
 */
export const appleThemeOverrides: GlobalThemeOverrides = {
  common: {
    // Primary colors
    primaryColor: appleColors.primary,
    primaryColorHover: appleColors.primaryHover,
    primaryColorPressed: appleColors.primaryPressed,
    primaryColorSuppl: appleColors.primaryHover,
    
    // Info colors
    infoColor: appleColors.info,
    infoColorHover: '#4FB8F0',
    infoColorPressed: '#3B9AC7',
    infoColorSuppl: appleColors.info,
    
    // Success colors
    successColor: appleColors.success,
    successColorHover: '#30B350',
    successColorPressed: '#24923D',
    successColorSuppl: appleColors.success,
    
    // Warning colors
    warningColor: appleColors.warning,
    warningColorHover: '#E68600',
    warningColorPressed: '#B36A00',
    warningColorSuppl: appleColors.warning,
    
    // Error colors
    errorColor: appleColors.error,
    errorColorHover: '#D70015',
    errorColorPressed: '#AA0010',
    errorColorSuppl: appleColors.error,
    
    // Border radius
    borderRadius: appleBorderRadius.md,
    borderRadiusSmall: appleBorderRadius.sm,
    borderRadiusMedium: appleBorderRadius.md,
    borderRadiusLarge: appleBorderRadius.lg,
    
    // Typography
    fontFamily: appleTypography.fontFamily,
    fontWeight: '400',
    fontWeightStrong: '600',
    
    // Line height
    lineHeight: '1.5',
    
    // Heights
    heightSmall: '32px',
    heightMedium: '40px',
    heightLarge: '48px',
    
    // Font sizes
    fontSize: '15px',
    fontSizeSmall: '13px',
    fontSizeMedium: '15px',
    fontSizeLarge: '17px',
    fontSizeHuge: '20px',
    
    // Transitions
    cubicBezierEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    cubicBezierEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
    cubicBezierEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  
  // Button overrides
  Button: {
    borderRadiusSmall: appleBorderRadius.sm,
    borderRadiusMedium: appleBorderRadius.md,
    borderRadiusLarge: appleBorderRadius.md,
    fontWeight: '500',
    paddingSmall: '0 12px',
    paddingMedium: '0 16px',
    paddingLarge: '0 20px',
  },
  
  // Card overrides
  Card: {
    borderRadius: appleBorderRadius.lg,
    paddingSmall: '16px',
    paddingMedium: '24px',
    paddingLarge: '32px',
  },
  
  // Input overrides
  Input: {
    borderRadius: appleBorderRadius.md,
    heightSmall: '36px',
    heightMedium: '44px',
    heightLarge: '52px',
    fontSizeSmall: '15px',
    fontSizeMedium: '16px',
    fontSizeLarge: '17px',
    paddingSmall: '0 12px',
    paddingMedium: '0 16px',
    paddingLarge: '0 16px',
  },
  
  // Select overrides
  Select: {
    borderRadius: appleBorderRadius.md,
  },
  
  // Tag overrides
  Tag: {
    borderRadius: appleBorderRadius.sm,
    borderRadiusRound: appleBorderRadius.full,
    fontSizeSmall: '12px',
    fontSizeMedium: '13px',
    fontSizeLarge: '15px',
  },
  
  // Modal overrides
  Modal: {
    borderRadius: appleBorderRadius.xl,
  },
  
  // Dialog overrides
  Dialog: {
    borderRadius: appleBorderRadius.xl,
    titleFontSize: '18px',
    titleFontWeight: '600',
  },
  
  // Menu overrides
  Menu: {
    borderRadius: appleBorderRadius.md,
    itemHeight: '44px',
    fontSize: '15px',
  },
  
  // Table overrides
  DataTable: {
    borderRadius: appleBorderRadius.lg,
    thFontWeight: '600',
    thPadding: '12px 16px',
    tdPadding: '16px',
    fontSizeSmall: '13px',
    fontSizeMedium: '14px',
    fontSizeLarge: '15px',
  },
  
  // Tabs overrides
  Tabs: {
    tabBorderRadius: appleBorderRadius.md,
    tabFontWeight: '500',
    tabFontWeightActive: '600',
  },
  
  // Pagination overrides
  Pagination: {
    itemBorderRadius: appleBorderRadius.md,
    itemSizeSmall: '32px',
    itemSizeMedium: '36px',
    itemSizeLarge: '40px',
  },
  
  // Checkbox overrides
  Checkbox: {
    borderRadius: appleBorderRadius.sm,
  },
  
  // Radio overrides
  Radio: {
    buttonBorderRadius: appleBorderRadius.md,
  },
  
  // Switch overrides
  Switch: {
    borderRadius: appleBorderRadius.full,
    buttonBorderRadius: appleBorderRadius.full,
  },
  
  // Slider overrides
  Slider: {
    borderRadius: appleBorderRadius.full,
    fillColor: appleColors.primary,
  },
  
  // DatePicker overrides
  DatePicker: {
    borderRadius: appleBorderRadius.md,
    panelBorderRadius: appleBorderRadius.lg,
  },
  
  // Tooltip overrides
  Tooltip: {
    borderRadius: appleBorderRadius.sm,
    padding: '8px 12px',
    fontSize: '13px',
  },
  
  // Popover overrides
  Popover: {
    borderRadius: appleBorderRadius.lg,
  },
  
  // Notification overrides
  Notification: {
    borderRadius: appleBorderRadius.lg,
  },
  
  // Message overrides
  Message: {
    borderRadius: appleBorderRadius.lg,
    padding: '12px 16px',
    fontSize: '14px',
  },
  
  // LoadingBar overrides
  LoadingBar: {
    borderRadius: appleBorderRadius.full,
    height: '3px',
    colorLoading: appleColors.primary,
  },
  
  // Skeleton overrides
  Skeleton: {
    borderRadius: appleBorderRadius.md,
    color: appleColors.gray200,
    colorEnd: appleColors.gray300,
  },
  
  // Progress overrides
  Progress: {
    borderRadius: appleBorderRadius.full,
    fillBorderRadius: appleBorderRadius.full,
  },
  
  // Avatar overrides
  Avatar: {
    borderRadius: appleBorderRadius.lg,
  },
  
  // Breadcrumb overrides
  Breadcrumb: {
    fontSize: '14px',
    itemTextColor: appleColors.textSecondary,
    itemTextColorHover: appleColors.primary,
    itemTextColorPressed: appleColors.primaryHover,
    itemTextColorActive: appleColors.textPrimary,
    separatorColor: appleColors.gray300,
  },
  
  // Dropdown overrides
  Dropdown: {
    borderRadius: appleBorderRadius.md,
    optionHeight: '40px',
    fontSize: '14px',
  },
  
  // Upload overrides
  Upload: {
    borderRadius: appleBorderRadius.lg,
  },
  
  // ColorPicker overrides
  ColorPicker: {
    borderRadius: appleBorderRadius.md,
  },
}

/**
 * Apple Dark Theme Overrides
 * For dark mode support
 */
export const appleDarkThemeOverrides: GlobalThemeOverrides = {
  ...appleThemeOverrides,
  common: {
    ...appleThemeOverrides.common,
    // Dark mode background colors
    baseColor: '#000000',
    popoverColor: '#1C1C1E',
    modalColor: '#1C1C1E',
    bodyColor: '#000000',
    cardColor: '#1C1C1E',
    tableColor: '#1C1C1E',
    tableColorHover: '#2C2C2E',
    tableHeaderColor: '#2C2C2E',
    tagColor: '#2C2C2E',
    avatarColor: '#2C2C2E',
    invertedColor: '#FFFFFF',
    inputColor: '#2C2C2E',
    inputColorDisabled: '#1C1C1E',
    buttonColor2: '#2C2C2E',
    buttonColor2Hover: '#3A3A3C',
    buttonColor2Pressed: '#48484A',
    
    // Text colors in dark mode
    textColor1: '#FFFFFF',
    textColor2: '#EBEBF5',
    textColor3: '#8E8E93',
    textColorDisabled: '#636366',
    
    // Border colors in dark mode
    borderColor: 'rgba(255, 255, 255, 0.1)',
    dividerColor: 'rgba(255, 255, 255, 0.1)',
    
    // Placeholder
    placeholderColor: '#8E8E93',
    placeholderColorDisabled: '#636366',
    
    // Icon colors
    iconColor: '#8E8E93',
    iconColorHover: '#EBEBF5',
    iconColorPressed: '#FFFFFF',
    iconColorDisabled: '#636366',
  },
}

export default appleThemeOverrides
