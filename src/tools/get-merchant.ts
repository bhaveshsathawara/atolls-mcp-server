// ─────────────────────────────────────────────────────────────────────────────
// Tool: get_merchant_details
//
// Returns full details for a single merchant, including cashback rate,
// terms, tracking URL, and description. Use after search_cashback to drill in.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import type { AtollsApiClient } from "../api/atolls-client.js";
import type { Merchant } from "../types.js";

// ── Input schema ──────────────────────────────────────────────────────────────

export const GetMerchantSchema = z.object({
  merchant_id: z
    .string()
    .min(1)
    .describe(
      "The unique merchant ID returned by search_cashback or get_top_cashback_offers (e.g. \"nike-uk\")."
    ),
});

export type GetMerchantInput = z.infer<typeof GetMerchantSchema>;

// ── Tool definition ───────────────────────────────────────────────────────────

export const getMerchantTool = {
  name: "get_merchant_details",
  description:
    "Fetch full details for a specific merchant on Atolls by its ID: current cashback rate, offer terms, expiry, tracking URL, and description. Use this after search_cashback when the user wants more information about a particular merchant.",
  inputSchema: {
    type: "object" as const,
    properties: {
      merchant_id: {
        type: "string",
        description:
          'Merchant ID from a previous search result (e.g. "nike-uk", "amazon-uk").',
      },
    },
    required: ["merchant_id"],
  },
};

// ── Handler ───────────────────────────────────────────────────────────────────

export async function handleGetMerchant(
  input: GetMerchantInput,
  client: AtollsApiClient
): Promise<string> {
  const merchant = await client.getMerchant(input.merchant_id);

  if (!merchant) {
    return `Merchant "${input.merchant_id}" was not found. Please check the ID or search again with search_cashback.`;
  }

  return formatMerchantDetail(merchant);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMerchantDetail(m: Merchant): string {
  const expiry = m.cashback.expiresAt
    ? `Expires  : ${new Date(m.cashback.expiresAt).toLocaleDateString("en-GB")}`
    : "Expires  : Ongoing offer";

  const lines = [
    `# ${m.name}`,
    ``,
    m.description ?? "",
    ``,
    `## Cashback offer`,
    `Rate     : ${m.cashback.label}`,
    m.cashback.terms ? `Terms    : ${m.cashback.terms}` : "",
    expiry,
    ``,
    `## Links`,
    `Website  : ${m.website}`,
    `Earn cash: ${m.trackingUrl}`,
    ``,
    `## Category`,
    m.category,
    ``,
    `⚠️  The user must click the "Earn cash" link above before purchasing to qualify for cashback.`,
  ];

  return lines.filter((l) => l !== undefined).join("\n");
}
