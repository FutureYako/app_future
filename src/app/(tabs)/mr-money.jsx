import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Bot,
  Lightbulb,
  PiggyBank,
  TrendingUp,
  Receipt,
  GraduationCap,
  Target,
  X,
  Send,
  Sparkles,
} from "lucide-react-native";
import useTheme from "@/utils/theme";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { useDemoResetStore } from "@/store/demoResetStore";

const TOPICS = [
  {
    id: "education",
    title: "Financial Education",
    subtitle: "Basics of money management",
    icon: GraduationCap,
    color: "#3B82F6",
    tips: [
      "Understand the difference between assets (put money in your pocket) and liabilities (take money out). Focus on building assets over time.",
      "Learn the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Adjust for your situation but always pay yourself first.",
      "Compound interest is your friend when saving and investing—start early even with small amounts.",
    ],
  },
  {
    id: "spending",
    title: "Spending & Savings",
    subtitle: "Smart habits for daily life",
    icon: PiggyBank,
    color: "#22C55E",
    tips: [
      "Track every shilling for 30 days. You'll spot leaks (subscriptions, small daily spends) you can cut without pain.",
      "Automate savings: set up a standing order so a portion of every income goes to savings before you see it. Future Yako app helps you do this.",
      "Before any non-essential purchase, ask: 'Do I need this or just want it?' Wait 24–48 hours for wants.",
    ],
  },
  {
    id: "opportunities",
    title: "Opportunities",
    subtitle: "See opportunities, not obstacles",
    icon: Target,
    color: "#8B5CF6",
    tips: [
      "Every challenge has a flip side: inflation pushes you to learn investing; low income pushes you to build skills and side income.",
      "Look for gaps around you—problems people pay to solve. Your side hustle or business can fill that gap.",
      "Network with people who are where you want to be. Opportunities often come through people, not job boards.",
    ],
  },
  {
    id: "investment",
    title: "Investment Opportunities",
    subtitle: "Grow your wealth",
    icon: TrendingUp,
    color: "#F59E0B",
    tips: [
      "Diversify: don't put all money in one asset. Mix DSE stocks, unit trusts, bonds, and emergency cash.",
      "Start with what you understand. If you're new, consider unit trusts (UTTs) before picking individual stocks.",
      "Think long-term. Market dips are normal; avoid selling in panic. Time in the market beats timing the market.",
    ],
  },
  {
    id: "market",
    title: "Market Trends & Evaluation",
    subtitle: "Stay informed",
    icon: TrendingUp,
    color: "#06B6D4",
    tips: [
      "Follow local markets (e.g. DSE) and global indices. Understand how news (rates, politics, earnings) affects prices.",
      "Evaluate investments by fundamentals: earnings, debt, growth. Avoid buying on hype alone.",
      "Review your portfolio at least quarterly. Rebalance if one asset grows too large relative to your plan.",
    ],
  },
  {
    id: "tax",
    title: "Tax Education",
    subtitle: "Know your obligations",
    icon: Receipt,
    color: "#EC4899",
    tips: [
      "In Tanzania, understand PAYE, withholding tax, and VAT basics. Know what applies to your income and business.",
      "Keep records: receipts, contracts, bank statements. They support deductions and avoid disputes.",
      "Use legal tax incentives (e.g. for certain investments or sectors) and file on time to avoid penalties.",
    ],
  },
  {
    id: "literacy",
    title: "Financial Literacy",
    subtitle: "Build your money mindset",
    icon: Lightbulb,
    color: "#10B981",
    tips: [
      "Financial literacy is a skill: budget, save, invest, and protect (insurance). Learn one area at a time.",
      "Read or listen to one money book or podcast per month. Small, consistent learning compounds.",
      "Teach someone else what you learn. Explaining solidifies your understanding and helps your community.",
    ],
  },
];

// Topic-specific demo Q&A for chat (keyword match or first tip as fallback)
function getTopicChatReply(topic, question) {
  const q = (question || "").toLowerCase();
  const tips = topic.tips || [];
  // Optional: add topic-specific Q&A pairs per topic id
  const topicQA = {
    education: [
      ["50/30/20", "Learn the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Adjust for your situation but always pay yourself first."],
      ["budget", "Start with tracking every shilling. Then allocate using a simple rule like 50/30/20—needs, wants, savings. Pay yourself first."],
      ["asset", "Assets put money in your pocket (rent, dividends, business). Liabilities take it out (loans, subscriptions). Focus on building assets over time."],
    ],
    spending: [
      ["save", "Automate savings so a portion of every income goes to savings before you see it. Future Yako helps you do this with auto-deduction."],
      ["spend", "Track every shilling for 30 days to spot leaks. Before non-essential buys, ask: need or want? Wait 24–48 hours for wants."],
    ],
    opportunities: [
      ["side", "Look for gaps around you—problems people pay to solve. Your side hustle or business can fill that gap. Start small."],
      ["opportunity", "Every challenge has a flip side. Network with people who are where you want to be; opportunities often come through people."],
    ],
    investment: [
      ["diversify", "Don't put all money in one asset. Mix DSE stocks, unit trusts, bonds, and emergency cash. Start with UTTs if you're new."],
      ["dse", "Consider DSE unit trusts (UTTs) for diversification. Open a CDS account and invest small amounts regularly. Think long-term."],
    ],
    market: [
      ["trend", "Follow local markets (e.g. DSE) and how news affects prices. Evaluate by fundamentals—earnings, debt, growth—not hype."],
      ["portfolio", "Review your portfolio at least quarterly. Rebalance if one asset grows too large relative to your plan."],
    ],
    tax: [
      ["paye", "In Tanzania, understand PAYE (employment), withholding tax, and VAT. Keep records: receipts, contracts, bank statements."],
      ["tax", "Use legal tax incentives for certain investments and file on time. Good records support deductions and avoid disputes."],
    ],
    literacy: [
      ["learn", "Financial literacy is a skill: budget, save, invest, protect. Learn one area at a time. One book or podcast per month compounds."],
      ["mindset", "Teach someone else what you learn. Explaining solidifies your understanding and helps your community."],
    ],
  };
  const qa = topicQA[topic.id] || [];
  for (const [keyword, answer] of qa) {
    if (q.includes(keyword)) return answer;
  }
  return tips[0] || "Ask me anything about " + topic.subtitle + " and I'll guide you.";
}

const DEMO_QUESTIONS = [
  "How much should I save from my salary?",
  "What's the best way to start investing in Tanzania?",
  "How do I reduce my spending without feeling deprived?",
  "What are the best opportunity sectors to invest in Tanzania?",
];

const DEMO_RESPONSES = [
  "Aim for at least 20% of your income. Start with whatever you can—even 5%—and increase by 1–2% every few months. Use Future Yako's auto-deduction so savings happen before you spend.",
  "Start with an emergency fund (3–6 months expenses), then consider DSE unit trusts (UTTs) for diversification. Open a CDS account and invest small amounts regularly. Learn as you go.",
  "Track spending first. Cut the 'invisible' costs: subscriptions you don't use, small daily buys. Set a fun budget so you don't feel deprived—sustainability beats perfection.",
  "In Tanzania, some of the most promising sectors for investment include: (1) Agriculture & agribusiness—crops, livestock, and processing, with growing demand and government focus. (2) Energy & renewables—solar, gas, and hydro as the country expands power access. (3) Financial services & fintech—mobile money, savings, and credit serving the unbanked. (4) Mining & minerals—gold and other resources with proper licensing. (5) Tourism & hospitality—wildlife, beaches, and cultural heritage. (6) Manufacturing & light industry—import substitution and local production. Do your own research, consider DSE-listed companies in these sectors, and diversify across a few rather than betting on one.",
];

export default function MrMoneyScreen() {
  useRequireAuth();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicChatInput, setTopicChatInput] = useState("");
  const [topicChats, setTopicChats] = useState({}); // { [topicId]: [{ role, text }] }
  const [topicChatThinking, setTopicChatThinking] = useState(false);
  const topicChatScrollRef = useRef(null);
  const [askInput, setAskInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const resetKey = useDemoResetStore((s) => s.resetKey);

  useEffect(() => {
    if (resetKey > 0) {
      setChatMessages([]);
      setTopicChats({});
      setSelectedTopic(null);
    }
  }, [resetKey]);

  const handleAskMrMoney = () => {
    const q = askInput.trim();
    if (!q) return;
    setChatMessages((prev) => [...prev, { role: "user", text: q }]);
    setAskInput("");
    setIsThinking(true);
    setTimeout(() => {
      const demoReplyByQuestion = {
        [DEMO_QUESTIONS[0]]: DEMO_RESPONSES[0],
        [DEMO_QUESTIONS[1]]: DEMO_RESPONSES[1],
        [DEMO_QUESTIONS[2]]: DEMO_RESPONSES[2],
        [DEMO_QUESTIONS[3]]: DEMO_RESPONSES[3],
      };
      const reply =
        demoReplyByQuestion[q] ||
        DEMO_RESPONSES[chatMessages.length % DEMO_RESPONSES.length] ||
        "Great question! As your financial advisor, I recommend building habits step by step: save first, spend second, and keep learning. Use the topics above to dive deeper into any area.";
      setChatMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setIsThinking(false);
    }, 1200);
  };

  const topicMessages = selectedTopic
    ? topicChats[selectedTopic.id] || []
    : [];

  const sendTopicMessage = () => {
    const q = topicChatInput.trim();
    if (!q || !selectedTopic) return;
    const id = selectedTopic.id;
    const userMsg = { role: "user", text: q };
    setTopicChats((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), userMsg],
    }));
    setTopicChatInput("");
    setTopicChatThinking(true);
    setTimeout(() => {
      const reply = getTopicChatReply(selectedTopic, q);
      setTopicChats((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), { role: "assistant", text: reply }],
      }));
      setTopicChatThinking(false);
    }, 1000);
  };

  useEffect(() => {
    if (topicMessages.length > 0 && topicChatScrollRef.current) {
      setTimeout(() => topicChatScrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [topicMessages.length]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.colors.primary + "25",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Bot size={26} color={theme.colors.primary} />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: theme.colors.text,
                }}
              >
                Mr Money
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  marginTop: 2,
                }}
              >
                Your financial AI advisor
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.primary + "15",
              borderRadius: 16,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: theme.colors.text,
                fontWeight: "600",
                fontStyle: "italic",
              }}
            >
              "See opportunities, not obstacles."
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.textSecondary,
                marginTop: 8,
              }}
            >
              Get guidance on savings, investments, market trends, tax, and
              financial literacy—all in one place.
            </Text>
          </View>
        </View>

        {/* Ask Mr Money */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.colors.text,
              marginBottom: 12,
            }}
          >
            Ask Mr Money
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                color: theme.colors.text,
                fontSize: 15,
                paddingVertical: 12,
                paddingHorizontal: 8,
              }}
              placeholder="e.g. How much should I save from my salary?"
              placeholderTextColor={theme.colors.textMuted}
              value={askInput}
              onChangeText={setAskInput}
              onSubmitEditing={handleAskMrMoney}
              returnKeyType="send"
              editable={!isThinking}
            />
            <TouchableOpacity
              onPress={handleAskMrMoney}
              disabled={isThinking}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isThinking ? (
                <Text style={{ color: "#FFF", fontSize: 12 }}>...</Text>
              ) : (
                <Send size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
            {DEMO_QUESTIONS.map((q, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setAskInput(q);
                }}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: theme.colors.surfaceSecondary,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ fontSize: 12, color: theme.colors.textSecondary }}
                  numberOfLines={1}
                >
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {chatMessages.length > 0 && (
            <View style={{ marginTop: 16 }}>
              {chatMessages.map((msg, i) => (
                <View
                  key={i}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      backgroundColor:
                        msg.role === "user"
                          ? theme.colors.primary + "20"
                          : theme.colors.surfaceSecondary,
                      padding: 14,
                      borderRadius: 16,
                      borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                      borderBottomLeftRadius: msg.role === "user" ? 16 : 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.colors.text,
                        lineHeight: 20,
                      }}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Topics */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Sparkles size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              Explore by topic
            </Text>
          </View>
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <TouchableOpacity
                key={topic.id}
                onPress={() => setSelectedTopic(topic)}
                activeOpacity={0.8}
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
                    backgroundColor: topic.color + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Icon size={24} color={topic.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 16,
                      color: theme.colors.text,
                    }}
                  >
                    {topic.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {topic.subtitle}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.textSecondary }}>→</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Topic chat modal */}
      <Modal
        visible={!!selectedTopic}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTopic(null)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
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
                maxHeight: "85%",
                minHeight: 400,
                paddingBottom: insets.bottom + 16,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.borderLight,
                }}
              >
                {selectedTopic && (
                  <>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          backgroundColor: selectedTopic.color + "20",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <selectedTopic.icon size={22} color={selectedTopic.color} />
                      </View>
                      <View>
                        <Text
                          style={{
                            fontWeight: "700",
                            fontSize: 18,
                            color: theme.colors.text,
                          }}
                        >
                          {selectedTopic.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: theme.colors.textSecondary,
                          }}
                        >
                          {selectedTopic.subtitle}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedTopic(null)}
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
                  </>
                )}
              </View>

              {/* Chat messages */}
              <ScrollView
                ref={topicChatScrollRef}
                style={{ flex: 1, maxHeight: 320 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}
                showsVerticalScrollIndicator={false}
              >
                {topicMessages.length === 0 && (
                  <View
                    style={{
                      alignSelf: "flex-start",
                      maxWidth: "88%",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.surfaceSecondary,
                        padding: 14,
                        borderRadius: 16,
                        borderBottomLeftRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.text,
                          lineHeight: 20,
                        }}
                      >
                        You're chatting about {selectedTopic?.title}. Ask me anything about {selectedTopic?.subtitle} and I'll guide you.
                      </Text>
                    </View>
                  </View>
                )}
                {topicMessages.map((msg, i) => (
                  <View
                    key={i}
                    style={{
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "88%",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor:
                          msg.role === "user"
                            ? selectedTopic?.color + "25"
                            : theme.colors.surfaceSecondary,
                        padding: 14,
                        borderRadius: 16,
                        borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                        borderBottomLeftRadius: msg.role === "user" ? 16 : 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.text,
                          lineHeight: 20,
                        }}
                      >
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                ))}
                {topicChatThinking && (
                  <View
                    style={{
                      alignSelf: "flex-start",
                      marginBottom: 12,
                      backgroundColor: theme.colors.surfaceSecondary,
                      padding: 14,
                      borderRadius: 16,
                      borderBottomLeftRadius: 4,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>...</Text>
                  </View>
                )}
              </ScrollView>

              {/* Input row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: 8,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.borderLight,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    color: theme.colors.text,
                    fontSize: 15,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                  }}
                  placeholder={`Ask about ${selectedTopic?.title ?? "this topic"}...`}
                  placeholderTextColor={theme.colors.textMuted}
                  value={topicChatInput}
                  onChangeText={setTopicChatInput}
                  onSubmitEditing={sendTopicMessage}
                  returnKeyType="send"
                  editable={!topicChatThinking}
                />
                <TouchableOpacity
                  onPress={sendTopicMessage}
                  disabled={topicChatThinking}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: selectedTopic?.color || theme.colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 10,
                  }}
                >
                  <Send size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
