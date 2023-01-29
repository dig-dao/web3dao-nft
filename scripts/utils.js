//
// Constants and utility module
//

const fs = require("fs")
const fetch = require("node-fetch")
const path = require("path")
require('dotenv').config();

const {
  NODE_ENV,
  MAINNET_ALCHEMY_URL,
  RINKEBY_ALCHEMY_URL,
  GOERLI_ALCHEMY_URL,
  POLYGON_ALCHEMY_URL,
  MUMBAI_ALCHEMY_URL,
  ETHERSCAN_API_TOKEN,
} = process.env

// =============================================================
// Constants or like constants
// =============================================================

// max batch size when bulk mint and transfer
const MAX_BATCH_SIZE = 5

const isProduction = () => {
  return NODE_ENV === "mainnet" || NODE_ENV === "production" || NODE_ENV === "polygon"
}
const getAlchemyUrl = () => {
  switch (NODE_ENV) {
    case "production":
    case "mainnet":
      return MAINNET_ALCHEMY_URL
    case "rinkeby":
      return RINKEBY_ALCHEMY_URL
    case "goerli":
      return GOERLI_ALCHEMY_URL
    case "polygon":
      return POLYGON_ALCHEMY_URL
    case "polygonMumbai":
      return MUMBAI_ALCHEMY_URL
    default:
      return RINKEBY_ALCHEMY_URL
  }
}

const getGasStationUrl = () => {
  const ethMainnetEndpoint = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_TOKEN}`
  switch (NODE_ENV) {
    case "production":
    case "mainnet":
      return ethMainnetEndpoint
    case "rinkeby":
      // There is no gas tracker support on this testnet.
      // refs: https://docs.etherscan.io/v/rinkeby-etherscan
      return ethMainnetEndpoint
    case "goerli":
      // There is no gas tracker support on this testnet.
      // refs: https://docs.etherscan.io/v/goerli-etherscan/
      return ethMainnetEndpoint
    case "polygon":
      return "https://gasstation-mainnet.matic.network/v2"
    case "polygonMumbai":
      return "https://gasstation-mumbai.matic.today/v2"
    default:
      return ethMainnetEndpoint
  }
}

const fetchGasFee = async () => {
  const res = await (await fetch(getGasStationUrl())).json()

  // case of Polygon chain:
  switch (NODE_ENV) {
    case "polygon":
    case "polygonMumbai":
      return {
        maxPriorityFee: res.fast.maxPriorityFee,
          maxFee: res.fast.maxFee,
      }
  }

  // case of Ethereum chain:
  return {
    maxPriorityFee: parseFloat(res.result.ProposeGasPrice),
    maxFee: parseFloat(res.result.FastGasPrice),
  }
}

const getTokenSymbolFromEnv = () => {
  switch (NODE_ENV) {
    case "polygon":
    case "polygonMumbai":
      return "MATIC"
  }
  return "ETH"
}

const getTokenName = () => {
  return "Web3 DAO NFT"
}

const getTokenSymbol = () => {
  return "W3DAO"
}

const getTokenDescription = () => {
  return "Web3.0 研究会 DAO に関わる人に発行される NFT です。"
}

const getTokenJapaneseDescription = () => {
  return "This NFT is issued to those involved in the Web 3.0 Study Group DAO."
}

const getOpenSeaDescription = () => {
  return `${getTokenDescription()} (IN JAPANESE) ${getTokenJapaneseDescription()}`
}

// =============================================================
//  Utilitiy functions
// =============================================================

function logWithTime(msg, logPrefix = null) {
  logMsg = logPrefix ? `${logPrefix} ${msg}` : msg
  const now = new Date()
  console.log(
    `[${now.toLocaleString()}.${("000" + now.getMilliseconds()).slice(
      -3
    )}] ${logMsg}`
  )
}

/**
 * create a mint batch set from members
 *
 */
function createMintBatches({
  members,
  batchSize = MAX_BATCH_SIZE,
}) {
  /**
   * e.g.
   *   > const array1 = [1,2,3,4,5,6]
   *   > splitAtEqualNum(array1, 2)
   *   => [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ]
   *
   *   > splitAtEqualNum(array1, 4)
   *   => [ [ 1, 2, 3, 4 ], [ 5, 6 ] ]
   */
  function splitAtEqualNum([...array], size = 1) {
    return array.reduce(
      (pre, _current, index) =>
      index % size ? pre : [...pre, array.slice(index, index + size)],
      []
    )
  }
  let batches = []
  for (const batch of splitAtEqualNum(members, batchSize)) {
    batches.push(batch)
  }
  return batches
}

module.exports = {
  MAX_BATCH_SIZE,
  isProduction,
  getAlchemyUrl,
  getGasStationUrl,
  fetchGasFee,
  getTokenSymbolFromEnv,
  getTokenName,
  getTokenSymbol,
  getTokenDescription,
  getTokenJapaneseDescription,
  getOpenSeaDescription,
  logWithTime,
  createMintBatches,
}