#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Atolls MCP Server – Entry point
//
// Supports two transport modes:
//   • HTTP/SSE  – when PORT env var is set (Railway, cloud hosting)
//   • stdio     – when no PORT is set (local development)
// ─────────────────────────────────────────────────────────────────────────────

import "dotenv/config";
import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

import { AtollsApiClient } from "./api/atolls-client.js";
import {
  searchCashbackTool,
  handleSearchCashback,
  SearchCashbackSchema,
} from "./tools/search-cashback.js";
import {
  getMerchantTool,
  handleGetMerchant,
  GetMerchantSchema,
} from "./tools/get-merchant.js";
import {
  topOffersTool,
  handleTopOffers,
  TopOffersSchema,
} from "./tools/top-offers.js";

// ─── Initialise dependencies ──────────────────────────────────────────────────

const apiClient = new AtollsApiClient();

// ─── Create the MCP server ────────────────────────────────────────────────────

function createServer() {
  const server = new Server(
    { name: "atolls-cashback", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // ListTools – tell ChatGPT what tools are available
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [searchCashbackTool, getMerchantTool, topOffersTool],
  }));

  // CallTool – execute the requested tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      let text: string;
      switch (name) {
        case "search_cashback":
          text = await handleSearchCashback(SearchCashbackSchema.parse(args), apiClient);
          break;
        case "get_merchant_details":
          text = await handleGetMerchant(GetMerchantSchema.parse(args), apiClient);
          break;
        case "get_top_cashback_offers":
          text = await handleTopOffers(TopOffersSchema.parse(args), apiClient);
          break;
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: "${name}"`);
      }
      return { content: [{ type: "text", text }] };
    } catch (err) {
      if (err instanceof McpError) throw err;
      throw new McpError(ErrorCode.InternalError, `Tool "${name}" failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  return server;
}

// ─── HTTP / SSE mode (Railway) ────────────────────────────────────────────────

async function startHttpServer(port: number) {
  const app = express();
  app.use(express.json());

  // Health check – Railway uses this to confirm the service is running
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "atolls-mcp-server" });
  });

  // MCP over SSE
  const transports: Record<string, SSEServerTransport> = {};

  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    const server = createServer();
    transports[transport.sessionId] = transport;
    res.on("close", () => delete transports[transport.sessionId]);
    await server.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
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
  const transport = new StdioServerTransport();
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
} else {
  startStdioServer().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
