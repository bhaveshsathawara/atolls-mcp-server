#!/usr/bin/env node
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

import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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

const server = new Server(
  {
    name: "atolls-cashback",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ─── Register tools ───────────────────────────────────────────────────────────

/**
 * ListTools – return the catalogue of available tools to ChatGPT.
 * ChatGPT calls this once at connection time to discover what actions it can take.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [searchCashbackTool, getMerchantTool, topOffersTool],
  };
});

/**
 * CallTool – execute the requested tool and return the result.
 * ChatGPT calls this whenever the user's message triggers a tool invocation.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let text: string;

    switch (name) {
      case "search_cashback": {
        const input = SearchCashbackSchema.parse(args);
        text = await handleSearchCashback(input, apiClient);
        break;
      }

      case "get_merchant_details": {
        const input = GetMerchantSchema.parse(args);
        text = await handleGetMerchant(input, apiClient);
        break;
      }

      case "get_top_cashback_offers": {
        const input = TopOffersSchema.parse(args);
        text = await handleTopOffers(input, apiClient);
        break;
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: "${name}". Available tools: search_cashback, get_merchant_details, get_top_cashback_offers.`
        );
    }

    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  } catch (err) {
    // Re-throw MCP errors as-is
    if (err instanceof McpError) throw err;

    // Wrap unexpected errors
    const message = err instanceof Error ? err.message : String(err);
    throw new McpError(
      ErrorCode.InternalError,
      `Atolls tool "${name}" failed: ${message}`
    );
  }
});

// ─── Start the server ─────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log to stderr so it doesn't interfere with the stdio MCP protocol on stdout
  console.error("✅ Atolls MCP Server running (stdio transport)");
  console.error(
    "   Tools available: search_cashback | get_merchant_details | get_top_cashback_offers"
  );

  const apiMode =
    !process.env.ATOLLS_API_KEY ||
    process.env.ATOLLS_API_KEY === "your_api_key_here"
      ? "⚠️  MOCK DATA (set ATOLLS_API_KEY to switch to live API)"
      : "🌐 LIVE API";
  console.error(`   API mode: ${apiMode}`);
}

main().catch((err) => {
  console.error("Fatal error starting Atolls MCP Server:", err);
  process.exit(1);
});
