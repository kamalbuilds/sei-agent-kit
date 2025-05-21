import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { OpenOrdersReturnType } from "../../../node_modules/citrex-sdk/lib/types.js";
import { z } from "zod";

const CitrexListOpenOrdersInputSchema = z.object({
    productSymbol: z.string().min(1).optional().describe("Optional product symbol to filter by (e.g., 'btcperp', 'ethperp')"),
});

export class SeiCitrexListOpenOrdersTool extends StructuredTool<typeof CitrexListOpenOrdersInputSchema> {
    name = "citrex_list_open_orders";
    description = "Lists all open orders for the account and sub-account on the Citrex Protocol. Can be filtered by product symbol.";
    schema = CitrexListOpenOrdersInputSchema;

    constructor(private readonly seiKit: SeiAgentKit) {
        super();
    }

    async _call(input: z.infer<typeof CitrexListOpenOrdersInputSchema>): Promise<OpenOrdersReturnType | undefined> {
        const { productSymbol } = input;
        return this.seiKit.citrexListOpenOrders(productSymbol as `${string}perp` | undefined);
    }
} 