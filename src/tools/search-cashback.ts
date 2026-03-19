// ─────────────────────────────────────────────────────────────────────────────
// Tool: search_cashback
//
// Lets ChatGPT search for merchants by keyword (e.g. "nike", "shoes",
// "electronics") and surface cashback rates + deep links.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import type { AtollsApiClient } from "../api/atolls-client.js";
import type { Merchant } from "../types.js";

// ── Input schema ──────────────────────────────────────────────────────────────

export const SearchCashbackSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      'Keyword to search for – can be a brand name, product type, or category. Examples: "nike", "laptops", "travel".'
    ),
  category: z
    .string()
    .optional()
    .describe(
      'Filter results to a specific category, e.g. "Fashion", "Electronics", "Travel".'
    ),
  min_cashback_rate: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe(
      "Only return merchants offering at least this cashback percentage (0–100)."
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .default(5)
    .describe("Maximum number of results to return (default 5, max 20)."),
});

export type SearchCashbackInput = z.infer<typeof SearchCashbackSchema>;

// ── Tool definition (exposed to the MCP server) ───────────────────────────────

export const searchCashbackTool = {
  name: "search_cashback",
  description:
    "Search Atolls for merchants that offer cashback. Returns merchant names, cashback rates, categories, and unique tracking URLs the user must click to earn cashback. Use this when a user asks about cashback on a specific brand, product, or category.",
  inputSchema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description:
          'Keyword to search for – brand name, product type, or category. E.g. "nike", "laptops", "travel".',
      },
      category: {
        type: "string",
        description:
          'Narrow results to a category. E.g. "Fashion", "Electronics", "Travel".',
      },
      min_cashback_rate: {
        type: "number",
        description: "Minimum cashback percentage (0–100).",
      },
      limit: {
        type: "number",
        description: "Max results to return (1–20, default 5).",
      },
    },
    required: ["query"],
  },
};

// ── Handler ───────────────────────────────────────────────────────────────────

export async function handleSearchCashback(
  input: SearchCashbackInput,
  client: AtollsApiClient
): Promise<string> {
  const result = await client.searchMerchants({
    query: input.query,
    category: input.category,
    minCashbackRate: input.min_cashback_rate,
    limit: input.limit ?? 5,
  });

  if (result.merchants.length === 0) {
    return `No cashback offers found for "${input.query}". Try a different keyword or browse top offers with get_top_cashback_offers.`;
  }

  const lines: string[] = [
    `Found ${result.total} merchant(s) matching "${input.query}":\n`,
  ];

  for (const m of result.merchants) {
    lines.push(formatMerchantSummary(m));
  }

  lines.push(
    "\n⚠️  To earn cashback, users must click the tracking URL before purchasing."
  );

  return lines.join("\n");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMerchantSummary(m: Merchant): string {
  const expiry = m.cashback.expiresAt
    ? ` (offer ends ${new Date(m.cashback.expiresAt).toLocaleDateString("en-GB")})`
    : "";

  return [
    `🏬 **${m.name}** – ${m.cashback.label}${expiry}`,
    `   Category : ${m.category}`,
    `   Shop link: ${m.trackingUrl}`,
    m.cashback.terms ? `   Terms    : ${m.cashback.terms}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
