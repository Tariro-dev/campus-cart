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
import { useGetVendor } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Drinks": "#f59e0b",
  Electronics: "#3b82f6",
  Books: "#10b981",
  Clothing: "#8b5cf6",
  "Home & Living": "#ec4899",
};

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  "Food & Drinks": "coffee",
  Electronics: "cpu",
  Books: "book-open",
  Clothing: "tag",
  "Home & Living": "home",
};

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem } = useCart();

  const vendorQuery = useGetVendor(Number(id), {
    query: { queryKey: ["vendor", id] },
  });
  const vendor = vendorQuery.data;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const categoryColor =
    CATEGORY_COLORS[vendor?.category ?? ""] ?? colors.primary;
  const icon = CATEGORY_ICONS[vendor?.category ?? ""] ?? "shopping-bag";

  if (vendorQuery.isLoading || !vendor) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: colors.background, paddingTop: topPad + 60 },
        ]}
      >
        <Feather name="store" size={40} color={colors.mutedForeground} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading vendor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32,
        }}
      >
        {/* Header */}
        <View
          style={[styles.headerBg, { backgroundColor: colors.headerBg }]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { top: topPad + 12, backgroundColor: "rgba(255,255,255,0.15)" },
            ]}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>

          <View
            style={[
              styles.logoBox,
              { backgroundColor: categoryColor + "30", borderRadius: 20 },
            ]}
          >
            <Feather name={icon} size={40} color={categoryColor} />
          </View>

          <Text style={styles.vendorName}>{vendor.name}</Text>
          <Text style={styles.vendorCategory}>{vendor.category}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{vendor.totalProducts}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{vendor.totalOrders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{vendor.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View
          style={[
            styles.descSection,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.descText, { color: colors.mutedForeground }]}>
            {vendor.description}
          </Text>
          <View
            style={[
              styles.revenueBadge,
              { backgroundColor: "#10b98115", borderColor: "#10b98130" },
            ]}
          >
            <Feather name="trending-up" size={14} color="#10b981" />
            <Text style={{ color: "#10b981", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>
              ${vendor.totalRevenue.toFixed(2)} revenue
            </Text>
          </View>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={[styles.productsTitle, { color: colors.foreground }]}>
            {vendor.products.length} Product{vendor.products.length !== 1 ? "s" : ""}
          </Text>
          {vendor.products.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="package" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No products listed yet
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {vendor.products.map((p) => (
                <View key={p.id} style={styles.gridItem}>
                  <ProductCard
                    product={p}
                    onPress={() => router.push(`/product/${p.id}`)}
                    onAddToCart={() =>
                      addItem({
                        productId: p.id,
                        productName: p.name,
                        price: p.price,
                        vendorId: p.vendorId,
                        vendorName: p.vendorName,
                      })
                    }
                  />
                </View>
              ))}
            </View>
          )}
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
  headerBg: {
    paddingBottom: 24,
    alignItems: "center",
    paddingTop: 80,
    gap: 6,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBox: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  vendorCategory: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 0,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  descSection: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  descText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  revenueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  productsSection: {
    paddingHorizontal: 16,
  },
  productsTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: { width: "47%" },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
