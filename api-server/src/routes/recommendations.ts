import { Router, type IRouter } from "express";
import { db, productsTable, vendorsTable } from "@workspace/db";
import { GetRecommendationsBody } from "@workspace/api-zod";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

router.post("/recommendations", async (req, res): Promise<void> => {
  const parsed = GetRecommendationsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, recentProductIds, budget } = parsed.data;

  const allProducts = await db.select().from(productsTable);
  const vendors = await db.select().from(vendorsTable);
  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

  let candidates = allProducts;
  if (category) {
    candidates = candidates.filter((p) => p.category === category);
  }
  if (budget) {
    candidates = candidates.filter((p) => parseFloat(p.price) <= budget);
  }
  if (recentProductIds?.length) {
    candidates = candidates.filter((p) => !recentProductIds.includes(p.id));
  }

  if (candidates.length === 0) {
    res.json({ products: [], reasoning: "No products match the current filters." });
    return;
  }

  const productSummary = candidates
    .slice(0, 20)
    .map(
      (p) =>
        `ID:${p.id} "${p.name}" $${p.price} [${p.category}] - ${p.description.slice(0, 80)}`
    )
    .join("\n");

  const prompt = `You are a campus marketplace shopping assistant. Given these available products, recommend the top 4 most relevant ones for a university student.

Available products:
${productSummary}

${category ? `User is interested in: ${category}` : ""}
${budget ? `Budget: up to $${budget}` : ""}
${recentProductIds?.length ? `Recently viewed IDs: ${recentProductIds.join(", ")}` : ""}

Respond ONLY with valid JSON in this exact format:
{"recommendedIds": [id1, id2, id3, id4], "reasoning": "one sentence explanation"}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed2 = JSON.parse(raw.replace(/```json|```/g, "").trim()) as {
      recommendedIds?: number[];
      reasoning?: string;
    };

    const recommendedIds: number[] = parsed2.recommendedIds ?? [];
    const recommended = recommendedIds
      .map((id) => candidates.find((p) => p.id === id))
      .filter(Boolean) as typeof productsTable.$inferSelect[];

    const fallback =
      recommended.length > 0 ? recommended : candidates.slice(0, 4);

    res.json({
      products: fallback.map((p) => ({
        ...p,
        price: parseFloat(p.price),
        vendorName: vendorMap.get(p.vendorId) ?? "Unknown Vendor",
      })),
      reasoning:
        parsed2.reasoning ??
        "These products are popular among campus students.",
    });
  } catch {
    req.log.error("AI recommendation fallback triggered");
    res.json({
      products: candidates.slice(0, 4).map((p) => ({
        ...p,
        price: parseFloat(p.price),
        vendorName: vendorMap.get(p.vendorId) ?? "Unknown Vendor",
      })),
      reasoning: "Top picks from the campus marketplace.",
    });
  }
});

export default router;
