import { ethers } from "ethers"
import erc20Abi from "./erc20Abi.json"
import { ETHEREUM_RPC_ENDPOINT, USDC_CONTRACT_ADDRESS } from "./constants"
import dotenv from "dotenv"
import { logBalance } from "./utils/logBalance"

dotenv.config()

const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC_ENDPOINT)
const toSigner = new ethers.Wallet(
  process.env.TO_LOCAL_WALLET_PRIVATE_KEY,
  provider
)

const fromSigner = new ethers.Wallet(
  process.env.FROM_LOCAL_WALLET_PRIVATE_KEY,
  provider
)

const usdcInstance = new ethers.Contract(
  USDC_CONTRACT_ADDRESS,
  erc20Abi,
  fromSigner
)

;(async () => {
  const balance = await usdcInstance.balanceOf(fromSigner.address)
  const amount = ethers.utils.parseUnits("100", 6)

  if (amount.gte(balance)) {
    throw new Error("amount exceeds balance")
  }

  logBalance({ address: fromSigner.address, usdcInstance })

  const result = await usdcInstance.transfer(toSigner.address, amount)

  console.log({ result })

  const tx = await result.wait()

  console.log({ tx })

  logBalance({ address: fromSigner.address, usdcInstance })
})()
