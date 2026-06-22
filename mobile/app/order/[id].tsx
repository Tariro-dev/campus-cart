import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetOrder } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; icon: keyof typeof Feather.glyphMap; label: string }
> = {
  pending: { color: "#f59e0b", bg: "#fef3c7", icon: "clock", label: "Pending" },
  processing: { color: "#3b82f6", bg: "#dbeafe", icon: "refresh-cw", label: "Processing" },
  completed: { color: "#10b981", bg: "#d1fae5", icon: "check-circle", label: "Completed" },
  cancelled: { color: "#ef4444", bg: "#fee2e2", icon: "x-circle", label: "Cancelled" },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const orderQuery = useGetOrder(Number(id), {
    query: { queryKey: ["order", id] },
  });
  const order = orderQuery.data;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const status = order ? STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending : null;

  if (orderQuery.isLoading || !order) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: colors.background, paddingTop: topPad + 60 },
        ]}
      >
        <Feather name="package" size={40} color={colors.mutedForeground} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading order...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBg,
            paddingTop: topPad + 12,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Order #{order.id}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32,
        }}
      >
        {/* Status card */}
        {status && (
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: status.bg,
                borderRadius: 16,
              },
            ]}
          >
            <Feather name={status.icon} size={32} color={status.color} />
            <Text style={[styles.statusLabel, { color: status.color }]}>
              {status.label}
            </Text>
            <Text style={[styles.statusDate, { color: status.color + "bb" }]}>
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        )}

        {/* Buyer info */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Buyer Details
          </Text>
          <View style={styles.infoRow}>
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              {order.buyerName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              {order.buyerEmail}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Order Items ({order.items.length})
          </Text>
          {order.items.map((item) => (
            <View
              key={item.id}
              style={[styles.itemRow, { borderTopColor: colors.border }]}
            >
              <View
                style={[
                  styles.itemIcon,
                  { backgroundColor: colors.primary + "15", borderRadius: 8 },
                ]}
              >
                <Feather name="package" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.itemName, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {item.productName}
                </Text>
                <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>
                  x{item.quantity} @ ${item.unitPrice.toFixed(2)}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.foreground }]}>
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
              Total
            </Text>
            <Text style={[styles.totalAmount, { color: colors.foreground }]}>
              ${order.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  statusCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  statusLabel: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statusDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  itemIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  itemQty: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  itemTotal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  totalAmount: { fontSize: 20, fontFamily: "Inter_700Bold" },
});
