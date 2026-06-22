import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListVendors } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { VendorCard } from "@/components/VendorCard";

const VENDOR_CATEGORIES = [
  "All",
  "Food & Drinks",
  "Electronics",
  "Books",
  "Clothing",
  "Home & Living",
];

export default function VendorsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const vendorsQuery = useListVendors();
  const vendors = (vendorsQuery.data ?? []).filter(
    (v) => filter === "All" || v.category === filter
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const onRefresh = async () => {
    setRefreshing(true);
    await vendorsQuery.refetch();
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
        <Text style={styles.title}>Campus Vendors</Text>
        <Text style={styles.subtitle}>
          {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 56, backgroundColor: colors.background }}
        contentContainerStyle={styles.filterRow}
      >
        {VENDOR_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setFilter(cat)}
            activeOpacity={0.8}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === cat ? colors.primary : colors.card,
                borderColor: filter === cat ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === cat ? "#fff" : colors.mutedForeground },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
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
        {vendorsQuery.isLoading ? (
          <View style={{ gap: 8 }}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.skeleton, { backgroundColor: colors.muted }]}
              />
            ))}
          </View>
        ) : vendors.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="shopping-bag" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No vendors in this category
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {vendors.map((v) => (
              <VendorCard
                key={v.id}
                vendor={v}
                onPress={() => router.push(`/vendor/${v.id}`)}
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
  filterRow: {
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
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  skeleton: { height: 80, borderRadius: 14 },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
