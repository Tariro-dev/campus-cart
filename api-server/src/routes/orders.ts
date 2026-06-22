import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderStatusBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  ListOrdersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const serializeOrder = (o: typeof ordersTable.$inferSelect) => ({
  ...o,
  totalAmount: parseFloat(o.totalAmount),
});

router.get("/orders", async (req, res): Promise<void> => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let rows = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);

  if (query.data.vendorId) {
    rows = rows.filter((o) => o.vendorId === query.data.vendorId);
  }
  if (query.data.status) {
    rows = rows.filter((o) => o.status === query.data.status);
  }

  res.json(rows.map(serializeOrder));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let totalAmount = 0;
  const itemsWithDetails = [];

  for (const item of parsed.data.items) {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, item.productId));

    if (!product) {
      res.status(404).json({ error: `Product ${item.productId} not found` });
      return;
    }

    const price = parseFloat(product.price);
    totalAmount += price * item.quantity;
    itemsWithDetails.push({ ...item, productName: product.name, unitPrice: price });
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      buyerName: parsed.data.buyerName,
      buyerEmail: parsed.data.buyerEmail,
      vendorId: parsed.data.vendorId,
      totalAmount: String(totalAmount),
      status: "pending",
    })
    .returning();

  for (const item of itemsWithDetails) {
    await db.insert(orderItemsTable).values({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
    });
  }

  res.status(201).json(serializeOrder(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, params.data.id));

  res.json({
    ...serializeOrder(order),
    items: items.map((i) => ({
      ...i,
      unitPrice: parseFloat(i.unitPrice),
    })),
  });
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

export default router;
