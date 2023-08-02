//
// check unminted addresses
//
// (RUN)
// node scripts/unminted-addresses.js 
//
require('dotenv').config();
const axios = require('axios'); 

const {
  NODE_ENV,
  CONTRACT_ADDRESS,
  PUBLIC_KEY,
  PRIVATE_KEY,
  GUILD_ROLE_ID
} = process.env

const fs = require("fs")
const {
  createAlchemyWeb3
} = require("@alch/alchemy-web3")

const {
  getAlchemyUrl,
  logWithTime
} = require("./utils")

const web3 = createAlchemyWeb3(getAlchemyUrl())

const contract = require("../artifacts/contracts/Web3DAONFT.sol/Web3DAOToken.json")
const nftContract = new web3.eth.Contract(contract.abi, CONTRACT_ADDRESS)

async function main() {
  if (GUILD_ROLE_ID == undefined){
    throw new Error('Please set GUILD_ROLE_ID on your .env')
  }
  logWithTime(
    `START NODE_ENV=${NODE_ENV}, CONTRACT=${CONTRACT_ADDRESS}`
  )

  const minted = []
  const ng = []
  //const members = fs.readFileSync(process.argv[2], 'utf-8')
  const response = await axios.get(`https://api.guild.xyz/v1/role/${GUILD_ROLE_ID}`)
  const addresses = response.data.members
  console.log(`Read ${addresses.length} addresses from the guild’s role ID ${GUILD_ROLE_ID}`)
  const totalSupply = await nftContract.methods.totalSupply().call()
  console.log(`\n----- check ${totalSupply} owners -----`)
  // check all owners of tokenIds
  for (let i = 0; i < parseInt(totalSupply); i++) {
    const owner = await nftContract.methods.ownerOf(i).call()
    minted.push(owner.toLowerCase())
    process.stdout.write('.')
  }
  // get addresses minus minted
  const unminted = addresses.filter((address) => !minted.includes(address) && address != '')
  console.log('\nunminted addresses')
  for(let i = 0; i < unminted.length; i++) {
    console.log(unminted[i])
  }
}

main()
  .then((result) => {
    logWithTime("END")
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })