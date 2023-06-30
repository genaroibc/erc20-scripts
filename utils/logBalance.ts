import { ethers } from "ethers"

type Params = {
  address: string
  usdcInstance: ethers.Contract
}

export const logBalance = async ({ address, usdcInstance }: Params) => {
  const balance = await usdcInstance.balanceOf(address)

  console.log({ balance: ethers.utils.formatUnits(balance, 6) })
}
