import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, productsTable, vendorsTable } from "@workspace/db";
import { GetDashboardStatsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const query = GetDashboardStatsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const vendors = await db.select().from(vendorsTable);
  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

  let orders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);

  let products = await db.select().from(productsTable);

  if (query.data.vendorId) {
    orders = orders.filter((o) => o.vendorId === query.data.vendorId);
    products = products.filter((p) => p.vendorId === query.data.vendorId);
  }

  const totalRevenue = orders.reduce(
    (sum, o) => sum + parseFloat(o.totalAmount),
    0
  );
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const recentOrders = orders
    .slice(-5)
    .reverse()
    .map((o) => ({ ...o, totalAmount: parseFloat(o.totalAmount) }));

  const topProducts = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      price: parseFloat(p.price),
      vendorName: vendorMap.get(p.vendorId) ?? "Unknown Vendor",
    }));

  res.json({
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders,
    totalProducts: products.length,
    recentOrders,
    topProducts,
  });
});

export default router;
