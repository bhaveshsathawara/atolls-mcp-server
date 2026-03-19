import type { Merchant, SearchParams, SearchResponse, TopOffersResponse } from "../types.js";
export declare class AtollsApiClient {
    private http;
    private useMockData;
    constructor();
    /**
     * Search merchants by keyword query, optional category, and minimum cashback.
     *
     * REAL API: Replace this implementation with:
     *   const { data } = await this.http.get<SearchResponse>("/cashback/search", { params });
     */
    searchMerchants(params: SearchParams): Promise<SearchResponse>;
    /**
     * Fetch a single merchant's full details by its ID.
     *
     * REAL API: Replace with:
     *   const { data } = await this.http.get<Merchant>(`/cashback/merchants/${merchantId}`);
     */
    getMerchant(merchantId: string): Promise<Merchant | null>;
    /**
     * Return the highest cashback rate merchants, optionally filtered by category.
     *
     * REAL API: Replace with:
     *   const { data } = await this.http.get<TopOffersResponse>("/cashback/top", { params: { category, limit } });
     */
    getTopOffers(category?: string, limit?: number): Promise<TopOffersResponse>;
}
//# sourceMappingURL=atolls-client.d.ts.map