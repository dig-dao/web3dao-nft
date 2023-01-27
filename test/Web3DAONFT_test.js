const {
  expect
} = require("chai");
const {
  ethers
} = require("hardhat")
const crypto = require("crypto")

const SUBJECT_CONTRACT_NAME = "Web3DAOToken"
const DEFAULT_TOKEN_NAME = "Web3 DAO NFT"
const DEFAULT_TOKEN_SYMBOL = "W3DAO"
const DEFAULT_MAX_BATCH_SIZE = 5
const DEFAULT_TOKEN_DESCRIPTION = "Awesome DAO NFT"

describe("Web3DAONFT", function () {
  let contract
  let owner, alice, bob
  let dummyAddresses
  let assertionError

  beforeEach(async function () {
    assertionError = false
    contract = await initializeContract({});
    [owner, alice, bob] = await ethers.getSigners()
    dummyAddresses = generateWalletAddresses()
  })

  describe("constructor", function () {
    it(`can set the name and the symbol`, async function () {
      expect(await contract.name()).to.be.equal(DEFAULT_TOKEN_NAME)
      expect(await contract.symbol()).to.be.equal(DEFAULT_TOKEN_SYMBOL)

      const contract2 = await initializeContract({
        tokenName: "TOKEN_NAME2",
        tokenSymbol: "TEST2",
      })
      expect(await contract2.name()).to.be.equal("TOKEN_NAME2")
      expect(await contract2.symbol()).to.be.equal("TEST2")
    })
  })

  describe("mintAndTransfer", function () {
    it(`can batch mint and transfer and call ownedCredential`, async function () {
      await mintAndTransfer({
        contract,
        account: owner,
        quantity: DEFAULT_MAX_BATCH_SIZE,
      })

    })
  })
})

const initializeContract = async ({
  contractName = SUBJECT_CONTRACT_NAME,
  tokenName = DEFAULT_TOKEN_NAME,
  tokenSymbol = DEFAULT_TOKEN_SYMBOL,
  maxBatchSize = DEFAULT_MAX_BATCH_SIZE,
}) => {
  const nftCredential = await ethers.getContractFactory(contractName)
  return await nftCredential.deploy(tokenName, tokenSymbol, maxBatchSize)
}
const generateWallet = () => {
  const privateKey = `0x${crypto.randomBytes(32).toString("hex")}`
  const wallet = new ethers.Wallet(privateKey)
  return {
    privateKey,
    walletAddress: wallet.address
  }
}
const batchGenerateWallet = (num = 5) => {
  const wallets = []
  while (num > 0) {
    wallets.push(generateWallet())
    num--
  }
  return wallets
}
const generateWalletAddresses = (num = 5) => {
  return batchGenerateWallet(num).map((item) => item.walletAddress)
}

const mintAndTransfer = async ({
  contract,
  account,
  quantity,
  description = DEFAULT_TOKEN_DESCRIPTION,
  toAddresses = null,
}) => {
  const mintTx = await contract
    .connect(account)
    .mintAndTransfer(
      description,
      toAddresses || generateWalletAddresses(quantity),
      generateDummyImageUrls(quantity),
      generateDummyExternalUrls(quantity)
    )
  return await mintTx.wait()
}
const generateDummyUrls = (num = 5, urlPath = "") => {
  const template = "https://example.com"
  const items = []
  let index = 0
  while (num > 0) {
    items.push(`${template}${urlPath}/${index}`)
    index++
    num--
  }
  return items
}

const generateDummyImageUrls = (num = 5) => {
  return generateDummyUrls(num, "/images")
}

const generateDummyExternalUrls = (num = 5) => {
  return generateDummyUrls(num, "/externals")
}