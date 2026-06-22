import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, productsTable, vendorsTable } from "@workspace/db";
import {
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
  ListProductsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const vendors = await db.select().from(vendorsTable);
  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

  let rows = await db.select().from(productsTable).orderBy(productsTable.createdAt);

  if (query.data.category) {
    rows = rows.filter((p) => p.category === query.data.category);
  }
  if (query.data.vendorId) {
    rows = rows.filter((p) => p.vendorId === query.data.vendorId);
  }
  if (query.data.search) {
    const term = query.data.search.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  res.json(
    rows.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      vendorName: vendorMap.get(p.vendorId) ?? "Unknown Vendor",
    }))
  );
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const vendor = await db
    .select()
    .from(vendorsTable)
    .where(eq(vendorsTable.id, parsed.data.vendorId));
  if (!vendor[0]) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({ ...parsed.data, price: String(parsed.data.price) })
    .returning();

  res.status(201).json({
    ...product,
    price: parseFloat(product.price),
    vendorName: vendor[0].name,
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [vendor] = await db
    .select()
    .from(vendorsTable)
    .where(eq(vendorsTable.id, product.vendorId));

  res.json({
    ...product,
    price: parseFloat(product.price),
    vendorName: vendor?.name ?? "Unknown Vendor",
  });
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price !== undefined) {
    updateData.price = String(parsed.data.price);
  }

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [vendor] = await db
    .select()
    .from(vendorsTable)
    .where(eq(vendorsTable.id, product.vendorId));

  res.json({
    ...product,
    price: parseFloat(product.price),
    vendorName: vendor?.name ?? "Unknown Vendor",
  });
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
