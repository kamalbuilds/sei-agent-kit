import { Toolkit } from '@bancor/carbon-sdk/strategy-management';
import { initSyncedCache } from '@bancor/carbon-sdk/chain-cache';
import { ContractsApi, ContractsConfig } from '@bancor/carbon-sdk/contracts-api';
import { JsonRpcProvider } from '@ethersproject/providers';

import { SeiAgentKit } from "../../index";
import { SEI_RPC_URL, MAX_BLOCK_AGE } from '../../constants';

/**
 
 */
export async function getMaxRateByPair(
  agent: SeiAgentKit,
  config: ContractsConfig,
  sourceToken: string,
  targetToken: string,
): Promise<string | null> {
  try {
    const provider = new JsonRpcProvider(SEI_RPC_URL);
    const api = new ContractsApi(provider, config);
    const { cache } = initSyncedCache(api.reader, undefined, MAX_BLOCK_AGE);
    const carbonSDK = new Toolkit(api, cache, undefined);

    const maxRate = await carbonSDK.getMaxRateByPair(sourceToken, targetToken);
    return "";
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(errorMsg);
    throw error;
  }
}
