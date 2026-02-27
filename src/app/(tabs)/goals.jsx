import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Plus, X } from "lucide-react-native";
import useTheme from "@/utils/theme";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { useGoalsStore } from "@/store/goalsStore";

export default function GoalsScreen() {
  useRequireAuth(); // Require authentication for this screen

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [allocationType, setAllocationType] = useState("percentage");
  const [allocationValue, setAllocationValue] = useState("");
  const {
    goals,
    addGoal,
    setAllocationType: setGoalAllocationType,
    setAllocationValue: setGoalAllocationValue,
  } = useGoalsStore();

  const handleCreate = () => {
    if (!name || !target) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const allocNum = Number(allocationValue);
    if (!isNaN(allocNum) && allocNum < 0) {
      Alert.alert("Error", "Allocation cannot be negative");
      return;
    }

    addGoal({
      id: Date.now().toString(),
      name,
      target_amount: Number(target),
      current_amount: 0,
      allocation_type: allocationType,
      allocation_value: isNaN(allocNum) ? 0 : allocNum,
    });
    setModalVisible(false);
    setName("");
    setTarget("");
    setAllocationType("percentage");
    setAllocationValue("");
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
        {goals.length === 0 && (
          <View
            style={{
              padding: 20,
              borderRadius: 16,
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginBottom: 4,
              }}
            >
              No goals yet
            </Text>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
              Tap the + button to create your first goal and decide how much of
              every saving goes to it.
            </Text>
          </View>
        )}

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

              <View
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.borderLight,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Allocation from each saving
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setGoalAllocationType(goal.id, "percentage")}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor:
                        goal.allocation_type === "percentage"
                          ? theme.colors.primary
                          : theme.colors.borderLight,
                      backgroundColor:
                        goal.allocation_type === "percentage"
                          ? theme.colors.primary + "10"
                          : "transparent",
                      marginRight: 4,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color:
                          goal.allocation_type === "percentage"
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                      }}
                    >
                      Percentage
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setGoalAllocationType(goal.id, "fixed")}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor:
                        goal.allocation_type === "fixed"
                          ? theme.colors.primary
                          : theme.colors.borderLight,
                      backgroundColor:
                        goal.allocation_type === "fixed"
                          ? theme.colors.primary + "10"
                          : "transparent",
                      marginLeft: 4,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color:
                          goal.allocation_type === "fixed"
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                      }}
                    >
                      Fixed amount
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    backgroundColor: theme.colors.surfaceSecondary,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      textAlign: "right",
                      color: theme.colors.text,
                      fontSize: 16,
                      fontWeight: "700",
                      paddingVertical: 4,
                    }}
                    keyboardType="numeric"
                    placeholder={
                      goal.allocation_type === "fixed" ? "50000" : "10"
                    }
                    placeholderTextColor={theme.colors.textMuted}
                    value={String(goal.allocation_value ?? 0)}
                    onChangeText={(val) => setGoalAllocationValue(goal.id, val)}
                  />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {goal.allocation_type === "fixed" ? "TZS" : "%"}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
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
                marginBottom: 20,
                color: theme.colors.text,
              }}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={target}
              onChangeText={setTarget}
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.textSecondary,
                marginBottom: 8,
              }}
            >
              Allocation from each saving (optional)
            </Text>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => setAllocationType("percentage")}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor:
                    allocationType === "percentage"
                      ? theme.colors.primary
                      : theme.colors.borderLight,
                  backgroundColor:
                    allocationType === "percentage"
                      ? theme.colors.primary + "10"
                      : "transparent",
                  marginRight: 4,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      allocationType === "percentage"
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                  }}
                >
                  Percentage
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAllocationType("fixed")}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor:
                    allocationType === "fixed"
                      ? theme.colors.primary
                      : theme.colors.borderLight,
                  backgroundColor:
                    allocationType === "fixed"
                      ? theme.colors.primary + "10"
                      : "transparent",
                  marginLeft: 4,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      allocationType === "fixed"
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                  }}
                >
                  Fixed amount
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: theme.colors.surfaceSecondary,
                marginBottom: 24,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  textAlign: "right",
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "700",
                  paddingVertical: 4,
                }}
                keyboardType="numeric"
                placeholder={allocationType === "fixed" ? "50000" : "10"}
                placeholderTextColor={theme.colors.textMuted}
                value={allocationValue}
                onChangeText={setAllocationValue}
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                }}
              >
                {allocationType === "fixed" ? "TZS" : "%"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              style={{
                backgroundColor: theme.colors.primary,
                padding: 18,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}
              >
                Create Goal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
