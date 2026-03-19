#!/usr/bin/env node
"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Atolls MCP Server – Entry point
//
// Supports two transport modes:
//   • HTTP/SSE  – when PORT env var is set (Railway, cloud hosting)
//   • stdio     – when no PORT is set (local development)
// ─────────────────────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const atolls_client_js_1 = require("./api/atolls-client.js");
const search_cashback_js_1 = require("./tools/search-cashback.js");
const get_merchant_js_1 = require("./tools/get-merchant.js");
const top_offers_js_1 = require("./tools/top-offers.js");
// ─── Initialise dependencies ──────────────────────────────────────────────────
const apiClient = new atolls_client_js_1.AtollsApiClient();
// ─── Create the MCP server ────────────────────────────────────────────────────
function createServer() {
    const server = new index_js_1.Server({ name: "atolls-cashback", version: "1.0.0" }, { capabilities: { tools: {} } });
    // ListTools – tell ChatGPT what tools are available
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
        tools: [search_cashback_js_1.searchCashbackTool, get_merchant_js_1.getMerchantTool, top_offers_js_1.topOffersTool],
    }));
    // CallTool – execute the requested tool
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            let text;
            switch (name) {
                case "search_cashback":
                    text = await (0, search_cashback_js_1.handleSearchCashback)(search_cashback_js_1.SearchCashbackSchema.parse(args), apiClient);
                    break;
                case "get_merchant_details":
                    text = await (0, get_merchant_js_1.handleGetMerchant)(get_merchant_js_1.GetMerchantSchema.parse(args), apiClient);
                    break;
                case "get_top_cashback_offers":
                    text = await (0, top_offers_js_1.handleTopOffers)(top_offers_js_1.TopOffersSchema.parse(args), apiClient);
                    break;
                default:
                    throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: "${name}"`);
            }
            return { content: [{ type: "text", text }] };
        }
        catch (err) {
            if (err instanceof types_js_1.McpError)
                throw err;
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Tool "${name}" failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    });
    return server;
}
// ─── HTTP / SSE mode (Railway) ────────────────────────────────────────────────
async function startHttpServer(port) {
    const app = (0, express_1.default)();
    // Health check – Railway uses this to confirm the service is running
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", service: "atolls-mcp-server" });
    });
    // MCP over SSE
    const transports = {};
    app.get("/sse", async (req, res) => {
        const transport = new sse_js_1.SSEServerTransport("/messages", res);
        const server = createServer();
        transports[transport.sessionId] = transport;
        res.on("close", () => delete transports[transport.sessionId]);
        await server.connect(transport);
    });
    app.post("/messages", async (req, res) => {
        const sessionId = req.query.sessionId;
        const transport = transports[sessionId];
        if (!transport) {
            res.status(400).json({ error: "No active session found" });
            return;
        }
        await transport.handlePostMessage(req, res);
    });
    app.listen(port, () => {
        console.log(`✅ Atolls MCP Server running on HTTP port ${port}`);
        console.log(`   SSE endpoint : http://localhost:${port}/sse`);
        console.log(`   Health check : http://localhost:${port}/health`);
        logApiMode();
    });
}
// ─── stdio mode (local development) ──────────────────────────────────────────
async function startStdioServer() {
    const server = createServer();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("✅ Atolls MCP Server running (stdio transport)");
    console.error("   Tools: search_cashback | get_merchant_details | get_top_cashback_offers");
    logApiMode();
}
// ─── Shared helpers ───────────────────────────────────────────────────────────
function logApiMode() {
    const isLive = process.env.ATOLLS_API_KEY && process.env.ATOLLS_API_KEY !== "your_api_key_here";
    console.error(`   API mode: ${isLive ? "🌐 LIVE API" : "⚠️  MOCK DATA"}`);
}
// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
if (PORT) {
    startHttpServer(PORT).catch((err) => {
        console.error("Fatal error:", err);
        process.exit(1);
    });
}
else {
    startStdioServer().catch((err) => {
        console.error("Fatal error:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map
