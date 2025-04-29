import { Toolkit } from '@bancor/carbon-sdk/strategy-management';
import { initSyncedCache } from '@bancor/carbon-sdk/chain-cache';
import { ContractsApi, ContractsConfig } from '@bancor/carbon-sdk/contracts-api';
import { JsonRpcProvider } from '@ethersproject/providers';

import { SeiAgentKit } from "../../index";
import { SEI_RPC_URL, MAX_BLOCK_AGE } from '../../constants';

/**
 
 */
export async function getRateLiquidityDepthsByPair(
  agent: SeiAgentKit,
  config: ContractsConfig,
  sourceToken: string,
  targetToken: string,
  rates: string[],
): Promise<string[] | null> {
  try {
    const provider = new JsonRpcProvider(SEI_RPC_URL);
    const api = new ContractsApi(provider, config);
    const { cache } = initSyncedCache(api.reader, undefined, MAX_BLOCK_AGE);
    const carbonSDK = new Toolkit(api, cache, undefined);

    const liquidityDepths = await carbonSDK.getRateLiquidityDepthsByPair(sourceToken, targetToken, rates);
    return liquidityDepths;
  } catch (error) {
    throw error;
  }
}
