"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Tool: get_top_cashback_offers
//
// Returns the merchants currently offering the highest cashback rates,
// optionally filtered by category.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.topOffersTool = exports.TopOffersSchema = void 0;
exports.handleTopOffers = handleTopOffers;
const zod_1 = require("zod");
// ── Input schema ──────────────────────────────────────────────────────────────
exports.TopOffersSchema = zod_1.z.object({
    category: zod_1.z
        .string()
        .optional()
        .describe('Limit top offers to a specific category, e.g. "Fashion", "Electronics", "Travel". Omit for all categories.'),
    limit: zod_1.z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .default(5)
        .describe("How many top offers to return (1–10, default 5)."),
});
// ── Tool definition ───────────────────────────────────────────────────────────
exports.topOffersTool = {
    name: "get_top_cashback_offers",
    description: "Get the highest cashback rate merchants currently available on Atolls. Optionally filter by product category. Use this when a user asks 'what are the best cashback deals today?' or wants to discover high-earning merchants without a specific brand in mind.",
    inputSchema: {
        type: "object",
        properties: {
            category: {
                type: "string",
                description: 'Filter to a category, e.g. "Fashion", "Electronics", "Travel". Omit for all.',
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
async function handleTopOffers(input, client) {
    const result = await client.getTopOffers(input.category, input.limit ?? 5);
    if (result.merchants.length === 0) {
        const categoryNote = input.category ? ` in "${input.category}"` : "";
        return `No active cashback offers found${categoryNote} right now. Please try again later or search a specific brand.`;
    }
    const heading = input.category
        ? `🏆 Top cashback offers in ${input.category}`
        : "🏆 Top cashback offers on Atolls right now";
    const lines = [`${heading}\n`];
    result.merchants.forEach((m, i) => {
        lines.push(formatRankedMerchant(m, i + 1));
    });
    lines.push("\n⚠️  Click the tracking link before shopping to earn your cashback.");
    return lines.join("\n");
}
// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRankedMerchant(m, rank) {
    return [
        `${rank}. **${m.name}** – ${m.cashback.label}`,
        `   Category : ${m.category}`,
        `   Shop link: ${m.trackingUrl}`,
    ].join("\n");
}
//# sourceMappingURL=top-offers.js.map