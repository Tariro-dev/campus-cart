import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreateOrder } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import * as Haptics from "expo-haptics";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems, vendorId } = useCart();
  const createOrder = useCreateOrder();
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [placing, setPlacing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handlePlaceOrder = async () => {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      Alert.alert("Missing Info", "Please enter your name and email to place the order.");
      return;
    }

    if (!vendorId || items.length === 0) return;

    setPlacing(true);
    try {
      await createOrder.mutateAsync({
        data: {
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          vendorId,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      Alert.alert(
        "Order Placed!",
        "Your order has been placed successfully. You can track it in the Orders tab.",
        [{ text: "View Orders", onPress: () => router.replace("/orders") }]
      );
    } catch {
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Clear Cart", "Remove all items from your cart?", [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: clearCart },
              ]);
            }}
          >
            <Text style={styles.clearBtn}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="shopping-cart" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Browse products and add items to get started.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.shopBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scroll,
              {
                paddingBottom:
                  Platform.OS === "web" ? 34 + 200 : insets.bottom + 220,
              },
            ]}
          >
            {/* Vendor label */}
            <View
              style={[
                styles.vendorBanner,
                { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" },
              ]}
            >
              <Feather name="store" size={14} color={colors.primary} />
              <Text style={[styles.vendorBannerText, { color: colors.primary }]}>
                {items[0].vendorName}
              </Text>
            </View>

            {/* Items */}
            {items.map((item) => (
              <View
                key={item.productId}
                style={[
                  styles.itemRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.itemIcon,
                    { backgroundColor: colors.primary + "15", borderRadius: 10 },
                  ]}
                >
                  <Feather name="package" size={18} color={colors.primary} />
                </View>

                <View style={styles.itemInfo}>
                  <Text
                    style={[styles.itemName, { color: colors.foreground }]}
                    numberOfLines={2}
                  >
                    {item.productName}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    ${item.price.toFixed(2)} each
                  </Text>
                </View>

                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                    style={[styles.qtyBtn, { borderColor: colors.border }]}
                  >
                    <Feather
                      name={item.quantity === 1 ? "trash-2" : "minus"}
                      size={14}
                      color={item.quantity === 1 ? colors.destructive : colors.foreground}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: colors.foreground }]}>
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                    style={[
                      styles.qtyBtn,
                      { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                  >
                    <Feather name="plus" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Buyer info form */}
            <View
              style={[
                styles.form,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.formTitle, { color: colors.foreground }]}>
                Your Info
              </Text>

              <View style={[styles.inputWrap, { borderColor: colors.border }]}>
                <Feather name="user" size={16} color={colors.mutedForeground} />
                <TextInput
                  value={buyerName}
                  onChangeText={setBuyerName}
                  placeholder="Full name"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground }]}
                />
              </View>

              <View style={[styles.inputWrap, { borderColor: colors.border }]}>
                <Feather name="mail" size={16} color={colors.mutedForeground} />
                <TextInput
                  value={buyerEmail}
                  onChangeText={setBuyerEmail}
                  placeholder="University email"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.foreground }]}
                />
              </View>
            </View>
          </ScrollView>

          {/* Bottom summary */}
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
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </Text>
              <Text style={[styles.summaryTotal, { color: colors.foreground }]}>
                ${totalPrice.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handlePlaceOrder}
              disabled={placing}
              activeOpacity={0.85}
              style={[
                styles.placeBtn,
                { backgroundColor: placing ? colors.muted : colors.primary },
              ]}
            >
              {placing ? (
                <Text style={[styles.placeBtnText, { color: colors.mutedForeground }]}>
                  Placing Order...
                </Text>
              ) : (
                <>
                  <Feather name="check-circle" size={18} color="#fff" />
                  <Text style={styles.placeBtnText}>Place Order</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  clearBtn: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_500Medium",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 8 },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  shopBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  shopBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 10 },
  vendorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  vendorBannerText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  itemIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  itemPrice: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 15, fontFamily: "Inter_700Bold", minWidth: 20, textAlign: "center" },
  form: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 4,
  },
  formTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  bottomBar: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  summaryTotal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  placeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  placeBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
