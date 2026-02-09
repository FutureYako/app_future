import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Receipt,
  Zap,
  Droplet,
  Tv,
  Wifi,
  Search,
  ChevronRight,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useTheme from "@/utils/theme";

export default function BillsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: billers = [], isLoading } = useQuery({
    queryKey: ["billers"],
    queryFn: async () => {
      const res = await fetch("/api/billers");
      return res.json();
    },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      return res.json();
    },
  });

  const handlePay = (biller) => {
    if (goals.length === 0 || goals[0].current_amount < 1000) {
      Alert.alert(
        "Insufficient Funds",
        "You need to save some money first before paying bills!",
      );
      return;
    }

    Alert.alert(
      `Pay ${biller.name}`,
      `Enter amount to pay for ${biller.name}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay TZS 10,000",
          onPress: () => {
            Alert.alert(
              "Success",
              `Payment of TZS 10,000 to ${biller.name} successful!`,
            );
            // In a real app, we would call a backend route to deduct from goals
            queryClient.invalidateQueries({ queryKey: ["goals"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          },
        },
      ],
    );
  };

  const getIcon = (category) => {
    switch (category) {
      case "Utility":
        return Zap;
      case "Entertainment":
        return Tv;
      case "Internet":
        return Wifi;
      default:
        return Receipt;
    }
  };

  const filteredBillers = billers.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
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
          Bill Payments
        </Text>
        <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
          Use your savings to pay essential bills
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
                onPress={() => handlePay(biller)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
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
    </View>
  );
}
