import CitrexSDK from "../node_modules/citrex-sdk/lib/index.js";
import { Config } from "../node_modules/citrex-sdk/lib/types.js";
import { OrderType, TimeInForce } from "../node_modules/citrex-sdk/lib/enums.js";
import * as dotenv from "dotenv";
import { formatWei } from "../src/utils/formatSei.js";
import { ethers } from "ethers";
dotenv.config()

export async function placeOrder() {
    const CONFIG = {
        debug: true,
        environment: 'mainnet',
        rpc: 'https://evm-rpc.sei-apis.com',
        subAccountId: 1,
    }
const MY_PRIVATE_KEY = process.env.SEI_PRIVATE_KEY as `0x${string}`


const Client = new CitrexSDK(MY_PRIVATE_KEY, CONFIG as Config)

// Let's deposit 1000 USDC to get started. By default deposits are in USDC.
// const { error, success, transactionHash } = await Client.deposit(3)
const products = await fetch('https://api.citrex.markets/v1/products/product-by-id/1002');
    const productsJson = await products.json();
    const marketPrice = formatWei(Number(productsJson.markPrice),18).toFixed(0);
    // console.log(marketPrice.toFixed(0));
// Now we can make an order. Let's go long on some ETH!
// if (success) {
//   const { error, order } = await Client.placeOrder({
//     isBuy: true,
//     orderType: OrderType.LIMIT,
//     price: Number(marketPrice),
//     productId: 1002,
//     quantity: 0.001,
//     timeInForce: TimeInForce.GTC,
//   })
const lala = await Client.calculateMarginRequirement(false, Number(marketPrice), 1002, 0.001)
console.log(formatWei(Number(lala.required), 18));
//   Finally let's log out our order to check the details.
//   console.log(order)
}

placeOrder();