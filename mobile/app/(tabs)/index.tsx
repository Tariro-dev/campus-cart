import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useListProducts,
  useGetRecommendations,
  useListVendors,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { VendorCard } from "@/components/VendorCard";

const CATEGORIES = [
  "All",
  "Food & Drinks",
  "Electronics",
  "Books",
  "Clothing",
  "Home & Living",
];

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, totalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const productsQuery = useListProducts(
    {
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      search: search || undefined,
    },
    { query: { queryKey: ["products", selectedCategory, search] } }
  );

  const vendorsQuery = useListVendors();

  const recsQuery = useGetRecommendations(
    {
      userId: "guest",
      category: selectedCategory !== "All" ? selectedCategory : undefined,
    },
    { mutation: {} }
  );

  const products = productsQuery.data ?? [];
  const vendors = vendorsQuery.data ?? [];
  const recommendations = recsQuery.data?.products ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([productsQuery.refetch(), vendorsQuery.refetch()]);
    setRefreshing(false);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Campus Cart</Text>
            <Text style={styles.headerSub}>University Marketplace</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={styles.cartBtn}
          >
            <Feather name="shopping-cart" size={22} color="#fff" />
            {totalItems > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.cartBadgeText, { color: colors.accentForeground }]}>
                  {totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: "rgba(255,255,255,0.15)" },
          ]}
        >
          <Feather name="search" size={16} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
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
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
              style={[
                styles.catChip,
                {
                  backgroundColor:
                    selectedCategory === cat ? colors.primary : colors.card,
                  borderColor:
                    selectedCategory === cat ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  {
                    color:
                      selectedCategory === cat
                        ? "#fff"
                        : colors.mutedForeground,
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* AI Recommendations */}
        {recommendations.length > 0 && selectedCategory === "All" && !search && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather name="zap" size={16} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  AI Picks For You
                </Text>
              </View>
            </View>
            <FlatList
              horizontal
              data={recommendations}
              keyExtractor={(item) => `rec-${item.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  compact
                  onPress={() => router.push(`/product/${item.id}`)}
                  onAddToCart={() =>
                    addItem({
                      productId: item.id,
                      productName: item.name,
                      price: item.price,
                      vendorId: item.vendorId,
                      vendorName: item.vendorName,
                    })
                  }
                />
              )}
            />
          </View>
        )}

        {/* Vendors */}
        {selectedCategory === "All" && !search && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: colors.foreground }]}
              >
                Campus Vendors
              </Text>
              <TouchableOpacity onPress={() => router.push("/vendors")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            {vendorsQuery.isLoading ? (
              <View style={[styles.skeleton, { backgroundColor: colors.muted }]} />
            ) : (
              vendors.slice(0, 3).map((v) => (
                <VendorCard
                  key={v.id}
                  vendor={v}
                  onPress={() => router.push(`/vendor/${v.id}`)}
                />
              ))
            )}
          </View>
        )}

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {selectedCategory === "All" ? "All Products" : selectedCategory}
            </Text>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {products.length} items
            </Text>
          </View>

          {productsQuery.isLoading ? (
            <View style={styles.loadingGrid}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.skeletonCard,
                    { backgroundColor: colors.muted },
                  ]}
                />
              ))}
            </View>
          ) : products.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="package" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No products found
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {products.map((p) => (
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerGreeting: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
  },
  cartBtn: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  scroll: { gap: 0 },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  section: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  count: { fontSize: 12, fontFamily: "Inter_400Regular" },
  skeleton: { height: 80, borderRadius: 12, marginHorizontal: 16, marginBottom: 8 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  gridItem: { width: "47%" },
  loadingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  skeletonCard: {
    width: "47%",
    height: 180,
    borderRadius: 16,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
