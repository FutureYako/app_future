import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Percent, DollarSign, CheckCircle } from "lucide-react-native";
import useTheme from "@/utils/theme";

export default function DeductionSettingsOnboarding() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [deductionType, setDeductionType] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!deductionType || !amount) {
      Alert.alert(
        "Error",
        "Please select a deduction type and enter an amount",
      );
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (deductionType === "percentage" && numAmount > 100) {
      Alert.alert("Error", "Percentage cannot exceed 100%");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/onboarding/deduction-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deductionType,
          amount: numAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      Alert.alert(
        "Welcome to Future Yako! 🎉",
        "Your account is all set up. Start saving for your future today!",
        [
          {
            text: "Get Started",
            onPress: () => router.replace("/(tabs)/dashboard"),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: theme.colors.text,
              marginBottom: 8,
            }}
          >
            Set Savings Preference
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              lineHeight: 24,
            }}
          >
            Choose how much to automatically save from each deposit
          </Text>
        </View>

        {/* Progress Indicator */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 40,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={16} color="#FFFFFF" />
          </View>
          <View
            style={{
              flex: 1,
              height: 2,
              backgroundColor: theme.colors.primary,
              marginHorizontal: 8,
            }}
          />
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={16} color="#FFFFFF" />
          </View>
          <View
            style={{
              flex: 1,
              height: 2,
              backgroundColor: theme.colors.primary,
              marginHorizontal: 8,
            }}
          />
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>3</Text>
          </View>
        </View>

        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.colors.textSecondary,
              marginBottom: 12,
            }}
          >
            Deduction Type
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 30 }}>
            <TouchableOpacity
              onPress={() => setDeductionType("percentage")}
              style={{
                flex: 1,
                padding: 24,
                borderRadius: 16,
                borderWidth: 2,
                borderColor:
                  deductionType === "percentage"
                    ? theme.colors.primary
                    : theme.colors.borderLight,
                backgroundColor:
                  deductionType === "percentage"
                    ? theme.colors.primary + "10"
                    : theme.colors.surface,
                alignItems: "center",
              }}
            >
              <Percent
                size={32}
                color={
                  deductionType === "percentage"
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color:
                    deductionType === "percentage"
                      ? theme.colors.primary
                      : theme.colors.text,
                }}
              >
                Percentage
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                % of each deposit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeductionType("fixed")}
              style={{
                flex: 1,
                padding: 24,
                borderRadius: 16,
                borderWidth: 2,
                borderColor:
                  deductionType === "fixed"
                    ? theme.colors.primary
                    : theme.colors.borderLight,
                backgroundColor:
                  deductionType === "fixed"
                    ? theme.colors.primary + "10"
                    : theme.colors.surface,
                alignItems: "center",
              }}
            >
              <DollarSign
                size={32}
                color={
                  deductionType === "fixed"
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color:
                    deductionType === "fixed"
                      ? theme.colors.primary
                      : theme.colors.text,
                }}
              >
                Fixed Amount
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                Same every time
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.colors.textSecondary,
              marginBottom: 8,
            }}
          >
            {deductionType === "percentage"
              ? "Percentage Amount"
              : "Fixed Amount (TZS)"}
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            }}
          >
            <TextInput
              style={{
                color: theme.colors.text,
                fontSize: 32,
                fontWeight: "700",
                paddingVertical: 16,
                textAlign: "center",
              }}
              placeholder={deductionType === "percentage" ? "10" : "50000"}
              placeholderTextColor={theme.colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          {deductionType === "percentage" && (
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              e.g., 10% means TZS 50,000 saved from TZS 500,000 deposit
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleComplete}
          disabled={loading}
          style={{
            marginTop: 40,
            backgroundColor: theme.colors.primary,
            padding: 18,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}
              >
                Complete Setup
              </Text>
              <CheckCircle
                size={20}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
