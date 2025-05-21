import {Tool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { AccountHealthReturnType } from "../../../node_modules/citrex-sdk/lib/types.js";

export class SeiCitrexGetAccountHealthTool extends Tool {
    name = "citrex_get_account_health";
    description = "Retrieves the account health for the Citrex Protocol";
    constructor(private readonly seiKit: SeiAgentKit) {
        super();
    }

    async _call(): Promise<AccountHealthReturnType | undefined> {
        return this.seiKit.citrexGetAccountHealth();
    }
}