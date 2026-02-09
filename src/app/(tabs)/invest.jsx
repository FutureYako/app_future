import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { TrendingUp, ArrowUpRight, Info } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useTheme from "@/utils/theme";

export default function InvestScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data: options = [], isLoading: optionsLoading } = useQuery({
    queryKey: ["dse_options"],
    queryFn: async () => {
      const res = await fetch("/api/investments/options");
      return res.json();
    },
  });

  const { data: investments = [], isLoading: investLoading } = useQuery({
    queryKey: ["investments"],
    queryFn: async () => {
      const res = await fetch("/api/investments");
      return res.json();
    },
  });

  const investMutation = useMutation({
    mutationFn: async (investment) => {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(investment),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      Alert.alert("Success", "Investment successfully processed!");
    },
  });

  const totalInvested = investments.reduce(
    (acc, inv) => acc + Number(inv.invested_amount),
    0,
  );

  if (optionsLoading || investLoading) {
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
          Investments
        </Text>
        <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
          Dar es Salaam Stock Exchange (DSE)
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Portfolio Summary */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: theme.colors.secondary,
              borderRadius: 24,
              padding: 24,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Portfolio Value
            </Text>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 28,
                fontWeight: "800",
                marginTop: 4,
              }}
            >
              TZS {totalInvested.toLocaleString()}
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
                  backgroundColor: "rgba(255,255,255,0.2)",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TrendingUp
                  size={14}
                  color="#FFFFFF"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}
                >
                  +4.2%
                </Text>
              </View>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  marginLeft: 8,
                }}
              >
                Past month
              </Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Available Assets
          </Text>
          {["stock", "utt", "bond"].map((type) => (
            <View key={type} style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: theme.colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                {type}s
              </Text>

              {options
                .filter((opt) => opt.type === type)
                .map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => {
                      Alert.alert(
                        `Invest in ${option.name}`,
                        `Confirm investment of TZS 50,000 in ${option.name}?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Invest",
                            onPress: () =>
                              investMutation.mutate({
                                asset_name: option.name,
                                asset_type: option.type,
                                invested_amount: 50000,
                              }),
                          },
                        ],
                      );
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
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
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: theme.colors.surfaceSecondary,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          color: theme.colors.primary,
                        }}
                      >
                        {option.symbol || option.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ fontWeight: "600", color: theme.colors.text }}
                      >
                        {option.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        Current Price: TZS{" "}
                        {Number(option.price).toLocaleString()}
                      </Text>
                    </View>
                    <ArrowUpRight
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
            </View>
          ))}
        </View>

        {/* Your Portfolio */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Your Portfolio
          </Text>
          {investments.length === 0 ? (
            <View
              style={{
                backgroundColor: theme.colors.surfaceSecondary,
                padding: 24,
                borderRadius: 20,
                alignItems: "center",
              }}
            >
              <TrendingUp
                size={32}
                color={theme.colors.textMuted}
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                }}
              >
                You haven't made any investments yet. Start building your
                wealth!
              </Text>
            </View>
          ) : (
            investments.map((inv) => (
              <View
                key={inv.id}
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
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontWeight: "600", color: theme.colors.text }}>
                    {inv.asset_name}
                  </Text>
                  <Text
                    style={{ fontWeight: "700", color: theme.colors.primary }}
                  >
                    TZS {Number(inv.current_value).toLocaleString()}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 12, color: theme.colors.textSecondary }}
                >
                  Invested: TZS {Number(inv.invested_amount).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
