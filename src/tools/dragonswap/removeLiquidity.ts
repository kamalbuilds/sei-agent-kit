import { SeiAgentKit } from "../../index";
import { Address } from "viem";
import { POSITION_MANAGER_ABI } from "./abi/nftpositionmanager";

/**
 * Remove liquidity from a DragonSwap pool
 * @param agent SeiAgentKit instance
 * @param tokenId The ID of the position NFT
 * @param liquidity The amount of liquidity to remove (if 0, will remove all available liquidity)
 * @param recipient The address that will receive the tokens (defaults to wallet address)
 * @param shouldCollectFees Whether to collect fees (defaults to true)
 * @returns Promise with transaction hash
 */
export async function removeLiquidity(
  agent: SeiAgentKit,
  tokenId: bigint,
  liquidity?: bigint,
): Promise<string> {
  try {
    if (!agent.publicClient || !agent.walletClient) {
      throw new Error("Public client or wallet client not initialized");
    }

    if (!agent.wallet_address) {
      throw new Error("Wallet address not specified");
    }

    // Use the provided recipient or default to the wallet address
    const tokenRecipient = agent.wallet_address;

    // Get the NFT Position Manager contract address
    const positionManagerAddress = "0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70" as Address;

    // First, get the position details to determine available liquidity if not specified
    const position = await agent.publicClient.readContract({
      address: positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: "positions",
      args: [tokenId]
    });

    // Position details are returned as an array, with the liquidity at index 7
    // [token0, token1, fee, tickLower, tickUpper, liquidity, ...]
    if (!position || !Array.isArray(position) || position[7] === 0n) {
      throw new Error(`Position ${tokenId} does not exist or has no liquidity`);
    }

    // If liquidity not specified, use all available liquidity
    const liquidityToRemove = liquidity || position[7];

    // Current timestamp plus 2 minutes for deadline
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 120);

    await collectPositionFees(agent, tokenId, tokenRecipient);

    // Create decrease liquidity parameters
    const decreaseLiquidityParams = {
      tokenId,
      liquidity: liquidityToRemove,
      amount0Min: 0n,
      amount1Min: 0n,
      deadline
    };

    // Execute decreaseLiquidity transaction
    const decreaseTx = await agent.walletClient.writeContract({
      address: positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: "decreaseLiquidity",
      args: [decreaseLiquidityParams]
    } as any);
    // After decreasing liquidity, collect the tokens
    const collectParams = {
      tokenId,
      recipient: tokenRecipient,
      amount0Max: 2n ** 128n - 1n, // Uint256 max value
      amount1Max: 2n ** 128n - 1n  // Uint256 max value
    };

    // Execute collect transaction to withdraw tokens
    const collectTx = await agent.walletClient.writeContract({
      address: positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: "collect",
      args: [collectParams]
    } as any);

    return `Liquidity removed successfully. Decrease transaction: ${decreaseTx}, Collect transaction: ${collectTx}`;
  } catch (error) {
    throw error;
  }
}

/**
 * Helper function to collect accumulated fees
 */
async function collectPositionFees(
  agent: SeiAgentKit,
  tokenId: bigint,
  recipient: Address
): Promise<void> {
  try {
    // Get the NFT Position Manager contract address
    const positionManagerAddress = "0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70" as Address;

    // Create collect params to collect only fees (not reducing liquidity)
    const collectParams = {
      tokenId,
      recipient,
      amount0Max: 2n ** 128n - 1n, // Uint256 max value
      amount1Max: 2n ** 128n - 1n  // Uint256 max value
    };

    // Execute collect transaction to collect fees
    await agent.walletClient.writeContract({
      address: positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: "collect",
      args: [collectParams]
    } as any);
  } catch (error) {
    throw new Error(`Failed to collect fees: ${error instanceof Error ? error.message : String(error)}`);
  }
}
