import { Toolkit } from '@bancor/carbon-sdk/strategy-management';
import { Strategy } from '@bancor/carbon-sdk';
import { initSyncedCache } from '@bancor/carbon-sdk/chain-cache';
import { ContractsApi, ContractsConfig } from '@bancor/carbon-sdk/contracts-api';
import { JsonRpcProvider } from '@ethersproject/providers';

import { SeiAgentKit } from "../../index";
import { SEI_RPC_URL, MAX_BLOCK_AGE } from '../../constants';

/**
 
 */
export async function getUserStrategies(
  agent: SeiAgentKit,
  config: ContractsConfig,
  user?: `0x${string}`,
): Promise<Strategy[] | null> {
  try {
    const provider = new JsonRpcProvider(SEI_RPC_URL);
    const api = new ContractsApi(provider, config);
    const { cache } = initSyncedCache(api.reader, undefined, MAX_BLOCK_AGE);
    const carbonSDK = new Toolkit(api, cache, undefined);

    const address = user ? user : agent.walletClient.account?.address;
    const strategies = await carbonSDK.getUserStrategies(address as `0x${string}`);

    return strategies;
  } catch (error) {
    console.error(`Error fetching token address from DexScreener: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
