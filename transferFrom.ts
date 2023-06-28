import { ethers } from "ethers"
import erc20Abi from "./erc20Abi.json"
import { ETHEREUM_RPC_ENDPOINT, USDC_CONTRACT_ADDRESS } from "./constants"
import dotenv from "dotenv"

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
  try {
    const balance = await usdcInstance.balanceOf(fromSigner.address)

    console.log({ balance: ethers.utils.formatUnits(balance, 6) })

    const allowance = await usdcInstance.allowance(
      fromSigner.address,
      usdcInstance.address
    )

    console.log({
      allowance: allowance.toString()
    })

    const result = await usdcInstance.transferFrom(
      fromSigner.address,
      toSigner.address,
      ethers.utils.parseUnits("1", 6)
    )

    console.log({ result })

    const updatedBalance = await usdcInstance.balanceOf(fromSigner.address)
    console.log({ updatedBalance: ethers.utils.formatUnits(updatedBalance, 6) })
  } catch (error) {
    console.log({ error })
  }
})()
