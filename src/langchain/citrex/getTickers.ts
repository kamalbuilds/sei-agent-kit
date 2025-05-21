import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { TickerReturnType } from "../../../node_modules/citrex-sdk/lib/types.js";
import { z } from "zod";

const CitrexGetTickersInputSchema = z.object({
  symbol: z.string().min(1).optional(),
});

export class SeiCitrexGetTickersTool extends StructuredTool<typeof CitrexGetTickersInputSchema> {
  name = "citrex_get_tickers";
  description = "et trade history for a product. Retrieves the tickers for the Citrex Protocol. The symbol must be a valid product symbol from the Citrex Protocol. Example: ETH -> 'ethperp', BTC -> 'btcperp', etc.";
  schema = CitrexGetTickersInputSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  async _call(input: z.infer<typeof CitrexGetTickersInputSchema>): Promise<TickerReturnType | undefined> {
    return this.seiKit.citrexGetTickers(input.symbol as `${string}perp`);
  }
  
  
}