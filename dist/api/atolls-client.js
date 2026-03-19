"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Atolls API Client
//
// Replace the method bodies with calls to YOUR actual Atolls backend endpoints.
// The mock data below lets you run and test the MCP server locally before your
// API is ready.
// ─────────────────────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtollsApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
// ─── Mock data (remove once your real API is wired up) ──────────────────────
const MOCK_MERCHANTS = [
    {
        id: "nike-uk",
        name: "Nike",
        website: "https://www.nike.com/gb",
        category: "Fashion & Sportswear",
        logoUrl: "https://cdn.atolls.com/logos/nike.png",
        cashback: {
            rate: 7,
            type: "percentage",
            label: "Up to 7% cashback",
            terms: "Excludes sale items",
            expiresAt: null,
        },
        trackingUrl: "https://track.atolls.com/go/nike-uk",
        description: "World-leading sportswear, shoes and accessories.",
        isActive: true,
    },
    {
        id: "apple-uk",
        name: "Apple",
        website: "https://www.apple.com/uk",
        category: "Electronics",
        logoUrl: "https://cdn.atolls.com/logos/apple.png",
        cashback: {
            rate: 2,
            type: "percentage",
            label: "2% cashback",
            terms: "Not valid on iPhone or Apple Watch",
            expiresAt: null,
        },
        trackingUrl: "https://track.atolls.com/go/apple-uk",
        description: "iPhones, MacBooks, iPads and accessories.",
        isActive: true,
    },
    {
        id: "booking-com",
        name: "Booking.com",
        website: "https://www.booking.com",
        category: "Travel",
        logoUrl: "https://cdn.atolls.com/logos/booking.png",
        cashback: {
            rate: 5,
            type: "percentage",
            label: "Up to 5% cashback",
            terms: "Applies to accommodation bookings only",
            expiresAt: "2026-12-31T23:59:59Z",
        },
        trackingUrl: "https://track.atolls.com/go/booking-com",
        description: "Hotels, apartments and more worldwide.",
        isActive: true,
    },
    {
        id: "amazon-uk",
        name: "Amazon UK",
        website: "https://www.amazon.co.uk",
        category: "Retail",
        logoUrl: "https://cdn.atolls.com/logos/amazon.png",
        cashback: {
            rate: 3,
            type: "percentage",
            label: "Up to 3% cashback",
            terms: "Excludes Amazon Prime and digital goods",
            expiresAt: null,
        },
        trackingUrl: "https://track.atolls.com/go/amazon-uk",
        description: "Millions of products with fast delivery.",
        isActive: true,
    },
    {
        id: "asos",
        name: "ASOS",
        website: "https://www.asos.com",
        category: "Fashion & Sportswear",
        logoUrl: "https://cdn.atolls.com/logos/asos.png",
        cashback: {
            rate: 6,
            type: "percentage",
            label: "6% cashback",
            terms: "",
            expiresAt: null,
        },
        trackingUrl: "https://track.atolls.com/go/asos",
        description: "Thousands of brands, all the latest styles.",
        isActive: true,
    },
];
// ─── Client class ─────────────────────────────────────────────────────────────
class AtollsApiClient {
    http;
    useMockData;
    constructor() {
        const baseURL = process.env.ATOLLS_API_BASE_URL;
        const apiKey = process.env.ATOLLS_API_KEY;
        // Fall back to mock data when API credentials are not configured
        this.useMockData =
            !baseURL ||
                !apiKey ||
                baseURL === "https://api.atolls.com/v1" ||
                apiKey === "your_api_key_here";
        this.http = axios_1.default.create({
            baseURL: baseURL ?? "https://api.atolls.com/v1",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "User-Agent": "atolls-mcp-server/1.0.0",
            },
            timeout: 10_000,
        });
    }
    // ── Search ──────────────────────────────────────────────────────────────────
    /**
     * Search merchants by keyword query, optional category, and minimum cashback.
     *
     * REAL API: Replace this implementation with:
     *   const { data } = await this.http.get<SearchResponse>("/cashback/search", { params });
     */
    async searchMerchants(params) {
        if (!this.useMockData) {
            const { data } = await this.http.get("/cashback/search", { params });
            return data;
        }
        // ── Mock implementation ─────────────────────────────────────────────────
        const query = params.query.toLowerCase();
        let results = MOCK_MERCHANTS.filter((m) => {
            const matchesQuery = m.name.toLowerCase().includes(query) ||
                m.category.toLowerCase().includes(query) ||
                (m.description?.toLowerCase().includes(query) ?? false);
            const matchesCategory = params.category
                ? m.category.toLowerCase().includes(params.category.toLowerCase())
                : true;
            const matchesRate = params.minCashbackRate
                ? m.cashback.rate >= params.minCashbackRate
                : true;
            return matchesQuery && matchesCategory && matchesRate && m.isActive;
        });
        const limit = params.limit ?? Number(process.env.ATOLLS_SEARCH_LIMIT ?? 10);
        results = results.slice(0, limit);
        return { merchants: results, total: results.length, query: params.query };
    }
    // ── Get merchant by ID ──────────────────────────────────────────────────────
    /**
     * Fetch a single merchant's full details by its ID.
     *
     * REAL API: Replace with:
     *   const { data } = await this.http.get<Merchant>(`/cashback/merchants/${merchantId}`);
     */
    async getMerchant(merchantId) {
        if (!this.useMockData) {
            const { data } = await this.http.get(`/cashback/merchants/${merchantId}`);
            return data;
        }
        return MOCK_MERCHANTS.find((m) => m.id === merchantId) ?? null;
    }
    // ── Top offers ──────────────────────────────────────────────────────────────
    /**
     * Return the highest cashback rate merchants, optionally filtered by category.
     *
     * REAL API: Replace with:
     *   const { data } = await this.http.get<TopOffersResponse>("/cashback/top", { params: { category, limit } });
     */
    async getTopOffers(category, limit = 5) {
        if (!this.useMockData) {
            const { data } = await this.http.get("/cashback/top", { params: { category, limit } });
            return data;
        }
        let merchants = [...MOCK_MERCHANTS].filter((m) => m.isActive);
        if (category) {
            merchants = merchants.filter((m) => m.category.toLowerCase().includes(category.toLowerCase()));
        }
        merchants.sort((a, b) => b.cashback.rate - a.cashback.rate);
        merchants = merchants.slice(0, limit);
        return {
            merchants,
            category,
            generatedAt: new Date().toISOString(),
        };
    }
}
exports.AtollsApiClient = AtollsApiClient;
//# sourceMappingURL=atolls-client.js.map