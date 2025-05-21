import {Tool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { ProductsReturnType } from "../../../node_modules/citrex-sdk/lib/types.js";

export class SeiCitrexGetProductsTool extends Tool {
    name = "citrex_get_products";
    description = "Retrieves all products from the Citrex Protocol";
    constructor(private readonly seiKit: SeiAgentKit) {
        super();
    }

    async _call(): Promise<ProductsReturnType | undefined> {
        return this.seiKit.citrexGetProducts();
    }
}