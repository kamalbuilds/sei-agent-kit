import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { borrowTakara } from "../../tools/takara";
import { Address } from "viem";

const SeiBorrowTakaraInputSchema = z.object({
  tTokenAddress: z
    .string()
    .describe("The address of the tToken to borrow against (e.g., tUSDC)"),
  borrowAmount: z
    .string()
    .describe("The amount to borrow in human-readable format (e.g., '50' for 50 USDC)"),
});

/**
 * LangChain tool for borrowing against Takara tokens
 */
export class SeiBorrowTakaraTool extends StructuredTool<typeof SeiBorrowTakaraInputSchema> {
  name = "borrow_takara";
  description = "Borrows underlying tokens from the Takara Protocol using tTokens as collateral. For example, use tUSDC as collateral to borrow USDC.";
  schema = SeiBorrowTakaraInputSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  protected async _call({ tTokenAddress, borrowAmount }: z.infer<typeof SeiBorrowTakaraInputSchema>): Promise<string> {
    try {
      if (!tTokenAddress) {
        throw new Error("tTokenAddress is required");
      }
      if (!borrowAmount) {
        throw new Error("borrowAmount is required");
      }

      const result = await borrowTakara(this.seiKit, {
        tTokenAddress: tTokenAddress as Address,
        borrowAmount,
      });

      return JSON.stringify({
        status: "success",
        message: `Successfully borrowed tokens. Transaction hash: ${result.txHash}. Borrow amount: ${result.borrowedAmount}`,
        txHash: result.txHash,
        borrowedAmount: result.borrowedAmount,
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