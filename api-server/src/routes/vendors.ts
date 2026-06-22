import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, vendorsTable, productsTable, ordersTable } from "@workspace/db";
import {
  CreateVendorBody,
  UpdateVendorBody,
  GetVendorParams,
  UpdateVendorParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/vendors", async (_req, res): Promise<void> => {
  const rows = await db.select().from(vendorsTable).orderBy(vendorsTable.createdAt);
  res.json(rows.map((v) => ({ ...v, rating: parseFloat(v.rating) })));
});

router.post("/vendors", async (req, res): Promise<void> => {
  const parsed = CreateVendorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [vendor] = await db.insert(vendorsTable).values(parsed.data).returning();
  res.status(201).json({ ...vendor, rating: parseFloat(vendor.rating) });
});

router.get("/vendors/:id", async (req, res): Promise<void> => {
  const params = GetVendorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [vendor] = await db
    .select()
    .from(vendorsTable)
    .where(eq(vendorsTable.id, params.data.id));

  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.vendorId, params.data.id));

  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.vendorId, params.data.id));

  const totalRevenue = orders.reduce(
    (sum, o) => sum + parseFloat(o.totalAmount),
    0
  );

  res.json({
    ...vendor,
    rating: parseFloat(vendor.rating),
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue,
    products: products.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      vendorName: vendor.name,
    })),
  });
});

router.patch("/vendors/:id", async (req, res): Promise<void> => {
  const params = UpdateVendorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateVendorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.rating !== undefined) {
    updateData.rating = String(parsed.data.rating);
  }

  const [vendor] = await db
    .update(vendorsTable)
    .set(updateData)
    .where(eq(vendorsTable.id, params.data.id))
    .returning();

  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }

  res.json({ ...vendor, rating: parseFloat(vendor.rating) });
});

export default router;
