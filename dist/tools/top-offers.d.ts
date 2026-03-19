import { z } from "zod";
import type { AtollsApiClient } from "../api/atolls-client.js";
export declare const TopOffersSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    category?: string | undefined;
}, {
    category?: string | undefined;
    limit?: number | undefined;
}>;
export type TopOffersInput = z.infer<typeof TopOffersSchema>;
export declare const topOffersTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            category: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
};
export declare function handleTopOffers(input: TopOffersInput, client: AtollsApiClient): Promise<string>;
//# sourceMappingURL=top-offers.d.ts.map