import { SeiAgentKit } from "../../index";
import { Address, parseUnits } from "viem";
import { POSITION_MANAGER_ABI } from "./abi/nftpositionmanager";
import { getTokenDecimals, approveToken } from "../../utils";

/**
 * Add liquidity to a DragonSwap pool
 * @param agent SeiAgentKit instance
 * @param token0 The first token address
 * @param token1 The second token address
 * @param amount0 The amount of the first token to add
 * @param amount1 The amount of the second token to add
 * @param fee Optional: The fee tier of the pool (e.g., 500 for 0.05%, 3000 for 0.3%, 10000 for 1%). If not provided, it will be determined from the API.
 * @param tickLower Optional: The lower tick of the position (if not provided, a recommended value will be calculated)
 * @param tickUpper Optional: The upper tick of the position (if not provided, a recommended value will be calculated)
 * @param recipient Optional: The address that will receive the NFT position (defaults to wallet address)
 * @param tickRangeOptions Optional: Options for calculating the tick range if tickLower and tickUpper are not provided
 * @returns Promise with transaction hash
 */
export async function addLiquidity(
  agent: SeiAgentKit,
  token0: Address,
  token1: Address,
  amount0: string,
  amount1: string,
  fee: number,
  tickLower: number,
  tickUpper: number,
): Promise<string> {
  console.log(`Adding liquidity: ${amount0} of ${token0} and ${amount1} of ${token1}...`);
  try {
    const positionManagerAddress = "0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70" as Address;
    const parsedAmount0 = parseUnits(amount0, await getTokenDecimals(agent, token0));
    const parsedAmount1 = parseUnits(amount1, await getTokenDecimals(agent, token1));

    // Approve tokens for the position manager
    await approveToken(agent, token0, positionManagerAddress, parsedAmount0);

    await approveToken(agent, token1, positionManagerAddress, parsedAmount1);

    const mintParams = {
      token0: token0,
      token1: token1,
      fee: fee,
      tickLower: tickLower,
      tickUpper: tickUpper,
      amount0Desired: parsedAmount0,
      amount1Desired: parsedAmount1,
      amount0Min: BigInt(Number(parsedAmount0) * 0.95), // 5% less than amount0
      amount1Min: BigInt(Number(parsedAmount1) * 0.95), // 5% less than amount1
      recipient: agent.wallet_address,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 120)
    };

    const txHash = await agent.walletClient.writeContract({
      address: positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: "mint",
      args: [mintParams]
    } as any);
    return `Liquidity added successfully. Transaction hash: ${txHash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(errorMsg)
    throw error;
  }
}
