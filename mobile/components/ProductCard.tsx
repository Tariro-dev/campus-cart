import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
  compact?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Drinks": "#f59e0b",
  Electronics: "#3b82f6",
  Books: "#10b981",
  Clothing: "#8b5cf6",
  "Home & Living": "#ec4899",
};

export function ProductCard({
  product,
  onPress,
  onAddToCart,
  compact = false,
}: ProductCardProps) {
  const colors = useColors();
  const categoryColor =
    CATEGORY_COLORS[product.category] ?? colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderColor: colors.border,
          width: compact ? 160 : "100%",
        },
      ]}
    >
      <View
        style={[
          styles.imagePlaceholder,
          { backgroundColor: categoryColor + "18", borderRadius: 12 },
        ]}
      >
        <Feather
          name={getCategoryIcon(product.category)}
          size={compact ? 28 : 36}
          color={categoryColor}
        />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.name, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <Text
          style={[styles.vendor, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {product.vendorName}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.primary }]}>
            ${product.price.toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={onAddToCart}
            activeOpacity={0.7}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

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
      </View>
    </TouchableOpacity>
  );
}

function getCategoryIcon(category: string): keyof typeof Feather.glyphMap {
  const map: Record<string, keyof typeof Feather.glyphMap> = {
    "Food & Drinks": "coffee",
    Electronics: "cpu",
    Books: "book-open",
    Clothing: "tag",
    "Home & Living": "home",
  };
  return map[category] ?? "package";
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  imagePlaceholder: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    margin: 12,
    marginBottom: 0,
  },
  content: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  vendor: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
});
