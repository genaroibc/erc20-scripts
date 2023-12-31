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
  try {
    const balance = await usdcInstance.balanceOf(fromSigner.address)
    const amount = ethers.utils.parseUnits("1", 6)

    logBalance({ usdcInstance, address: fromSigner.address })

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

    console.log({ _allowance: _allowance.toString() })

    const connectedContract = usdcInstance.connect(toSigner)

    const result = await connectedContract.transferFrom(
      fromSigner.address,
      toSigner.address,
      amount
    )

    console.log({ result })

    const txStatus = await result.wait()

    console.log({ txStatus })

    logBalance({ usdcInstance, address: fromSigner.address })
  } catch (error) {
    console.log({ error })
  }
})()
