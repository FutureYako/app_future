import React from "react";
import { useColorScheme } from "react-native";

const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: {
      primary: "#22C55E", // Green
      secondary: "#3B82F6", // Blue
      background: isDark ? "#121212" : "#FFFFFF",
      surface: isDark ? "#1E1E1E" : "#FFFFFF",
      surfaceSecondary: isDark ? "#262626" : "#F9FAFB",
      text: isDark ? "#F9FAFB" : "#111827",
      textSecondary: isDark ? "#9CA3AF" : "#4B5563",
      textMuted: isDark ? "#6B7280" : "#9CA3AF",
      border: isDark ? "#374151" : "#E5E7EB",
      borderLight: isDark ? "#262626" : "#F3F4F6",
      input: isDark ? "#262626" : "#F3F4F6",
      error: "#EF4444",
      success: "#10B981",
      avatar: isDark ? "#374151" : "#E5E7EB",
      modal: isDark ? "#1E1E1E" : "#FFFFFF",
      primaryMuted: isDark
        ? "rgba(34, 197, 94, 0.2)"
        : "rgba(34, 197, 94, 0.1)",
      statusBar: isDark ? "light" : "dark",
    },
  };
};

export default useTheme;
