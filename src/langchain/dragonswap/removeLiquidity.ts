import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { z } from "zod";

const RemoveLiquidityInputSchema = z.object({
  tokenId: z.string().min(1, "Position token ID must not be empty")
});

export class DragonSwapRemoveLiquidityTool extends StructuredTool<typeof RemoveLiquidityInputSchema> {
  name = "dragon_swap_remove_liquidity";
  description = `Remove liquidity from a DragonSwap pool.

  Parameters:
  - tokenId: The ID of the NFT position token.`;
  schema = RemoveLiquidityInputSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  protected async _call(input: z.infer<typeof RemoveLiquidityInputSchema>): Promise<string> {
    try {
      const tokenId = BigInt(input.tokenId);

      const result = await this.seiKit.removeDragonSwapLiquidity(
        tokenId
      );

      return JSON.stringify({
        status: "success",
        result,
        tokenId: input.tokenId,
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