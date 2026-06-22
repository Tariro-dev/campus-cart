import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetProduct } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import * as Haptics from "expo-haptics";

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

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, vendorId: cartVendorId, items } = useCart();

  const productQuery = useGetProduct(Number(id), {
    query: { queryKey: ["product", id] },
  });
  const product = productQuery.data;

  const inCart = items.find((i) => i.productId === Number(id));
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleAddToCart = () => {
    if (!product) return;

    if (cartVendorId !== null && cartVendorId !== product.vendorId) {
      Alert.alert(
        "Different Vendor",
        "Your cart has items from a different vendor. Clear cart to add this item?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear & Add",
            onPress: () => {
              addItem({
                productId: product.id,
                productName: product.name,
                price: product.price,
                vendorId: product.vendorId,
                vendorName: product.vendorName,
              });
            },
          },
        ]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
    });
  };

  const categoryColor =
    CATEGORY_COLORS[product?.category ?? ""] ?? colors.primary;
  const categoryIcon =
    CATEGORY_ICONS[product?.category ?? ""] ?? "package";

  if (productQuery.isLoading) {
    return (
      <View
        style={[
          styles.loading,
          {
            backgroundColor: colors.background,
            paddingTop: topPad + 60,
          },
        ]}
      >
        <Feather name="package" size={40} color={colors.mutedForeground} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading product...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: colors.background, paddingTop: topPad + 60 },
        ]}
      >
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Product not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 120,
        }}
      >
        {/* Image area */}
        <View
          style={[
            styles.imageArea,
            { backgroundColor: categoryColor + "15" },
          ]}
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              {
                backgroundColor: colors.card,
                top: topPad + 12,
              },
            ]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>

          <Feather name={categoryIcon} size={80} color={categoryColor} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryColor + "18" },
              ]}
            >
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {product.category}
              </Text>
            </View>
            <View style={styles.stockRow}>
              <View
                style={[
                  styles.stockDot,
                  {
                    backgroundColor:
                      product.stock > 0 ? "#10b981" : "#ef4444",
                  },
                ]}
              />
              <Text style={[styles.stockText, { color: colors.mutedForeground }]}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </Text>
            </View>
          </View>

          <Text style={[styles.name, { color: colors.foreground }]}>
            {product.name}
          </Text>

          <TouchableOpacity
            onPress={() => router.push(`/vendor/${product.vendorId}`)}
          >
            <Text style={[styles.vendor, { color: colors.primary }]}>
              by {product.vendorName} →
            </Text>
          </TouchableOpacity>

          <Text style={[styles.price, { color: colors.foreground }]}>
            ${product.price.toFixed(2)}
          </Text>

          <View
            style={[styles.divider, { backgroundColor: colors.border }]}
          />

          <Text style={[styles.descTitle, { color: colors.foreground }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {product.description}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 16,
          },
        ]}
      >
        {inCart ? (
          <View style={styles.inCartRow}>
            <View
              style={[
                styles.inCartBadge,
                { backgroundColor: "#10b98120", borderColor: "#10b981" },
              ]}
            >
              <Feather name="check-circle" size={16} color="#10b981" />
              <Text style={{ color: "#10b981", fontSize: 14, fontFamily: "Inter_600SemiBold" }}>
                In cart ({inCart.quantity})
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={[styles.cartBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.cartBtnText}>View Cart</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={product.stock === 0}
            activeOpacity={0.8}
            style={[
              styles.addBtn,
              {
                backgroundColor:
                  product.stock === 0 ? colors.muted : colors.primary,
              },
            ]}
          >
            <Feather
              name="shopping-cart"
              size={18}
              color={product.stock === 0 ? colors.mutedForeground : "#fff"}
            />
            <Text
              style={[
                styles.addBtnText,
                {
                  color:
                    product.stock === 0 ? colors.mutedForeground : "#fff",
                },
              ]}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  imageArea: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
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
  content: { padding: 20, gap: 12 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  name: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  vendor: { fontSize: 14, fontFamily: "Inter_500Medium" },
  price: { fontSize: 28, fontFamily: "Inter_700Bold" },
  divider: { height: 1, marginVertical: 4 },
  descTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  bottomBar: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inCartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inCartBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cartBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  cartBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  addBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
