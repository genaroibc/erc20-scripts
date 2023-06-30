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
    const amount = ethers.utils.parseUnits("1", 6)

    logBalance(usdcInstance)

    if (balance.lte(amount)) {
      throw new Error("balance exceeds amount")
    }

    const allowance = await usdcInstance.allowance(
      fromSigner.address,
      toSigner.address
    )

    console.log({
      allowance: allowance.toString()
    })

    if (allowance.lte(amount)) {
      await usdcInstance.approve(toSigner.address, amount)
    }

    const _allowance = await usdcInstance.allowance(
      fromSigner.address,
      toSigner.address
    )

    console.log({ a: _allowance.toString() })

    const connectedContract = usdcInstance.connect(toSigner)

    const result = await connectedContract.transferFrom(
      fromSigner.address,
      toSigner.address,
      amount
    )

    console.log({ result })

    logBalance(usdcInstance)
  } catch (error) {
    console.log({ error })
  }
})()

const logBalance = async (usdcInstance: ethers.Contract) => {
  const balance = await usdcInstance.balanceOf(fromSigner.address)
  console.log({ balance: ethers.utils.formatUnits(balance, 6) })
}
