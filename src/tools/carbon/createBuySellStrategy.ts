import { PayableOverrides } from '@bancor/carbon-sdk';
import { Toolkit } from '@bancor/carbon-sdk/strategy-management';
import { initSyncedCache } from '@bancor/carbon-sdk/chain-cache';
import { ContractsApi, ContractsConfig } from '@bancor/carbon-sdk/contracts-api';
import { JsonRpcProvider } from '@ethersproject/providers';

import { SeiAgentKit } from "../../index";
import { SEI_RPC_URL, MAX_BLOCK_AGE } from '../../constants';

/**
 
 */
export async function createBuySellStrategy(
  agent: SeiAgentKit,
  config: ContractsConfig,
  baseToken: string,
  quoteToken: string,
  buyPriceLow: string,
  buyPriceMarginal: string,
  buyPriceHigh: string,
  buyBudget: string,
  sellPriceLow: string,
  sellPriceMarginal: string,
  sellPriceHigh: string,
  sellBudget: string,
  overrides?: PayableOverrides,
): Promise<string | null> {
  try {
    const provider = new JsonRpcProvider(SEI_RPC_URL);
    const api = new ContractsApi(provider, config);
    const { cache } = initSyncedCache(api.reader, undefined, MAX_BLOCK_AGE);
    const carbonSDK = new Toolkit(api, cache, undefined);

    const populatedTx = await carbonSDK.createBuySellStrategy(baseToken, quoteToken, buyPriceLow, buyPriceMarginal, buyPriceHigh,
      buyBudget, sellPriceLow, sellPriceMarginal, sellPriceHigh, sellBudget, overrides);

    const viemTx = {
      chain: agent.walletClient.chain,
      account: agent.walletClient.account?.address as `0x${string}`,
      to: populatedTx.to as `0x${string}`,
      data: populatedTx.data as `0x${string}`,
      value: populatedTx.value ? BigInt(populatedTx.value.toString()) : 0n,
      gas: populatedTx.gasLimit ? BigInt(populatedTx.gasLimit.toString()) : undefined,
      nonce: populatedTx.nonce,
    };

    const txHash = await agent.walletClient.sendTransaction(viemTx);
    return "";
  } catch (error) {
    throw error;
  }
}
