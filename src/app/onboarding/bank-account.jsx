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
import { Building2, CreditCard, User, ArrowRight } from "lucide-react-native";
import useTheme from "@/utils/theme";

export default function BankAccountOnboarding() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!bankName || !accountNumber || !accountName || !accountType) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/onboarding/bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName,
          accountNumber,
          accountName,
          accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to link bank account");
      }

      router.push("/onboarding/fyw-account");
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
            Link Income Account
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              lineHeight: 24,
            }}
          >
            Connect the bank account where your salary or boom is deposited
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
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>1</Text>
          </View>
          <View
            style={{
              flex: 1,
              height: 2,
              backgroundColor: theme.colors.borderLight,
              marginHorizontal: 8,
            }}
          />
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: theme.colors.borderLight,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.colors.textMuted, fontWeight: "700" }}>
              2
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              height: 2,
              backgroundColor: theme.colors.borderLight,
              marginHorizontal: 8,
            }}
          />
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: theme.colors.borderLight,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.colors.textMuted, fontWeight: "700" }}>
              3
            </Text>
          </View>
        </View>

        <View style={{ gap: 20 }}>
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.textSecondary,
                marginBottom: 8,
              }}
            >
              Bank Name
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              }}
            >
              <Building2
                size={20}
                color={theme.colors.textSecondary}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  color: theme.colors.text,
                  fontSize: 16,
                  paddingVertical: 14,
                }}
                placeholder="e.g. CRDB, NMB, NBC"
                placeholderTextColor={theme.colors.textMuted}
                value={bankName}
                onChangeText={setBankName}
              />
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
              Account Number
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              }}
            >
              <CreditCard
                size={20}
                color={theme.colors.textSecondary}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  color: theme.colors.text,
                  fontSize: 16,
                  paddingVertical: 14,
                }}
                placeholder="Enter account number"
                placeholderTextColor={theme.colors.textMuted}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
              />
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
              Account Name
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              }}
            >
              <User
                size={20}
                color={theme.colors.textSecondary}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  color: theme.colors.text,
                  fontSize: 16,
                  paddingVertical: 14,
                }}
                placeholder="Full name on account"
                placeholderTextColor={theme.colors.textMuted}
                value={accountName}
                onChangeText={setAccountName}
              />
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
              Account Type
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setAccountType("salary")}
                style={{
                  flex: 1,
                  padding: 20,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor:
                    accountType === "salary"
                      ? theme.colors.primary
                      : theme.colors.borderLight,
                  backgroundColor:
                    accountType === "salary"
                      ? theme.colors.primary + "10"
                      : theme.colors.surface,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color:
                      accountType === "salary"
                        ? theme.colors.primary
                        : theme.colors.text,
                  }}
                >
                  Salary Account
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Employee
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAccountType("boom")}
                style={{
                  flex: 1,
                  padding: 20,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor:
                    accountType === "boom"
                      ? theme.colors.primary
                      : theme.colors.borderLight,
                  backgroundColor:
                    accountType === "boom"
                      ? theme.colors.primary + "10"
                      : theme.colors.surface,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color:
                      accountType === "boom"
                        ? theme.colors.primary
                        : theme.colors.text,
                  }}
                >
                  Boom Account
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Student
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleContinue}
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
                Continue
              </Text>
              <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
