import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  User,
  Settings,
  Bell,
  Shield,
  LogOut,
  CreditCard,
  Target,
  ChevronRight,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useTheme from "@/utils/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      return res.json();
    },
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      return res.json();
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings) => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const toggleAutoDeduction = () => {
    updateSettings.mutate({
      ...settings,
      is_enabled: !settings.is_enabled,
    });
  };

  const changeDeductionValue = () => {
    Alert.prompt(
      "Set Deduction Amount",
      `Current: ${settings.deduction_type === "percentage" ? settings.amount + "%" : "TZS " + settings.amount}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (val) => {
            const num = Number(val);
            if (isNaN(num) || num < 0) return;
            updateSettings.mutate({ ...settings, amount: num });
          },
        },
      ],
    );
  };

  if (settingsLoading) {
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            paddingTop: insets.top + 20,
            paddingBottom: 40,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: "rgba(255,255,255,0.3)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Text
                style={{ fontSize: 24, fontWeight: "800", color: "#FFFFFF" }}
              >
                {user?.full_name?.charAt(0)}
              </Text>
            </View>
            <View>
              <Text
                style={{ fontSize: 22, fontWeight: "700", color: "#FFFFFF" }}
              >
                {user?.full_name}
              </Text>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 20, marginTop: -20 }}>
          {/* Auto Deduction Settings */}
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 24,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.colors.text,
                marginBottom: 20,
              }}
            >
              Auto Habit Settings
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <View>
                <Text style={{ fontWeight: "600", color: theme.colors.text }}>
                  Automatic Deduction
                </Text>
                <Text
                  style={{ fontSize: 12, color: theme.colors.textSecondary }}
                >
                  Deduct money on every deposit
                </Text>
              </View>
              <Switch
                value={settings?.is_enabled}
                onValueChange={toggleAutoDeduction}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={changeDeductionValue}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: theme.colors.surfaceSecondary,
                padding: 16,
                borderRadius: 16,
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 12, color: theme.colors.textSecondary }}
                >
                  Deduction Rate
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: theme.colors.text,
                  }}
                >
                  {settings?.deduction_type === "percentage"
                    ? `${settings?.amount}%`
                    : `TZS ${Number(settings?.amount).toLocaleString()}`}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  padding: 8,
                  borderRadius: 10,
                }}
              >
                <Target size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Other Settings */}
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 24,
              padding: 8,
              marginBottom: 24,
            }}
          >
            {[
              { label: "Payment Methods", icon: CreditCard },
              { label: "Security", icon: Shield },
              { label: "Notifications", icon: Bell },
              { label: "App Settings", icon: Settings },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: theme.colors.surfaceSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <item.icon size={20} color={theme.colors.textSecondary} />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {item.label}
                </Text>
                <ChevronRight size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.error + "30",
            }}
          >
            <LogOut
              size={20}
              color={theme.colors.error}
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: theme.colors.error, fontWeight: "700" }}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
