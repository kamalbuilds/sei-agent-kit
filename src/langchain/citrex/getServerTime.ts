import { Tool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { ServerTimeReturnType } from "../../../node_modules/citrex-sdk/lib/types.js";

export class SeiCitrexGetServerTimeTool extends Tool {
    name = "citrex_get_server_time";
    description = "Retrieves the current server time from the Citrex Protocol";
    constructor(private readonly seiKit: SeiAgentKit) {
        super();
    }

    async _call(): Promise<ServerTimeReturnType | undefined> {
        return this.seiKit.citrexGetServerTime();
    }
} 