import CitrexSDK from '../../../node_modules/citrex-sdk/lib/index.js'
import { OrderType, TimeInForce } from '../../../node_modules/citrex-sdk/lib/enums.js'
import { SeiAgentKit } from '../../agent'
import * as dotenv from 'dotenv'
import { formatWei } from '../../utils/formatSei.js'

dotenv.config()

export async function placeOrder(seiKit: SeiAgentKit) {
const MY_PRIVATE_KEY = process.env.SEI_PRIVATE_KEY as `0x${string}`


const Client = new CitrexSDK(MY_PRIVATE_KEY)

// Let's deposit 1000 USDC to get started. By default deposits are in USDC.
const { error, success, transactionHash } = await Client.deposit(3)
const products = await fetch('https://api.citrex.markets/v1/products/product-by-id/1002');
    const productsJson = await products.json();
    const marketPrice = formatWei(Number(productsJson.markPrice),18);
// Now we can make an order. Let's go long on some ETH!
if (success) {
  const { error, order } = await Client.placeOrder({
    isBuy: true,
    orderType: OrderType.LIMIT,
    price: marketPrice,
    productId: 1002,
    quantity: 0.001,
    timeInForce: TimeInForce.GTC,
  })

  // Finally let's log out our order to check the details.
  console.log(order)
}
}