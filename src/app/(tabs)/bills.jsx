import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Receipt,
  Zap,
  Tv,
  Wifi,
  Search,
  ChevronRight,
} from "lucide-react-native";
import useTheme from "@/utils/theme";
import { useSettingsStore } from "@/store/settingsStore";
import { useGoalsStore } from "@/store/goalsStore";

export default function BillsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [referenceType, setReferenceType] = useState("control");
  const [referenceValue, setReferenceValue] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("total");

  const { is_enabled, duration_months } = useSettingsStore();
  const { goals, deductFromGoal, deductFromTotal } = useGoalsStore();

  const totalSavings = useMemo(
    () =>
      goals.reduce(
        (sum, g) => sum + (Number(g.current_amount) || 0),
        0,
      ),
    [goals],
  );

  const canPayBills = !is_enabled && duration_months >= 6;

  const getIcon = (category) => {
    switch (category) {
      case "Utility":
        return Zap;
      case "Entertainment":
        return Tv;
      case "Internet":
      case "Mobile":
        return Wifi;
      default:
        return Receipt;
    }
  };

  const billers = useMemo(
    () => [
      { id: "tanesco", name: "TANESCO (Electricity)", category: "Utility" },
      { id: "dawasa", name: "DAWASA (Water)", category: "Utility" },
      { id: "duwasa", name: "DUWASA (Water)", category: "Utility" },
      { id: "ttcl", name: "TTCL", category: "Internet" },
      { id: "vodacom", name: "Vodacom", category: "Mobile" },
      { id: "airtel", name: "Airtel", category: "Mobile" },
      { id: "tigo", name: "Tigo", category: "Mobile" },
      { id: "halotel", name: "Halotel", category: "Mobile" },
      { id: "zantel", name: "Zantel", category: "Mobile" },
      { id: "azam", name: "Azam TV", category: "Entertainment" },
      { id: "dstv", name: "DStv", category: "Entertainment" },
      { id: "startimes", name: "StarTimes", category: "Entertainment" },
      { id: "other", name: "Other company (not listed)", category: "Other" },
    ],
    [],
  );

  const filteredBillers = billers.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenPay = (biller) => {
    if (!canPayBills) {
      Alert.alert(
        "Saving period not finished",
        "You can pay bills only after your saving duration is completed. Turn off Automatic Deduction in your profile when your period is over.",
      );
      return;
    }

    if (totalSavings <= 0) {
      Alert.alert(
        "Insufficient Savings",
        "You need to have saved some money before paying bills.",
      );
      return;
    }

    setSelectedBiller(biller);
    setReferenceType("control");
    setReferenceValue("");
    setAmount("");
    setSelectedGoalId("total");
    setShowPayModal(true);
  };

  const handleConfirmPay = () => {
    if (!selectedBiller) return;

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount to pay.");
      return;
    }

    if (!referenceValue.trim()) {
      Alert.alert(
        "Missing reference",
        "Please enter the control number, phone number, or Lipa number.",
      );
      return;
    }

    if (selectedGoalId === "total") {
      if (totalSavings < numericAmount) {
        Alert.alert(
          "Insufficient savings",
          "Your total savings are not enough to cover this bill.",
        );
        return;
      }

      deductFromTotal(numericAmount);
    } else {
      const goal = goals.find((g) => g.id === selectedGoalId);
      const goalBalance = goal ? Number(goal.current_amount) || 0 : 0;

      if (!goal || goalBalance <= 0) {
        Alert.alert(
          "No balance",
          "This goal has no savings. Please choose another goal or total savings.",
        );
        return;
      }

      if (goalBalance < numericAmount) {
        Alert.alert(
          "Insufficient goal balance",
          "The selected goal does not have enough savings. Choose another goal or total savings.",
        );
        return;
      }

      deductFromGoal(selectedGoalId, numericAmount);
    }

    setShowPayModal(false);

    Alert.alert(
      "Payment successful",
      `You have paid TZS ${numericAmount.toLocaleString()} to ${selectedBiller.name}.`,
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <Text
          style={{ fontSize: 24, color: theme.colors.text, fontWeight: "700" }}
        >
          Bill Payments
        </Text>
        <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
          Use your savings to pay essential bills once your saving period is
          complete.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <Search size={20} color={theme.colors.textMuted} />
          <TextInput
            style={{ flex: 1, padding: 12, color: theme.colors.text }}
            placeholder="Search biller..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {!canPayBills && (
          <View
            style={{
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 4,
              }}
            >
              Saving period still active
            </Text>
            <Text
              style={{ fontSize: 12, color: theme.colors.textSecondary }}
            >
              You&apos;ll be able to pay bills after your saving duration is
              completed. In this prototype, turn off Automatic Deduction in
              your profile when your period is over.
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
          }}
        >
          {filteredBillers.map((biller, idx) => {
            const Icon = getIcon(biller.category);
            return (
              <TouchableOpacity
                key={biller.id}
                onPress={() => handleOpenPay(biller)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  opacity: canPayBills ? 1 : 0.6,
                  borderBottomWidth: idx === filteredBillers.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.borderLight,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: theme.colors.surfaceSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Icon size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: theme.colors.text }}>
                    {biller.name}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: theme.colors.textSecondary }}
                  >
                    {biller.category}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredBillers.length === 0 && (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Text style={{ color: theme.colors.textSecondary }}>
              No billers found
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showPayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 20,
                paddingBottom: insets.bottom + 20,
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
                Pay {selectedBiller?.name}
              </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginBottom: 16,
              }}
            >
              Choose reference type, enter number and amount, then select which
              savings to use.
            </Text>

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 6,
              }}
            >
              Reference type
            </Text>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 10,
              }}
            >
              {[
                { id: "control", label: "Control no" },
                { id: "phone", label: "Phone no" },
                { id: "lipa", label: "Lipa no" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setReferenceType(opt.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor:
                      referenceType === opt.id
                        ? theme.colors.primary
                        : theme.colors.borderLight,
                    backgroundColor:
                      referenceType === opt.id
                        ? theme.colors.primary + "10"
                        : "transparent",
                    marginHorizontal: 2,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color:
                        referenceType === opt.id
                          ? theme.colors.primary
                          : theme.colors.textSecondary,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 6,
              }}
            >
              {referenceType === "control"
                ? "Control number"
                : referenceType === "phone"
                  ? "Phone number"
                  : "Lipa number"}
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                color: theme.colors.text,
              }}
              placeholder="Enter number"
              placeholderTextColor={theme.colors.textMuted}
              value={referenceValue}
              onChangeText={setReferenceValue}
              keyboardType="default"
            />

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 6,
              }}
            >
              Amount to pay (TZS)
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                color: theme.colors.text,
              }}
              placeholder="50000"
              placeholderTextColor={theme.colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 6,
              }}
            >
              Pay from
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 12,
                padding: 10,
                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => setSelectedGoalId("total")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  {selectedGoalId === "total" && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: theme.colors.text,
                    }}
                  >
                    Total savings
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Balance TZS {totalSavings.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>

              {goals.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setSelectedGoalId(g.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: theme.colors.primary,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    {selectedGoalId === g.id && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: theme.colors.primary,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}
                    >
                      {g.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Balance TZS {Number(g.current_amount).toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowPayModal(false)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  marginRight: 8,
                  backgroundColor: theme.colors.surfaceSecondary,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmPay}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                  }}
                >
                  Pay Bill
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
