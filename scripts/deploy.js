//
// deploys NFTCredential contract.
//
// How to use:
// $ npx hardhat run scripts/deploy.js --network rinkeby|goerli|mainnet
//

const hre = require("hardhat")
const MAX_BATCH_SIZE = 5
const TOKEN_NAME = "Web3 DAO NFT"
const TOKEN_SYMBOL = "W3DAO"

const main = async () => {
  const contractFactory = await hre.ethers.getContractFactory("Web3DAOToken")
  const contract = await contractFactory.deploy(TOKEN_NAME, TOKEN_SYMBOL, MAX_BATCH_SIZE)
  await contract.deployed()
  console.log("deployed to:", contract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })