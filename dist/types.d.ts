/** A single merchant with cashback offer data */
export interface Merchant {
    /** Unique merchant identifier in the Atolls platform */
    id: string;
    /** Display name of the merchant (e.g. "Nike") */
    name: string;
    /** Merchant's homepage URL */
    website: string;
    /** Merchant category (e.g. "Fashion", "Electronics") */
    category: string;
    /** Logo image URL */
    logoUrl?: string;
    /** Current cashback offer */
    cashback: CashbackOffer;
    /** Deep link for tracking – users should click this to earn cashback */
    trackingUrl: string;
    /** Short promotional description */
    description?: string;
    /** Whether the merchant is currently active */
    isActive: boolean;
}
/** Cashback offer details for a merchant */
export interface CashbackOffer {
    /** Cashback rate as a number (e.g. 5 means 5%) */
    rate: number;
    /** Whether the rate is a flat percentage or a fixed amount */
    type: "percentage" | "fixed";
    /** Currency code for fixed amounts (ISO 4217, e.g. "GBP") */
    currency?: string;
    /** Human-readable label (e.g. "Up to 5% cashback" or "£3 cashback") */
    label: string;
    /** Any promotional terms or conditions */
    terms?: string;
    /** When this offer expires (ISO 8601), null if ongoing */
    expiresAt?: string | null;
}
/** Search request parameters */
export interface SearchParams {
    query: string;
    category?: string;
    minCashbackRate?: number;
    limit?: number;
    currency?: string;
}
/** Search response from Atolls API */
export interface SearchResponse {
    merchants: Merchant[];
    total: number;
    query: string;
}
/** Parameters for fetching a single merchant */
export interface GetMerchantParams {
    merchantId: string;
}
/** Response for top cashback offers */
export interface TopOffersResponse {
    merchants: Merchant[];
    category?: string;
    generatedAt: string;
}
//# sourceMappingURL=types.d.ts.map