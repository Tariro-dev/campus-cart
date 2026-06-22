import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListOrders } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { OrderRow } from "@/components/OrderRow";

const STATUS_TABS = ["All", "pending", "processing", "completed", "cancelled"];

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const ordersQuery = useListOrders(
    {
      status: activeStatus !== "All" ? activeStatus : undefined,
    },
    { query: { queryKey: ["orders", activeStatus] } }
  );

  const orders = ordersQuery.data ?? [];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const onRefresh = async () => {
    setRefreshing(true);
    await ordersQuery.refetch();
    setRefreshing(false);
  };

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
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>{orders.length} orders total</Text>
      </View>

      {/* Status filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterBar, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_TABS.map((status) => {
          const isActive = activeStatus === status;
          return (
            <TouchableOpacity
              key={status}
              onPress={() => setActiveStatus(status)}
              activeOpacity={0.8}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isActive ? "#fff" : colors.mutedForeground,
                  },
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 84 : insets.bottom + 100,
          },
        ]}
      >
        {ordersQuery.isLoading ? (
          <View style={styles.loadingList}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.skeleton, { backgroundColor: colors.muted }]}
              />
            ))}
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="package" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No orders yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Your orders will appear here once you've made a purchase.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={[styles.shopBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onPress={() => router.push(`/order/${order.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
  },
  filterBar: { maxHeight: 56 },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  loadingList: { gap: 8 },
  skeleton: { height: 80, borderRadius: 14 },
  list: { gap: 8 },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  shopBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  shopBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
