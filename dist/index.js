#!/usr/bin/env node
"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Atolls MCP Server – Entry point
//
// Implements the Model Context Protocol (MCP) over stdio so ChatGPT can call
// Atolls cashback tools directly from a conversation.
//
// Usage:
//   npm run build && npm start
//
// Or in development:
//   npx ts-node src/index.ts
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const atolls_client_js_1 = require("./api/atolls-client.js");
const search_cashback_js_1 = require("./tools/search-cashback.js");
const get_merchant_js_1 = require("./tools/get-merchant.js");
const top_offers_js_1 = require("./tools/top-offers.js");
// ─── Initialise dependencies ──────────────────────────────────────────────────
const apiClient = new atolls_client_js_1.AtollsApiClient();
// ─── Create the MCP server ────────────────────────────────────────────────────
const server = new index_js_1.Server({
    name: "atolls-cashback",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// ─── Register tools ───────────────────────────────────────────────────────────
/**
 * ListTools – return the catalogue of available tools to ChatGPT.
 * ChatGPT calls this once at connection time to discover what actions it can take.
 */
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [search_cashback_js_1.searchCashbackTool, get_merchant_js_1.getMerchantTool, top_offers_js_1.topOffersTool],
    };
});
/**
 * CallTool – execute the requested tool and return the result.
 * ChatGPT calls this whenever the user's message triggers a tool invocation.
 */
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let text;
        switch (name) {
            case "search_cashback": {
                const input = search_cashback_js_1.SearchCashbackSchema.parse(args);
                text = await (0, search_cashback_js_1.handleSearchCashback)(input, apiClient);
                break;
            }
            case "get_merchant_details": {
                const input = get_merchant_js_1.GetMerchantSchema.parse(args);
                text = await (0, get_merchant_js_1.handleGetMerchant)(input, apiClient);
                break;
            }
            case "get_top_cashback_offers": {
                const input = top_offers_js_1.TopOffersSchema.parse(args);
                text = await (0, top_offers_js_1.handleTopOffers)(input, apiClient);
                break;
            }
            default:
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: "${name}". Available tools: search_cashback, get_merchant_details, get_top_cashback_offers.`);
        }
        return {
            content: [
                {
                    type: "text",
                    text,
                },
            ],
        };
    }
    catch (err) {
        // Re-throw MCP errors as-is
        if (err instanceof types_js_1.McpError)
            throw err;
        // Wrap unexpected errors
        const message = err instanceof Error ? err.message : String(err);
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Atolls tool "${name}" failed: ${message}`);
    }
});
// ─── Start the server ─────────────────────────────────────────────────────────
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    // Log to stderr so it doesn't interfere with the stdio MCP protocol on stdout
    console.error("✅ Atolls MCP Server running (stdio transport)");
    console.error("   Tools available: search_cashback | get_merchant_details | get_top_cashback_offers");
    const apiMode = !process.env.ATOLLS_API_KEY ||
        process.env.ATOLLS_API_KEY === "your_api_key_here"
        ? "⚠️  MOCK DATA (set ATOLLS_API_KEY to switch to live API)"
        : "🌐 LIVE API";
    console.error(`   API mode: ${apiMode}`);
}
main().catch((err) => {
    console.error("Fatal error starting Atolls MCP Server:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map