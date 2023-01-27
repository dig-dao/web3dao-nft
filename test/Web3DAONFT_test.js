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
const DEFAULT_MAX_BATCH_SIZE = 2
const MAX_BATCH_SIZE = 5
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

  describe("mint to alice and bob", function () {
    it(`can batch mint and transfer and call ownedCredential`, async function () {
      await mintAndTransfer({
        contract,
        account: owner,
        toAddresses: [alice.address, bob.address],
        quantity: DEFAULT_MAX_BATCH_SIZE,
      })
      expect(await contract.ownerOf(0)).to.equal(alice.address)
      expect(await contract.ownerOf(1)).to.equal(bob.address)
    })
  })

  it(`can batch mint MAX_BATCH_SIZE(${MAX_BATCH_SIZE}) tokens`, async function () {
    const quantity = MAX_BATCH_SIZE
    await setMaxBatchSize({
      contract,
      account: owner,
      newMaxBatchSize: quantity,
    })
    await mintAndTransfer({
      contract,
      account: owner,
      quantity,
    })
  })
  it(`Non-owner cannot batch mint`, async function () {
    try {
      await mintAndTransfer({
        contract,
        account: alice,
        quantity: DEFAULT_MAX_BATCH_SIZE,
      })
    } catch (err) {
      assertionError = true
      expect(err.reason).to.include(`Ownable: caller is not the owner`)
    } finally {
      expect(assertionError).to.be.true
    }
  })
  it(`cannot mint in the case of addresses empty`, async function () {
    try {
      await mintAndTransfer({
        contract,
        account: owner,
        quantity: DEFAULT_MAX_BATCH_SIZE,
        toAddresses: [],
      })
    } catch (err) {
      assertionError = true
      expect(err.reason).to.include(`The _toAddresses is empty.`)
    } finally {
      expect(assertionError).to.be.true
    }
  })
  it(`cannot mint more than maxBatchSize`, async function () {
    try {
      await mintAndTransfer({
        contract,
        account: owner,
        quantity: DEFAULT_MAX_BATCH_SIZE + 1,
      })
    } catch (err) {
      assertionError = true
      expect(err.reason).to.include(
        `The length of _toAddresses must be less than or equal to _maxBatchSize.`
      )
    } finally {
      expect(assertionError).to.be.true
    }
  })
  it(`cannot mint in the case of the different length of toAddresses and imageURIs`, async function () {
    try {
      await mintAndTransfer({
        contract,
        account: owner,
        quantity: 1,
        toAddresses: dummyAddresses.slice(0, 2),
      })
    } catch (err) {
      assertionError = true
      expect(err.reason).to.include(
        `The length of _toAddresses and _imageURIs are NOT same.`
      )
    } finally {
      expect(assertionError).to.be.true
    }
  })
  it(`cannot mint to owner address`, async function () {
    const toAddresses = [owner.address]
    try {
      await mintAndTransfer({
        contract,
        account: owner,
        quantity: 1,
        toAddresses,
      })
    } catch (err) {
      assertionError = true
      expect(err.reason).to.include(
        `_toAddresses must NOT be included OWNER.`
      )
    } finally {
      expect(assertionError).to.be.true
    }
  })
  describe("transferOwnership", function () {
    it(`can transfer`, async function () {
      await transferOwnership({
        contract,
        account: owner,
        newOwner: alice.address,
      })
    })
    it(`Non-owner cannot transfer`, async function () {
      try {
        await transferOwnership({
          contract,
          account: alice,
          newOwner: bob.address,
        })
      } catch (err) {
        assertionError = true
        expect(err.reason).to.include(`Ownable: caller is not the owner`)
      } finally {
        expect(assertionError).to.be.true
      }
    })
    it(`cannot transfer to a holder who has this token`, async function () {
      await mintAndTransfer({
        contract,
        account: owner,
        quantity: 1,
        toAddresses: [bob.address],
      })
      try {
        await transferOwnership({
          contract,
          account: owner,
          newOwner: bob.address,
        })
      } catch (err) {
        assertionError = true
        expect(err.reason).to.include(`newOwner's balance must be zero.`)
      } finally {
        expect(assertionError).to.be.true
      }
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
const getMaxBatchSize = async ({
  contract,
  account
}) => {
  return await contract.connect(account).getMaxBatchSize()
}

const setMaxBatchSize = async ({
  contract,
  account,
  newMaxBatchSize
}) => {
  const tx = await contract.connect(account).setMaxBatchSize(newMaxBatchSize)
  return await tx.wait()
}
const transferOwnership = async ({
  contract,
  account,
  newOwner
}) => {
  const tx = await contract.connect(account).transferOwnership(newOwner)
  return await tx.wait()
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