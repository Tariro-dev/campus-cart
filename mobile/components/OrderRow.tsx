import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Order } from "@workspace/api-client-react";

interface OrderRowProps {
  order: Order;
  onPress: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; icon: keyof typeof Feather.glyphMap; label: string }
> = {
  pending: {
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: "clock",
    label: "Pending",
  },
  processing: {
    color: "#3b82f6",
    bg: "#dbeafe",
    icon: "refresh-cw",
    label: "Processing",
  },
  completed: {
    color: "#10b981",
    bg: "#d1fae5",
    icon: "check-circle",
    label: "Completed",
  },
  cancelled: {
    color: "#ef4444",
    bg: "#fee2e2",
    icon: "x-circle",
    label: "Cancelled",
  },
};

export function OrderRow({ order, onPress }: OrderRowProps) {
  const colors = useColors();
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 14,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: status.bg, borderRadius: 10 }]}>
        <Feather name={status.icon} size={18} color={status.color} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.orderId, { color: colors.foreground }]}>
          Order #{order.id}
        </Text>
        <Text style={[styles.buyer, { color: colors.mutedForeground }]}>
          {order.buyerName}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.foreground }]}>
          ${order.totalAmount.toFixed(2)}
        </Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  orderId: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  buyer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  date: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
