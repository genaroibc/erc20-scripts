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

const usdcInterface = usdcInstance.interface

;(async () => {
  const balance = await usdcInstance.balanceOf(fromSigner.address)
  const amount = ethers.utils.parseUnits("10", 6)

  if (amount.gte(balance)) {
    throw new Error("amount exceeds balance")
  }

  logBalance({ address: fromSigner.address, usdcInstance })

  const transferEncodedData = usdcInterface.encodeFunctionData("transfer", [
    toSigner.address,
    amount
  ])

  const tx = await fromSigner.sendTransaction({
    from: fromSigner.address,
    to: toSigner.address,
    value: amount,
    gasLimit: "20000000",
    data: transferEncodedData
  })

  console.log({ tx })

  const txStatus = await tx.wait()

  console.log({ txStatus })

  logBalance({ address: fromSigner.address, usdcInstance })
})()
