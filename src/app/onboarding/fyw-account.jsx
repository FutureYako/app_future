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
import { IdCard, Phone, ArrowRight, CheckCircle } from "lucide-react-native";
import useTheme from "@/utils/theme";

export default function FYWAccountOnboarding() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [nidaNumber, setNidaNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!nidaNumber || !phoneNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (nidaNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid NIDA number");
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/onboarding/fyw-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nidaNumber,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create FYW account");
      }

      Alert.alert(
        "Success!",
        `Your Future Yako Wallet has been created!\n\nWallet Number: ${data.fywAccount.wallet_number}`,
        [
          {
            text: "Continue",
            onPress: () => router.push("/onboarding/deduction-settings"),
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
            Create FYW Account
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              lineHeight: 24,
            }}
          >
            Set up your Future Yako Wallet where your savings will be securely
            stored
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
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>2</Text>
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

        <View
          style={{
            backgroundColor: theme.colors.primary + "15",
            padding: 16,
            borderRadius: 16,
            marginBottom: 30,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.primary,
              fontWeight: "600",
              lineHeight: 20,
            }}
          >
            Your wallet will be verified using your NIDA number, phone number,
            and email address for security.
          </Text>
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
              NIDA Number
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
              <IdCard
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
                placeholder="Enter your NIDA number"
                placeholderTextColor={theme.colors.textMuted}
                value={nidaNumber}
                onChangeText={setNidaNumber}
                keyboardType="numeric"
                maxLength={20}
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
              Phone Number
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
              <Phone
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
                placeholder="+255 XXX XXX XXX"
                placeholderTextColor={theme.colors.textMuted}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
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
                Create Wallet
              </Text>
              <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
