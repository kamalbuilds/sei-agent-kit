import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { z } from "zod";
import { Address } from "viem";

const AddLiquidityInputSchema = z.object({
  token0Ticker: z.string().min(1, "First token ticker must not be empty"),
  token1Ticker: z.string().min(1, "Second token ticker must not be empty"),
  amount0: z.string().min(1, "First token amount must not be empty"),
  amount1: z.string().min(1, "Second token amount must not be empty"),
  fee: z.number().default(3000),
  tickLower: z.number(),
  tickUpper: z.number(),
});

export class DragonSwapAddLiquidityTool extends StructuredTool<typeof AddLiquidityInputSchema> {
  name = "dragon_swap_add_liquidity";
  description = `Add liquidity to a DragonSwap pool.

  Parameters:
  - token0Ticker: The ticker symbol of the first token (e.g., "SEI").
  - token1Ticker: The ticker symbol of the second token (e.g., "USDC").
  - amount0: The amount of the first token to add as a string (e.g., "1.5").
  - amount1: The amount of the second token to add as a string (e.g., "100").
  - fee: The fee tier of the pool (e.g., 500 for 0.05%, 3000 for 0.3%, 10000 for 1%). Default is 3000.
  - tickLower: The lower tick of the position.
  - tickUpper: The upper tick of the position.`;
  schema = AddLiquidityInputSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  protected async _call(input: z.infer<typeof AddLiquidityInputSchema>): Promise<string> {
    try {
      const result = await this.seiKit.addDragonSwapLiquidity(
        input.token0Ticker as Address,
        input.token1Ticker as Address,
        input.amount0,
        input.amount1,
        input.fee,
        input.tickLower,
        input.tickUpper
      );

      return JSON.stringify({
        status: "success",
        result,
        token0: input.token0Ticker,
        token1: input.token1Ticker,
        amount0: input.amount0,
        amount1: input.amount1,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
} 