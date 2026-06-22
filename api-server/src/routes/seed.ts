import { Router, type IRouter } from "express";
import { db, vendorsTable, productsTable, ordersTable, orderItemsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/seed", async (_req, res): Promise<void> => {
  const existingVendors = await db.select().from(vendorsTable);
  if (existingVendors.length > 0) {
    res.json({ message: "Already seeded", vendorCount: existingVendors.length });
    return;
  }

  const vendors = await db
    .insert(vendorsTable)
    .values([
      {
        name: "Campus Eats",
        description: "Fresh meals and snacks delivered to your dorm or study spot.",
        category: "Food & Drinks",
        rating: "4.8",
      },
      {
        name: "TechHub",
        description: "Laptops, cables, chargers, and accessories for students.",
        category: "Electronics",
        rating: "4.6",
      },
      {
        name: "Book Exchange",
        description: "Buy, sell, and rent textbooks at student-friendly prices.",
        category: "Books",
        rating: "4.9",
      },
      {
        name: "Campus Closet",
        description: "Branded university apparel and casual student fashion.",
        category: "Clothing",
        rating: "4.5",
      },
      {
        name: "Dorm Essentials",
        description: "Everything you need to make your dorm feel like home.",
        category: "Home & Living",
        rating: "4.7",
      },
    ])
    .returning();

  const products = await db
    .insert(productsTable)
    .values([
      {
        name: "Acai Bowl",
        description: "Blended acai with granola, banana, honey, and fresh berries.",
        price: "9.99",
        category: "Food & Drinks",
        stock: 30,
        vendorId: vendors[0].id,
      },
      {
        name: "Matcha Latte",
        description: "Ceremonial grade matcha with oat milk, lightly sweetened.",
        price: "5.50",
        category: "Food & Drinks",
        stock: 50,
        vendorId: vendors[0].id,
      },
      {
        name: "Study Snack Box",
        description: "Curated box of trail mix, granola bars, and dried fruit for late nights.",
        price: "12.99",
        category: "Food & Drinks",
        stock: 25,
        vendorId: vendors[0].id,
      },
      {
        name: "USB-C Hub 7-in-1",
        description: "Multiport adapter with HDMI, USB-A, SD card, and PD charging.",
        price: "34.99",
        category: "Electronics",
        stock: 15,
        vendorId: vendors[1].id,
      },
      {
        name: "Laptop Stand",
        description: "Adjustable aluminum stand for ergonomic studying anywhere.",
        price: "28.99",
        category: "Electronics",
        stock: 20,
        vendorId: vendors[1].id,
      },
      {
        name: "Wireless Mouse",
        description: "Compact Bluetooth mouse, 3-month battery life.",
        price: "19.99",
        category: "Electronics",
        stock: 40,
        vendorId: vendors[1].id,
      },
      {
        name: "Calculus: Early Transcendentals",
        description: "Stewart 9th edition. Lightly used, all pages intact.",
        price: "45.00",
        category: "Books",
        stock: 8,
        vendorId: vendors[2].id,
      },
      {
        name: "Introduction to Psychology",
        description: "Myers & DeWall 13th ed. Highlights throughout but readable.",
        price: "30.00",
        category: "Books",
        stock: 5,
        vendorId: vendors[2].id,
      },
      {
        name: "Organic Chemistry",
        description: "Clayden 2nd ed. Good condition, no writing.",
        price: "55.00",
        category: "Books",
        stock: 3,
        vendorId: vendors[2].id,
      },
      {
        name: "University Hoodie",
        description: "Premium fleece hoodie with embroidered university crest.",
        price: "49.99",
        category: "Clothing",
        stock: 35,
        vendorId: vendors[3].id,
      },
      {
        name: "Campus Snapback",
        description: "Adjustable cap with the school logo embroidered on front.",
        price: "22.00",
        category: "Clothing",
        stock: 45,
        vendorId: vendors[3].id,
      },
      {
        name: "Mini Desk Fan",
        description: "USB-powered quiet fan perfect for dorm rooms, 3 speed settings.",
        price: "15.99",
        category: "Home & Living",
        stock: 22,
        vendorId: vendors[4].id,
      },
      {
        name: "Dorm Bedding Set",
        description: "Twin XL microfiber sheet set, hypoallergenic, machine washable.",
        price: "39.99",
        category: "Home & Living",
        stock: 12,
        vendorId: vendors[4].id,
      },
      {
        name: "Shower Caddy",
        description: "Rust-proof mesh caddy with hooks and soap dish. Perfect for communal showers.",
        price: "14.99",
        category: "Home & Living",
        stock: 30,
        vendorId: vendors[4].id,
      },
    ])
    .returning();

  const [order1] = await db
    .insert(ordersTable)
    .values({
      buyerName: "Alex Chen",
      buyerEmail: "alex.chen@university.edu",
      vendorId: vendors[0].id,
      totalAmount: "15.49",
      status: "completed",
    })
    .returning();

  await db.insert(orderItemsTable).values([
    { orderId: order1.id, productId: products[0].id, productName: products[0].name, quantity: 1, unitPrice: "9.99" },
    { orderId: order1.id, productId: products[1].id, productName: products[1].name, quantity: 1, unitPrice: "5.50" },
  ]);

  const [order2] = await db
    .insert(ordersTable)
    .values({
      buyerName: "Jordan Lee",
      buyerEmail: "jordan.lee@university.edu",
      vendorId: vendors[1].id,
      totalAmount: "34.99",
      status: "pending",
    })
    .returning();

  await db.insert(orderItemsTable).values([
    { orderId: order2.id, productId: products[3].id, productName: products[3].name, quantity: 1, unitPrice: "34.99" },
  ]);

  const [order3] = await db
    .insert(ordersTable)
    .values({
      buyerName: "Sam Rivera",
      buyerEmail: "sam.rivera@university.edu",
      vendorId: vendors[2].id,
      totalAmount: "75.00",
      status: "processing",
    })
    .returning();

  await db.insert(orderItemsTable).values([
    { orderId: order3.id, productId: products[6].id, productName: products[6].name, quantity: 1, unitPrice: "45.00" },
    { orderId: order3.id, productId: products[7].id, productName: products[7].name, quantity: 1, unitPrice: "30.00" },
  ]);

  res.json({
    message: "Seeded successfully",
    vendorCount: vendors.length,
    productCount: products.length,
  });
});

export default router;
