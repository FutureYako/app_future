import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Plus,
  ChevronRight,
  TrendingUp,
  Receipt,
  Bell,
  PiggyBank,
  Bot,
  Sparkles,
} from "lucide-react-native";
import useTheme from "@/utils/theme";
import { useRouter } from "expo-router";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { useSettingsStore } from "@/store/settingsStore";
import { useGoalsStore } from "@/store/goalsStore";
import { useDemoResetStore } from "@/store/demoResetStore";

export default function DashboardScreen() {
  useRequireAuth(); // Require authentication for this screen

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { deduction_type, amount: deductionAmount, is_enabled } =
    useSettingsStore();
  const { goals, distributeDeposit } = useGoalsStore();
  const resetKey = useDemoResetStore((s) => s.resetKey);

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [incomeType, setIncomeType] = useState("salary");
  const [incomeAmount, setIncomeAmount] = useState("");
  // simple prototype user
  const [user] = useState({
    full_name: "Future Yako",
  });

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (resetKey > 0) setTransactions([]);
  }, [resetKey]);

  const totalBalance = goals.reduce(
    (acc, goal) => acc + Number(goal.current_amount),
    0,
  );

  const onRefresh = useCallback(() => {
    // no-op, we keep everything in memory for the prototype
  }, []);

  const handleDeductFromIncome = () => {
    const income = Number(incomeAmount);

    if (isNaN(income) || income <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!is_enabled) {
      Alert.alert(
        "Auto deduction is off",
        "Turn on automatic deduction in your profile to save from each income.",
      );
      return;
    }

    let deducted = 0;

    if (deduction_type === "percentage") {
      deducted = (income * deductionAmount) / 100;
    } else {
      deducted = Math.min(deductionAmount, income);
    }

    if (deducted <= 0) {
      Alert.alert("Nothing to save", "Update your deduction settings first.");
      return;
    }

    // Distribute this deducted amount across goals according to their allocation_pct
    distributeDeposit(deducted);

    setTransactions((prev) => [
      {
        id: String(prev.length + 1),
        type: "deposit",
        amount: deducted,
        description: `Auto-saved from ${incomeType.toUpperCase()}`,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);

    setShowAddFundsModal(false);
    setIncomeAmount("");

    Alert.alert(
      "Success",
      `TZS ${deducted.toLocaleString()} has been moved to your portfolio savings.`,
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 20,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              fontWeight: "500",
            }}
          >
            Habari, {user?.full_name?.split(" ")[0]}
          </Text>
          <Text
            style={{
              fontSize: 22,
              color: theme.colors.text,
              fontWeight: "700",
            }}
          >
            Future Yako
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surfaceSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bell size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        {/* Total Balance Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 24,
              padding: 24,
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Total Savings
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {is_enabled
                    ? deduction_type === "percentage"
                      ? `You auto-save ${deductionAmount}% of every income`
                      : `You auto-save TZS ${deductionAmount.toLocaleString()} from every income`
                    : "Auto-saving is off. Turn it on in your profile."}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/profile")}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.5)",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  Edit rule
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                marginTop: 8,
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 32, fontWeight: "800" }}
              >
                TZS {totalBalance.toLocaleString()}
              </Text>
            </View>
            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => setShowAddFundsModal(true)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Plus size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Add Funds
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            marginBottom: 24,
            justifyContent: "space-between",
          }}
        >
          {[
            {
              label: "Invest",
              icon: TrendingUp,
              route: "/(tabs)/invest",
              color: theme.colors.secondary,
            },
            {
              label: "Bills",
              icon: Receipt,
              route: "/(tabs)/bills",
              color: "#F59E0B",
            },
            {
              label: "Goals",
              icon: PiggyBank,
              route: "/(tabs)/goals",
              color: theme.colors.primary,
            },
          ].map((action, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push(action.route)}
              style={{ alignItems: "center", width: "30%" }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: action.color + "15",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <action.icon size={26} color={action.color} />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mr Money - Financial AI Advisor */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/mr-money")}
          style={{ paddingHorizontal: 20, marginBottom: 24 }}
          activeOpacity={0.9}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
              flexDirection: "row",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: theme.colors.primary + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Bot size={28} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: theme.colors.text,
                    marginRight: 6,
                  }}
                >
                  Mr Money
                </Text>
                <Sparkles size={16} color={theme.colors.primary} />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                }}
              >
                Your financial AI advisor — savings, investments, tax & more
              </Text>
            </View>
            <ChevronRight size={22} color={theme.colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Goals Preview */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              Your Goals
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/goals")}>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.primary,
                  fontWeight: "600",
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {goals.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/goals")}
              style={{
                backgroundColor: theme.colors.surfaceSecondary,
                padding: 20,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderStyle: "dashed",
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.textSecondary }}>
                No goals yet. Create your first one!
              </Text>
            </TouchableOpacity>
          ) : (
            goals.slice(0, 2).map((goal) => {
              const progress = Math.min(
                Number(goal.current_amount) / Number(goal.target_amount),
                1,
              );
              return (
                <View
                  key={goal.id}
                  style={{
                    backgroundColor: theme.colors.surface,
                    padding: 16,
                    borderRadius: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{ fontWeight: "600", color: theme.colors.text }}
                    >
                      {goal.name}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        fontSize: 12,
                      }}
                    >
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: theme.colors.surfaceSecondary,
                      borderRadius: 3,
                    }}
                  >
                    <View
                      style={{
                        height: 6,
                        backgroundColor: theme.colors.primary,
                        borderRadius: 3,
                        width: `${progress * 100}%`,
                      }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Recent Transactions */}
        <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.colors.text,
                marginBottom: 4,
              }}
            >
              Recent Activity
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginBottom: 16,
              }}
            >
              See how much has been auto-saved from your BOOM and salary.
            </Text>
          {transactions.length === 0 ? (
            <View style={{ alignItems: "center", padding: 20 }}>
              <Text style={{ color: theme.colors.textSecondary }}>
                No transactions yet.
              </Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View
                key={tx.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                  backgroundColor: theme.colors.surface,
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor:
                      tx.type === "deposit"
                        ? theme.colors.primary + "15"
                        : theme.colors.secondary + "15",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {tx.type === "deposit" ? (
                    <ArrowDownCircle size={22} color={theme.colors.primary} />
                  ) : (
                    <ArrowUpCircle size={22} color={theme.colors.secondary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: theme.colors.text }}>
                    {tx.description}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: theme.colors.textSecondary }}
                  >
                    {new Date(tx.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontWeight: "700",
                    color:
                      tx.type === "deposit"
                        ? theme.colors.primary
                        : theme.colors.text,
                  }}
                >
                  {tx.type === "deposit" ? "+" : "-"} TZS{" "}
                  {Number(tx.amount).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddFundsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddFundsModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "90%",
                backgroundColor: theme.colors.surface,
                borderRadius: 20,
                padding: 20,
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
              Add New Income
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.textSecondary,
                marginBottom: 4,
              }}
            >
              1. Choose BOOM or SALARY.
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.textSecondary,
                marginBottom: 4,
              }}
            >
              2. Enter the full amount you received.
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.textSecondary,
                marginBottom: 12,
              }}
            >
              3. We automatically move your part to savings before you touch it.
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Income Type
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => setIncomeType("boom")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor:
                    incomeType === "boom"
                      ? theme.colors.primary
                      : theme.colors.borderLight,
                  backgroundColor:
                    incomeType === "boom"
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
                      incomeType === "boom"
                        ? theme.colors.primary
                        : theme.colors.text,
                  }}
                >
                  BOOM
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    marginTop: 2,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Students
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIncomeType("salary")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor:
                    incomeType === "salary"
                      ? theme.colors.primary
                      : theme.colors.borderLight,
                  backgroundColor:
                    incomeType === "salary"
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
                      incomeType === "salary"
                        ? theme.colors.primary
                        : theme.colors.text,
                  }}
                >
                  SALARY
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    marginTop: 2,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Employees
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Amount Earned (TZS)
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              }}
            >
              <TextInput
                style={{
                  color: theme.colors.text,
                  fontSize: 20,
                  fontWeight: "700",
                  paddingVertical: 8,
                  textAlign: "center",
                }}
                placeholder="500000"
                placeholderTextColor={theme.colors.textMuted}
                value={incomeAmount}
                onChangeText={setIncomeAmount}
                keyboardType="numeric"
              />
            </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 24,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowAddFundsModal(false)}
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
                  onPress={handleDeductFromIncome}
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
                    Deduct
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
