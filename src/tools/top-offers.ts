// ─────────────────────────────────────────────────────────────────────────────
// Tool: get_top_cashback_offers
//
// Returns the merchants currently offering the highest cashback rates,
// optionally filtered by category.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import type { AtollsApiClient } from "../api/atolls-client.js";
import type { Merchant } from "../types.js";

// ── Input schema ──────────────────────────────────────────────────────────────

export const TopOffersSchema = z.object({
  category: z
    .string()
    .optional()
    .describe(
      'Limit top offers to a specific category, e.g. "Fashion", "Electronics", "Travel". Omit for all categories.'
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .default(5)
    .describe("How many top offers to return (1–10, default 5)."),
});

export type TopOffersInput = z.infer<typeof TopOffersSchema>;

// ── Tool definition ───────────────────────────────────────────────────────────

export const topOffersTool = {
  name: "get_top_cashback_offers",
  description:
    "Get the highest cashback rate merchants currently available on Atolls. Optionally filter by product category. Use this when a user asks 'what are the best cashback deals today?' or wants to discover high-earning merchants without a specific brand in mind.",
  inputSchema: {
    type: "object" as const,
    properties: {
      category: {
        type: "string",
        description:
          'Filter to a category, e.g. "Fashion", "Electronics", "Travel". Omit for all.',
      },
      limit: {
        type: "number",
        description: "Number of top offers to return (1–10, default 5).",
      },
    },
    required: [],
  },
};

// ── Handler ───────────────────────────────────────────────────────────────────

export async function handleTopOffers(
  input: TopOffersInput,
  client: AtollsApiClient
): Promise<string> {
  const result = await client.getTopOffers(input.category, input.limit ?? 5);

  if (result.merchants.length === 0) {
    const categoryNote = input.category ? ` in "${input.category}"` : "";
    return `No active cashback offers found${categoryNote} right now. Please try again later or search a specific brand.`;
  }

  const heading = input.category
    ? `🏆 Top cashback offers in ${input.category}`
    : "🏆 Top cashback offers on Atolls right now";

  const lines: string[] = [`${heading}\n`];

  result.merchants.forEach((m, i) => {
    lines.push(formatRankedMerchant(m, i + 1));
  });

  lines.push(
    "\n⚠️  Click the tracking link before shopping to earn your cashback."
  );

  return lines.join("\n");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRankedMerchant(m: Merchant, rank: number): string {
  return [
    `${rank}. **${m.name}** – ${m.cashback.label}`,
    `   Category : ${m.category}`,
    `   Shop link: ${m.trackingUrl}`,
  ].join("\n");
}
