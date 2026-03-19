import { z } from "zod";
import type { AtollsApiClient } from "../api/atolls-client.js";
export declare const GetMerchantSchema: z.ZodObject<{
    merchant_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    merchant_id: string;
}, {
    merchant_id: string;
}>;
export type GetMerchantInput = z.infer<typeof GetMerchantSchema>;
export declare const getMerchantTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            merchant_id: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleGetMerchant(input: GetMerchantInput, client: AtollsApiClient): Promise<string>;
//# sourceMappingURL=get-merchant.d.ts.map