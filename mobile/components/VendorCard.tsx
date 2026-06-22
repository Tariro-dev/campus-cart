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
import type { Vendor } from "@workspace/api-client-react";

interface VendorCardProps {
  vendor: Vendor;
  onPress: () => void;
}

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

export function VendorCard({ vendor, onPress }: VendorCardProps) {
  const colors = useColors();
  const categoryColor = CATEGORY_COLORS[vendor.category] ?? colors.primary;
  const icon = CATEGORY_ICONS[vendor.category] ?? "shopping-bag";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 16,
        },
      ]}
    >
      <View
        style={[
          styles.logo,
          { backgroundColor: categoryColor + "20", borderRadius: 14 },
        ]}
      >
        <Feather name={icon} size={26} color={categoryColor} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {vendor.name}
        </Text>
        <Text
          style={[styles.desc, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {vendor.description}
        </Text>
        <View style={styles.meta}>
          <View
            style={[styles.badge, { backgroundColor: categoryColor + "15" }]}
          >
            <Text style={[styles.badgeText, { color: categoryColor }]}>
              {vendor.category}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color="#f59e0b" />
            <Text style={[styles.rating, { color: colors.mutedForeground }]}>
              {vendor.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>

      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  logo: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  desc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
