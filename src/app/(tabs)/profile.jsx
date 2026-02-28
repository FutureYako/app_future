import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
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
  RotateCcw,
} from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import useTheme from "@/utils/theme";
import { useSettingsStore } from "@/store/settingsStore";
import { useGoalsStore } from "@/store/goalsStore";
import { useDemoResetStore } from "@/store/demoResetStore";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    deduction_type,
    amount,
    is_enabled,
    setDeductionType,
    setAmount,
    toggleEnabled,
    duration_months,
    setDurationMonths,
  } = useSettingsStore();
  const resetGoals = useGoalsStore((s) => s.resetGoals);

  const handleStartFresh = () => {
    Alert.alert(
      "Start fresh for next demo",
      "This will reset savings (goals), auto-saving settings, and investment demo data so you can explain the app from scratch to the next person. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, start fresh",
          style: "destructive",
          onPress: () => {
            resetGoals();
            useSettingsStore.getState().resetToDemo();
            useDemoResetStore.getState().doReset();
            queryClient.invalidateQueries({ queryKey: ["investments"] });
            Alert.alert("Done", "App reset. You can now demo from a fresh state for the next person.");
          },
        },
      ]
    );
  };

  const [localAmount, setLocalAmount] = React.useState(
    amount != null ? String(amount) : "",
  );
  const [localDuration, setLocalDuration] = React.useState(
    duration_months != null ? String(duration_months) : "6",
  );

  React.useEffect(() => {
    setLocalAmount(amount != null ? String(amount) : "");
  }, [amount]);

  React.useEffect(() => {
    setLocalDuration(duration_months != null ? String(duration_months) : "6");
  }, [duration_months]);

  // simple prototype user data
  const user = {
    full_name: "Future Yako",
    email: "futureyako@gmail.com",
  };

  const toggleAutoDeduction = () => {
    toggleEnabled();
  };

  const handleChangeDeductionType = (type) => {
    if (!type || deduction_type === type) return;

    let nextAmount = amount;

    if (type === "percentage" && nextAmount > 100) {
      nextAmount = 100;
    }

    setDeductionType(type);
    setAmount(nextAmount);
  };

  const handleAmountChange = (val) => {
    setLocalAmount(val);

    const num = Number(val);
    if (isNaN(num) || num < 0) {
      return;
    }

    if (deduction_type === "percentage" && num > 100) {
      return;
    }

    setAmount(num);
  };

  const handleDurationChange = (val) => {
    setLocalDuration(val);

    const num = Number(val);
    if (isNaN(num)) return;

    const clamped = Math.max(6, Math.round(num));
    setDurationMonths(clamped);
  };

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
                marginBottom: 4,
              }}
            >
              Auto-Saving Rule
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginBottom: 16,
              }}
            >
              Decide how much should go straight to your portfolio every time
              you receive money.
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
                  When ON, we auto-save from each BOOM or salary.
                </Text>
              </View>
              <Switch
                value={is_enabled}
                onValueChange={toggleAutoDeduction}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Deduction Type
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() => handleChangeDeductionType("percentage")}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      deduction_type === "percentage"
                        ? theme.colors.primary
                        : theme.colors.borderLight,
                    backgroundColor:
                      deduction_type === "percentage"
                        ? theme.colors.primary + "10"
                        : theme.colors.surfaceSecondary,
                    marginRight: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color:
                        deduction_type === "percentage"
                          ? theme.colors.primary
                          : theme.colors.text,
                    }}
                  >
                    Percentage
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleChangeDeductionType("fixed")}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      deduction_type === "fixed"
                        ? theme.colors.primary
                        : theme.colors.borderLight,
                    backgroundColor:
                      deduction_type === "fixed"
                        ? theme.colors.primary + "10"
                        : theme.colors.surfaceSecondary,
                    marginLeft: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color:
                        deduction_type === "fixed"
                          ? theme.colors.primary
                          : theme.colors.text,
                    }}
                  >
                    Fixed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                marginTop: 8,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginBottom: 6,
                }}
              >
                Deduction amount
              </Text>
              <Text
                style={{ fontSize: 12, color: theme.colors.textSecondary }}
              >
                {deduction_type === "percentage"
                  ? "Type the percentage of each income you want to save."
                  : "Type the exact TZS amount you want to save from each income."}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.borderLight,
                  backgroundColor: theme.colors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Target
                  size={18}
                  color={theme.colors.primary}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={{
                    flex: 1,
                    color: theme.colors.text,
                    fontSize: 18,
                    fontWeight: "700",
                    paddingVertical: 8,
                    textAlign: "right",
                  }}
                  keyboardType="numeric"
                  placeholder={
                    deduction_type === "percentage" ? "10" : "50000"
                  }
                  placeholderTextColor={theme.colors.textMuted}
                  value={localAmount}
                  onChangeText={handleAmountChange}
                />
                <Text
                  style={{
                    marginLeft: 6,
                    color: theme.colors.textSecondary,
                    fontWeight: "600",
                  }}
                >
                  {deduction_type === "percentage" ? "%" : "TZS"}
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 12,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginBottom: 6,
                }}
              >
                Duration
              </Text>
              <Text
                style={{ fontSize: 12, color: theme.colors.textSecondary }}
              >
                Minimum of 6 months so you can build a strong saving habit.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                    backgroundColor: theme.colors.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    flex: 1,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      color: theme.colors.text,
                      fontSize: 18,
                      fontWeight: "700",
                      paddingVertical: 8,
                      textAlign: "right",
                    }}
                    keyboardType="numeric"
                    placeholder="6"
                    placeholderTextColor={theme.colors.textMuted}
                    value={localDuration}
                    onChangeText={handleDurationChange}
                  />
                  <Text
                    style={{
                      marginLeft: 6,
                      color: theme.colors.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    months
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  justifyContent: "flex-end",
                }}
              >
                {[6, 12, 24].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => handleDurationChange(String(preset))}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor:
                        duration_months === preset
                          ? theme.colors.primary
                          : theme.colors.borderLight,
                      backgroundColor:
                        duration_months === preset
                          ? theme.colors.primary + "10"
                          : "transparent",
                      marginLeft: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color:
                          duration_months === preset
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                      }}
                    >
                      {preset}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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

          {/* Start fresh for demo */}
          <TouchableOpacity
            onPress={handleStartFresh}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.secondary + "50",
              marginBottom: 16,
            }}
          >
            <RotateCcw
              size={20}
              color={theme.colors.secondary}
              style={{ marginRight: 10 }}
            />
            <Text style={{ color: theme.colors.secondary, fontWeight: "700" }}>
              Start fresh for next demo
            </Text>
          </TouchableOpacity>

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
