// Luxury Glassmorphism Styles
export const luxuryStyles = {
  // Glass cards - premium frosted effect
  glassCard: (theme) => ({
    background: theme.bg.glass,
    border: `1px solid ${theme.border.light}`,
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    boxShadow: theme.shadow.md,
  }),

  // Heavy glass panels
  glassPanel: (theme) => ({
    background: theme.bg.glassHeavy,
    border: `1px solid ${theme.border.light}`,
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    boxShadow: theme.shadow.lg,
  }),

  // Buttons
  buttonPrimary: (theme) => ({
    background: theme.gradient.primary,
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 20px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: `0 4px 15px -3px rgba(167, 139, 250, 0.3)`,
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: `0 6px 20px -3px rgba(167, 139, 250, 0.4)`,
    },
  }),

  buttonSecondary: (theme) => ({
    background: theme.bg.tertiary,
    border: `1px solid ${theme.border.light}`,
    color: theme.text.primary,
    borderRadius: "12px",
    padding: "10px 20px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      background: theme.bg.secondary,
    },
  }),

  // Input fields
  input: (theme) => ({
    background: theme.bg.tertiary,
    border: `1.5px solid ${theme.border.light}`,
    color: theme.text.primary,
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    "&:focus": {
      outline: "none",
      border: `1.5px solid ${theme.accent.primary}`,
      boxShadow: `0 0 0 3px ${theme.isDark ? "rgba(167, 139, 250, 0.1)" : "rgba(139, 92, 246, 0.1)"}`,
    },
    "&::placeholder": {
      color: theme.text.tertiary,
    },
  }),

  // Select dropdowns
  select: (theme) => ({
    background: theme.bg.tertiary,
    border: `1.5px solid ${theme.border.light}`,
    color: theme.text.primary,
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.3s ease",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${theme.isDark ? "%23a78bfa" : "%238b5cf6"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    paddingRight: "32px",
    "&:focus": {
      outline: "none",
      border: `1.5px solid ${theme.accent.primary}`,
      boxShadow: `0 0 0 3px ${theme.isDark ? "rgba(167, 139, 250, 0.1)" : "rgba(139, 92, 246, 0.1)"}`,
    },
  }),

  // Gradients for badges
  badgeGradient: (color) => ({
    background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
    border: `1px solid ${color}40`,
    borderRadius: "8px",
  }),

  // Luxury header
  luxuryHeader: (theme) => ({
    background: theme.bg.glass,
    border: `1px solid ${theme.border.light}`,
    backdropFilter: "blur(12px)",
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "16px",
    marginBottom: "24px",
  }),

  // Grid container
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },

  // Empty state
  emptyState: (theme) => ({
    background: theme.bg.glass,
    border: `1.5px dashed ${theme.border.medium}`,
    borderRadius: "16px",
    padding: "48px 24px",
    textAlign: "center",
    color: theme.text.tertiary,
  }),

  // Transition class (for Tailwind)
  transition: "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
};

// Premium spacing scale
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
};

// Premium border radius
export const borderRadius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "9999px",
};
