import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
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
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useTheme from "@/utils/theme";
import { useRouter } from "expo-router";
import { useRequireAuth } from "@/utils/auth/useAuth";

export default function DashboardScreen() {
  useRequireAuth(); // Require authentication for this screen

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      return res.json();
    },
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      return res.json();
    },
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions");
      return res.json();
    },
  });

  const simulateDeposit = useMutation({
    mutationFn: async (amount) => {
      const res = await fetch("/api/simulate-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      Alert.alert(
        "Success",
        `Received TZS ${data.deducted.toLocaleString()} for your ${data.goal} goal!`,
      );
    },
  });

  const totalBalance = goals.reduce(
    (acc, goal) => acc + Number(goal.current_amount),
    0,
  );

  const onRefresh = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }, [queryClient]);

  if (userLoading || goalsLoading || txLoading) {
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
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Total Savings
            </Text>
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
                onPress={() => simulateDeposit.mutate(1200000)}
                disabled={simulateDeposit.isLoading}
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
              marginBottom: 16,
            }}
          >
            Recent Activity
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
    </View>
  );
}
