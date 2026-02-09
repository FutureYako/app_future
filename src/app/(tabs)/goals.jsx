import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Plus, Target, TrendingUp, X, CreditCard } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useTheme from "@/utils/theme";
import { useRequireAuth } from "@/utils/auth/useAuth";

export default function GoalsScreen() {
  useRequireAuth(); // Require authentication for this screen

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      return res.json();
    },
  });

  const createGoal = useMutation({
    mutationFn: async (newGoal) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setModalVisible(false);
      setName("");
      setTarget("");
    },
  });

  const handleCreate = () => {
    if (!name || !target) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    createGoal.mutate({
      name,
      target_amount: Number(target),
      category: "General",
    });
  };

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
        <Text
          style={{ fontSize: 24, color: theme.colors.text, fontWeight: "700" }}
        >
          Savings Goals
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {goals.map((goal) => {
          const progress = Math.min(
            Number(goal.current_amount) / Number(goal.target_amount),
            1,
          );
          return (
            <View
              key={goal.id}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: theme.colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {goal.name}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: theme.colors.textSecondary }}
                  >
                    Target: TZS {Number(goal.target_amount).toLocaleString()}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: theme.colors.primary + "15",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
              </View>

              <View
                style={{
                  height: 12,
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderRadius: 6,
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: 12,
                    backgroundColor: theme.colors.primary,
                    width: `${progress * 100}%`,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{ fontSize: 12, color: theme.colors.textSecondary }}
                  >
                    Saved so far
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: theme.colors.text,
                    }}
                  >
                    TZS {Number(goal.current_amount).toLocaleString()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{ fontSize: 12, color: theme.colors.textSecondary }}
                  >
                    Remaining
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: theme.colors.secondary,
                    }}
                  >
                    TZS{" "}
                    {(
                      Number(goal.target_amount) - Number(goal.current_amount)
                    ).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
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
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              padding: 24,
              paddingBottom: insets.bottom + 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                New Saving Goal
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.textSecondary,
                marginBottom: 8,
              }}
            >
              Goal Name
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.surfaceSecondary,
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
                color: theme.colors.text,
              }}
              placeholder="e.g. Dream House, Education"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.textSecondary,
                marginBottom: 8,
              }}
            >
              Target Amount (TZS)
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.surfaceSecondary,
                padding: 16,
                borderRadius: 12,
                marginBottom: 32,
                color: theme.colors.text,
              }}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={target}
              onChangeText={setTarget}
            />

            <TouchableOpacity
              onPress={handleCreate}
              disabled={createGoal.isLoading}
              style={{
                backgroundColor: theme.colors.primary,
                padding: 18,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              {createGoal.isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}
                >
                  Create Goal
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
