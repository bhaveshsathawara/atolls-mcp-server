import { z } from "zod";
import type { AtollsApiClient } from "../api/atolls-client.js";
export declare const SearchCashbackSchema: z.ZodObject<{
    query: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    min_cashback_rate: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit: number;
    category?: string | undefined;
    min_cashback_rate?: number | undefined;
}, {
    query: string;
    category?: string | undefined;
    min_cashback_rate?: number | undefined;
    limit?: number | undefined;
}>;
export type SearchCashbackInput = z.infer<typeof SearchCashbackSchema>;
export declare const searchCashbackTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            category: {
                type: string;
                description: string;
            };
            min_cashback_rate: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleSearchCashback(input: SearchCashbackInput, client: AtollsApiClient): Promise<string>;
//# sourceMappingURL=search-cashback.d.ts.map