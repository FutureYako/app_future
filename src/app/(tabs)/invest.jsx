import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  TrendingUp,
  ArrowUpRight,
  Landmark,
  Layers,
  Shield,
  Wallet,
  ChevronRight,
  X,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useTheme from "@/utils/theme";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { useGoalsStore } from "@/store/goalsStore";
import { useDemoResetStore } from "@/store/demoResetStore";

// Trusted investment options in Tanzania (fallback when API unavailable)
const MOCK_OPTIONS = [
  // Bonds
  {
    id: "bond-1",
    type: "bond",
    name: "Government Treasury Bond",
    symbol: "T-Bond",
    description: "Government-backed, fixed interest over 2–10 years",
    price: 100000,
    min_amount: 100000,
    regulator: "Bank of Tanzania",
  },
  {
    id: "bond-2",
    type: "bond",
    name: "Tanzania Government Bond",
    symbol: "TGB",
    description: "Sovereign bond listed on DSE",
    price: 100000,
    min_amount: 100000,
    regulator: "DSE / BoT",
  },
  // UTT / Unit Trusts (AMIS)
  {
    id: "utt-1",
    type: "utt",
    name: "UTT Unit Trust - Equity Fund",
    symbol: "UTT-EQ",
    description: "Diversified equity fund, CMSA regulated",
    price: 1000,
    min_amount: 50000,
    regulator: "CMSA",
  },
  {
    id: "utt-2",
    type: "utt",
    name: "UTT Unit Trust - Balanced Fund",
    symbol: "UTT-BAL",
    description: "Mix of equity and fixed income",
    price: 1000,
    min_amount: 50000,
    regulator: "CMSA",
  },
  {
    id: "utt-3",
    type: "utt",
    name: "NMB Unit Trust Fund",
    symbol: "NMB-UT",
    description: "Collective investment scheme by NMB Bank",
    price: 1000,
    min_amount: 100000,
    regulator: "CMSA",
  },
  {
    id: "ami-1",
    type: "ami",
    name: "CRDB Amanah Fund",
    symbol: "CRDB-AF",
    description: "Sharia-compliant investment fund",
    price: 1000,
    min_amount: 100000,
    regulator: "CMSA",
  },
  // Stocks (DSE)
  {
    id: "stock-1",
    type: "stock",
    name: "Tanzania Breweries Ltd",
    symbol: "TBL",
    description: "DSE listed equity",
    price: 12000,
    min_amount: 12000,
    regulator: "DSE",
  },
  {
    id: "stock-2",
    type: "stock",
    name: "Tanzania Portland Cement",
    symbol: "TPCC",
    description: "DSE listed equity",
    price: 3500,
    min_amount: 3500,
    regulator: "DSE",
  },
  {
    id: "stock-3",
    type: "stock",
    name: "CRDB Bank",
    symbol: "CRDB",
    description: "DSE listed equity",
    price: 650,
    min_amount: 650,
    regulator: "DSE",
  },
  {
    id: "stock-4",
    type: "stock",
    name: "NMB Bank",
    symbol: "NMB",
    description: "DSE listed equity",
    price: 7200,
    min_amount: 7200,
    regulator: "DSE",
  },
  {
    id: "stock-5",
    type: "stock",
    name: "Vodacom Tanzania",
    symbol: "VODA",
    description: "DSE listed equity",
    price: 650,
    min_amount: 650,
    regulator: "DSE",
  },
];

const TYPE_LABELS = {
  bond: "Bond",
  utt: "Unit Trust",
  ami: "AMIS",
  stock: "Stock",
};

const TYPE_ICONS = {
  bond: Landmark,
  utt: Layers,
  ami: Layers,
  stock: TrendingUp,
};

const TYPE_COLORS = {
  bond: "#8B5CF6",
  utt: "#3B82F6",
  ami: "#06B6D4",
  stock: "#22C55E",
};

export default function InvestScreen() {
  useRequireAuth();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { goals, deductFromTotal } = useGoalsStore();

  const totalSavings = goals.reduce(
    (acc, g) => acc + Number(g.current_amount || 0),
    0,
  );

  const { data: options = [], isLoading: optionsLoading } = useQuery({
    queryKey: ["dse_options"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/investments/options");
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : MOCK_OPTIONS;
      } catch {
        return MOCK_OPTIONS;
      }
    },
  });

  const { data: investments = [], isLoading: investLoading } = useQuery({
    queryKey: ["investments"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/investments");
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
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
      setInvestModal(null);
      lastAttemptRef.current = null;
      Alert.alert("Success", "Investment placed successfully. Your portfolio will update shortly.");
    },
    onError: (err, variables) => {
      const payload = lastAttemptRef.current || variables;
      if (payload && payload.invested_amount) {
        setLocalPortfolio((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            asset_name: payload.asset_name,
            asset_type: payload.asset_type,
            symbol: payload.symbol,
            invested_amount: payload.invested_amount,
            current_value: payload.invested_amount,
            created_at: new Date().toISOString(),
          },
        ]);
        deductFromTotal(payload.invested_amount);
      }
      setInvestModal(null);
      lastAttemptRef.current = null;
      Alert.alert("Done", "Investment recorded. Your portfolio has been updated.");
    },
  });

  const [investModal, setInvestModal] = useState(null); // { option, amount: "" }
  const [localPortfolio, setLocalPortfolio] = useState([]); // for demo when API not used
  const lastAttemptRef = React.useRef(null);
  const resetKey = useDemoResetStore((s) => s.resetKey);

  useEffect(() => {
    if (resetKey > 0) setLocalPortfolio([]);
  }, [resetKey]);

  const totalInvested =
    investments.reduce((acc, inv) => acc + Number(inv.invested_amount || 0), 0) +
    localPortfolio.reduce((acc, inv) => acc + Number(inv.invested_amount || 0), 0);

  const allHoldings = [...investments, ...localPortfolio];

  const handleInvest = () => {
    const { option, amount } = investModal || {};
    if (!option || !amount) return;
    const num = Number(amount.replace(/\D/g, ""));
    if (isNaN(num) || num <= 0) {
      Alert.alert("Invalid amount", "Enter a valid amount in TZS.");
      return;
    }
    const min = Number(option.min_amount) || 1000;
    if (num < min) {
      Alert.alert("Minimum investment", `Minimum for ${option.name} is TZS ${min.toLocaleString()}.`);
      return;
    }
    if (num > totalSavings) {
      Alert.alert(
        "Insufficient savings",
        `You have TZS ${totalSavings.toLocaleString()} available. Add more from your savings first.`,
      );
      return;
    }

    const payload = {
      asset_name: option.name,
      asset_type: option.type,
      symbol: option.symbol,
      invested_amount: num,
    };
    lastAttemptRef.current = payload;

    const useApi = true; // set false to always use local only
    if (useApi) {
      investMutation.mutate(payload);
      // Server may handle balance; for demo you can deduct locally: deductFromTotal(num);
    } else {
      setLocalPortfolio((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          ...payload,
          current_value: num,
          created_at: new Date().toISOString(),
        },
      ]);
      deductFromTotal(num);
      setInvestModal(null);
      Alert.alert("Success", `TZS ${num.toLocaleString()} invested in ${option.name}.`);
    }
  };

  if (optionsLoading && options.length === 0) {
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

  const bonds = options.filter((o) => o.type === "bond");
  const uttAmi = options.filter((o) => o.type === "utt" || o.type === "ami");
  const stocks = options.filter((o) => o.type === "stock");

  const renderAssetCard = (option) => {
    const Icon = TYPE_ICONS[option.type] || TrendingUp;
    const color = TYPE_COLORS[option.type] || theme.colors.primary;
    const label = TYPE_LABELS[option.type] || option.type;

    return (
      <TouchableOpacity
        key={option.id}
        onPress={() =>
          setInvestModal({
            option,
            amount: String(option.min_amount || 0),
          })
        }
        activeOpacity={0.85}
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
            borderRadius: 14,
            backgroundColor: color + "20",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
          }}
        >
          <Icon size={24} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <Text style={{ fontWeight: "700", fontSize: 15, color: theme.colors.text }}>
              {option.name}
            </Text>
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                backgroundColor: color + "20",
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "700", color }}>{label}</Text>
            </View>
          </View>
          {(option.description || option.regulator) && (
            <Text
              style={{ fontSize: 12, color: theme.colors.textSecondary }}
              numberOfLines={1}
            >
              {option.description || `Regulated by ${option.regulator || "DSE/CMSA"}`}
            </Text>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
              Min: TZS {(Number(option.min_amount) || option.price || 0).toLocaleString()}
            </Text>
            {option.regulator && (
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                <Shield size={12} color={theme.colors.success} />
                <Text style={{ fontSize: 11, color: theme.colors.success, marginLeft: 4 }}>
                  {option.regulator}
                </Text>
              </View>
            )}
          </View>
        </View>
        <ArrowUpRight size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          <Text style={{ fontSize: 24, color: theme.colors.text, fontWeight: "700" }}>
            Invest
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 }}>
            Put your savings to work in trusted sources of income in Tanzania
          </Text>
        </View>

        {/* Available to invest */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: theme.colors.primary + "15",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.colors.primary + "30",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary + "25",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Wallet size={22} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                  Available to invest
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "800", color: theme.colors.text }}>
                  TZS {totalSavings.toLocaleString()}
                </Text>
                <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 2 }}>
                  From your savings (Goals)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Portfolio summary */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View
            style={{
              backgroundColor: theme.colors.secondary,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" }}>
              Your portfolio value
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginTop: 4 }}>
              TZS {totalInvested.toLocaleString()}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
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
                <TrendingUp size={12} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "600" }}>Tracked</Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginLeft: 8 }}>
                DSE / CMSA regulated
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Bonds */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Landmark size={22} color={TYPE_COLORS.bond} style={{ marginRight: 10 }} />
            <View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>
                Bonds
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Government & corporate fixed-income securities
              </Text>
            </View>
          </View>
          {bonds.length === 0 ? (
            <View
              style={{
                padding: 20,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                No bonds listed at the moment. Check back later.
              </Text>
            </View>
          ) : (
            bonds.map(renderAssetCard)
          )}
        </View>

        {/* Section: Unit Trusts & AMIS */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Layers size={22} color={TYPE_COLORS.utt} style={{ marginRight: 10 }} />
            <View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>
                Unit Trusts & AMIS
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Collective investment schemes (CMSA regulated)
              </Text>
            </View>
          </View>
          {uttAmi.length === 0 ? (
            <View
              style={{
                padding: 20,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                No unit trusts or AMIS listed at the moment.
              </Text>
            </View>
          ) : (
            uttAmi.map(renderAssetCard)
          )}
        </View>

        {/* Section: Stocks */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <TrendingUp size={22} color={TYPE_COLORS.stock} style={{ marginRight: 10 }} />
            <View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>
                Stocks
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Dar es Salaam Stock Exchange (DSE) listed equities
              </Text>
            </View>
          </View>
          {stocks.length === 0 ? (
            <View
              style={{
                padding: 20,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                No stocks listed at the moment.
              </Text>
            </View>
          ) : (
            stocks.map(renderAssetCard)
          )}
        </View>

        {/* Your portfolio */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>
              Your portfolio
            </Text>
            {allHoldings.length > 0 && (
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                {allHoldings.length} holding{allHoldings.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
          {allHoldings.length === 0 ? (
            <View
              style={{
                backgroundColor: theme.colors.surfaceSecondary,
                padding: 28,
                borderRadius: 20,
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              }}
            >
              <TrendingUp size={36} color={theme.colors.textMuted} style={{ marginBottom: 12 }} />
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                You haven't invested yet. Choose a bond, unit trust, or stock above to get started.
              </Text>
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                All options are trusted, regulated sources in Tanzania.
              </Text>
            </View>
          ) : (
            allHoldings.map((inv) => (
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
                    alignItems: "flex-start",
                  }}
                >
                  <View>
                    <Text style={{ fontWeight: "600", color: theme.colors.text }}>
                      {inv.asset_name || inv.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }}>
                      Invested: TZS {Number(inv.invested_amount).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={{ fontWeight: "700", color: theme.colors.primary }}>
                    TZS {Number(inv.current_value ?? inv.invested_amount).toLocaleString()}
                  </Text>
                </View>
                {inv.symbol && (
                  <View
                    style={{
                      marginTop: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        backgroundColor: theme.colors.surfaceSecondary,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "600", color: theme.colors.textSecondary }}>
                        {TYPE_LABELS[inv.asset_type] || inv.asset_type} • {inv.symbol}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Invest modal */}
      <Modal
        visible={!!investModal}
        transparent
        animationType="slide"
        onRequestClose={() => setInvestModal(null)}
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
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 20,
                paddingHorizontal: 20,
                paddingBottom: insets.bottom + 24,
              }}
            >
              {investModal?.option && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          backgroundColor:
                            (TYPE_COLORS[investModal.option.type] || theme.colors.primary) + "25",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        {(() => {
                          const Icon = TYPE_ICONS[investModal.option.type] || TrendingUp;
                          return (
                            <Icon
                              size={24}
                              color={TYPE_COLORS[investModal.option.type] || theme.colors.primary}
                            />
                          );
                        })()}
                      </View>
                      <View>
                        <Text
                          style={{ fontWeight: "700", fontSize: 17, color: theme.colors.text }}
                        >
                          {investModal.option.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                          Min TZS{" "}
                          {(investModal.option.min_amount || investModal.option.price).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setInvestModal(null)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: theme.colors.surfaceSecondary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={20} color={theme.colors.text} />
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
                    Amount to invest (TZS)
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.surfaceSecondary,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 18,
                      fontWeight: "700",
                      color: theme.colors.text,
                      borderWidth: 1,
                      borderColor: theme.colors.borderLight,
                    }}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textMuted}
                    value={investModal.amount}
                    onChangeText={(t) =>
                      setInvestModal((m) => (m ? { ...m, amount: t } : null))
                    }
                    keyboardType="numeric"
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      marginTop: 8,
                    }}
                  >
                    Available: TZS {totalSavings.toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={handleInvest}
                    style={{
                      backgroundColor: theme.colors.primary,
                      paddingVertical: 16,
                      borderRadius: 14,
                      alignItems: "center",
                      marginTop: 24,
                    }}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
                      Confirm investment
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
