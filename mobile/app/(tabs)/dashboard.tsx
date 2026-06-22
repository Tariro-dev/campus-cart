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
import {
  useGetDashboardStats,
  useListVendors,
  useUpdateOrderStatus,
  useListOrders,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { StatCard } from "@/components/StatCard";
import { OrderRow } from "@/components/OrderRow";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedVendorId, setSelectedVendorId] = useState<number | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  const statsQuery = useGetDashboardStats(
    { vendorId: selectedVendorId },
    {
      query: {
        queryKey: ["dashboard-stats", selectedVendorId],
      },
    }
  );

  const vendorsQuery = useListVendors();
  const ordersQuery = useListOrders(
    { vendorId: selectedVendorId },
    { query: { queryKey: ["orders-vendor", selectedVendorId] } }
  );

  const updateStatus = useUpdateOrderStatus();
  const stats = statsQuery.data;
  const vendors = vendorsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([statsQuery.refetch(), ordersQuery.refetch()]);
    setRefreshing(false);
  };

  const handleStatusUpdate = async (orderId: number, status: string) => {
    await updateStatus.mutateAsync({ id: orderId, data: { status } });
    ordersQuery.refetch();
    statsQuery.refetch();
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Vendor Dashboard</Text>
            <Text style={styles.subtitle}>Manage your store</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/vendors")}
            style={styles.manageBtn}
          >
            <Feather name="settings" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Vendor selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedVendorId(undefined)}
            style={[
              styles.vendorChip,
              {
                backgroundColor:
                  selectedVendorId === undefined
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.15)",
              },
            ]}
          >
            <Text
              style={[
                styles.vendorChipText,
                {
                  color:
                    selectedVendorId === undefined ? colors.primary : "#fff",
                },
              ]}
            >
              All Vendors
            </Text>
          </TouchableOpacity>
          {vendors.map((v) => (
            <TouchableOpacity
              key={v.id}
              onPress={() => setSelectedVendorId(v.id)}
              style={[
                styles.vendorChip,
                {
                  backgroundColor:
                    selectedVendorId === v.id
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.15)",
                },
              ]}
            >
              <Text
                style={[
                  styles.vendorChipText,
                  {
                    color:
                      selectedVendorId === v.id ? colors.primary : "#fff",
                  },
                ]}
              >
                {v.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Revenue"
            value={`$${(stats?.totalRevenue ?? 0).toFixed(0)}`}
            icon="dollar-sign"
            color="#10b981"
          />
          <StatCard
            label="Orders"
            value={String(stats?.totalOrders ?? 0)}
            icon="shopping-bag"
            color="#3b82f6"
            subtitle={`${stats?.pendingOrders ?? 0} pending`}
          />
          <StatCard
            label="Products"
            value={String(stats?.totalProducts ?? 0)}
            icon="package"
            color="#8b5cf6"
          />
          <StatCard
            label="Vendors"
            value={String(vendors.length)}
            icon="shopping-bag"
            color="#f59e0b"
          />
        </View>

        {/* Pending Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent Orders
            </Text>
            <TouchableOpacity onPress={() => router.push("/orders")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {ordersQuery.isLoading ? (
            <View style={{ gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[styles.skeleton, { backgroundColor: colors.muted }]}
                />
              ))}
            </View>
          ) : orders.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="inbox" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No orders yet
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {orders.slice(0, 6).map((order) => (
                <View key={order.id}>
                  <OrderRow
                    order={order}
                    onPress={() => router.push(`/order/${order.id}`)}
                  />
                  {order.status === "pending" && (
                    <View style={styles.statusActions}>
                      <TouchableOpacity
                        onPress={() =>
                          handleStatusUpdate(order.id, "processing")
                        }
                        style={[
                          styles.actionBtn,
                          { backgroundColor: "#3b82f620", borderColor: "#3b82f6" },
                        ]}
                      >
                        <Text style={{ color: "#3b82f6", fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                          Accept
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleStatusUpdate(order.id, "cancelled")
                        }
                        style={[
                          styles.actionBtn,
                          { backgroundColor: "#ef444420", borderColor: "#ef4444" },
                        ]}
                      >
                        <Text style={{ color: "#ef4444", fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {order.status === "processing" && (
                    <View style={styles.statusActions}>
                      <TouchableOpacity
                        onPress={() =>
                          handleStatusUpdate(order.id, "completed")
                        }
                        style={[
                          styles.actionBtn,
                          { backgroundColor: "#10b98120", borderColor: "#10b981" },
                        ]}
                      >
                        <Text style={{ color: "#10b981", fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                          Mark Complete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Top Products */}
        {stats?.topProducts && stats.topProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Top Products
            </Text>
            {stats.topProducts.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => router.push(`/product/${p.id}`)}
                style={[
                  styles.productRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.productIcon,
                    { backgroundColor: colors.primary + "15", borderRadius: 10 },
                  ]}
                >
                  <Feather name="package" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.productName, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {p.name}
                  </Text>
                  <Text style={[styles.productMeta, { color: colors.mutedForeground }]}>
                    {p.stock} in stock · {p.category}
                  </Text>
                </View>
                <Text style={[styles.productPrice, { color: colors.primary }]}>
                  ${p.price.toFixed(2)}
                </Text>
              </TouchableOpacity>
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
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  manageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  vendorChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  vendorChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  scroll: { padding: 16, gap: 0 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  skeleton: { height: 72, borderRadius: 14 },
  empty: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  statusActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 8,
  },
  productIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  productMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
