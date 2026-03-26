/**
 * Colors and Design System Tones from DESIGN.md
 */

const primary = '#0058bc';
const primaryContainer = '#0070eb';

export const Colors = {
  light: {
    // Primary tones
    primary: primary,
    primaryContainer: primaryContainer,
    onPrimary: '#ffffff',
    onPrimaryContainer: '#ffffff',

    // Surface Hierarchy (The "Digital Atoll")
    surface: '#faf9fe', // Base Layer
    surfaceContainer: '#eeedf3', // Sectioning
    surfaceContainerLow: '#f4f3f8', // For card contrast without borders
    surfaceContainerLowest: '#ffffff', // Content Cards
    surfaceContainerHigh: '#e9e7ed', // Interaction Layers
    surfaceContainerHighest: '#e3e2e7', // Input Fields

    // Typography
    onSurface: '#1a1b1f', // Main text (authoritative, deep navy)
    onSurfaceVariant: '#414755', // Body text (reduced eye strain)

    // Elements
    outlineVariant: 'rgba(193, 198, 215, 0.15)', // Ghost Border
    secondaryContainer: '#9fc2fe',
    onSecondaryContainer: '#294f83',

    // Custom
    signatureGradient: [primary, primaryContainer] as const,
    ambientShadow: 'rgba(0, 88, 188, 0.08)',
  },
  dark: {
    // Basic dark fallback (could be expanded based on "Digital Atoll" requirements)
    primary: '#adc6ff', // primary-fixed-dim
    primaryContainer: '#004494',
    surface: '#111318',
    onSurface: '#e2e2e9',
    onSurfaceVariant: '#c4c6d0',
  },
};
