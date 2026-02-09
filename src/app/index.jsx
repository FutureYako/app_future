import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { useQuery } from "@tanstack/react-query";
import useTheme from "@/utils/theme";

export default function Index() {
  const { isReady, auth } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  // Check onboarding status if user is authenticated
  const { data: onboardingStatus, isLoading: onboardingLoading } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const res = await fetch("/api/onboarding/status");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isReady && !!auth,
  });

  // Show loading while auth or onboarding status is being determined
  if (!isReady || (auth && onboardingLoading)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Not authenticated - show auth modal via tabs
  if (!auth) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  // Authenticated but onboarding not complete
  if (onboardingStatus && !onboardingStatus.onboardingCompleted) {
    const step = onboardingStatus.step || "bank_account";
    return <Redirect href={`/onboarding/${step}`} />;
  }

  // Authenticated and onboarding complete
  return <Redirect href="/(tabs)/dashboard" />;
}
