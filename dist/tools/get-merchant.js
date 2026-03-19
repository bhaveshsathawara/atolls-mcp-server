"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Tool: get_merchant_details
//
// Returns full details for a single merchant, including cashback rate,
// terms, tracking URL, and description. Use after search_cashback to drill in.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMerchantTool = exports.GetMerchantSchema = void 0;
exports.handleGetMerchant = handleGetMerchant;
const zod_1 = require("zod");
// ── Input schema ──────────────────────────────────────────────────────────────
exports.GetMerchantSchema = zod_1.z.object({
    merchant_id: zod_1.z
        .string()
        .min(1)
        .describe("The unique merchant ID returned by search_cashback or get_top_cashback_offers (e.g. \"nike-uk\")."),
});
// ── Tool definition ───────────────────────────────────────────────────────────
exports.getMerchantTool = {
    name: "get_merchant_details",
    description: "Fetch full details for a specific merchant on Atolls by its ID: current cashback rate, offer terms, expiry, tracking URL, and description. Use this after search_cashback when the user wants more information about a particular merchant.",
    inputSchema: {
        type: "object",
        properties: {
            merchant_id: {
                type: "string",
                description: 'Merchant ID from a previous search result (e.g. "nike-uk", "amazon-uk").',
            },
        },
        required: ["merchant_id"],
    },
};
// ── Handler ───────────────────────────────────────────────────────────────────
async function handleGetMerchant(input, client) {
    const merchant = await client.getMerchant(input.merchant_id);
    if (!merchant) {
        return `Merchant "${input.merchant_id}" was not found. Please check the ID or search again with search_cashback.`;
    }
    return formatMerchantDetail(merchant);
}
// ── Helpers ───────────────────────────────────────────────────────────────────
function formatMerchantDetail(m) {
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
//# sourceMappingURL=get-merchant.js.map