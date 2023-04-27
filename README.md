# Web3.0 研究会 DAO 用 NFT

Web3.0 研究会 DAO のメンバー向けに配布する、譲渡不可のNFTです。
Contract Name, Symbol, 配布NFTのイメージや外部URIは自由に書き換えられるので、別の用途にも活用できると思います。

## 特徴

- 配布された NFT は別の Wallet に転送することができません（Contract Owner は可能)
- Owner から複数のアドレスに対して、まとめて mint & transfer することができます。(Owner が配布する形式のNFTです)
- Polygon ネットワークで動作確認済み。Ethereum ネットワークでも動作すると思われますが未確認です。

## 技術的な解説

- Ownable を拡張し、transferFrom の利用を onlyOwner で制限しています
- ERC721A を拡張し、バルクミントを行います

## Setup

### 1. Install dependencies

```bash
% npm install
```

### 2. Install hardhat

他のサイトなどを参考に、hardhat をインストールしてください。

### 3. Create .env file

```bash
cp .env.example .env
```

下記の情報を入れてください。(必要なもののみ)
| NAME                 | VALUE                                             | 必須              |
| -------------------- | ------------------------------------------------- | ----------------- |
| NODE_ENV             | ネットワーク設定。例：polygonMumbai               | yes               |
| MAINNET_ALCHEMY_URL  | Alchemy のAPIキー(Ethereum main net 用)           |                   |
| RINKEBY_ALCHEMY_URL  | Alchemy のAPIキー(Ethereum rinkeby net 用)        |                   |
| GOERLI_ALCHEMY_URL   | Alchemy のAPIキー(Ethereum goerli net 用)         |                   |
| POLYGON_ALCHEMY_URL  | Alchemy のAPIキー(Polygon main net 用)            | yes               |
| MUMBAI_ALCHEMY_URL   | Alchemy のAPIキー(Polygon mumbai net 用)          |                   |
| PUBLIC_KEY           | contract owner の public key                      | yes               |
| PRIVATE_KEY          | contract owner の private key                     | yes               |
| CONTRACT_ADDRESS     | deploy された contract の address (mint 時に利用) | yes (for mint.js) |
| TOKEN_NAME           | NFT の名前 例： "Web3 DAO NFT"                    | yes               |
| TOKEN_SYMBOL         | NFT のシンボル 例： "W3DAO"                       | yes               |
| TOKEN_DESCRIPTION_JA | NFTの詳細（日本語）                               | yes               |
| TOKEN_DESCRIPTION_EN | NFTの詳細（英語）                                 | yes               |
| MAX_BATCH_SIZE       | 1トランザクションでmintできるNFTの最大数          | yes               |

### 4. Run hardhat local node

```bash
npx hardhat node
```

### 5. Test contract

テストを実行します。

```bash
npm test
```

結果

```bash
> test
> npx hardhat test --network localhost



  Web3DAONFT
    ✔ can batch mint MAX_BATCH_SIZE(5) tokens (712ms)
    ✔ Non-owner cannot batch mint (63ms)
    ✔ cannot mint in the case of addresses empty
    ✔ cannot mint more than maxBatchSize
    ✔ cannot mint in the case of the different length of toAddresses and imageURIs
    ✔ cannot mint to owner address
    constructor
      ✔ can set the name and the symbol (104ms)
    mintAndTransfer
      ✔ can batch mint and transfer and call ownedCredential (225ms)
    mint to alice and bob
      ✔ can batch mint and transfer and call ownedCredential (261ms)
    transferOwnership
      ✔ can transfer (56ms)
      ✔ Non-owner cannot transfer
      ✔ cannot transfer to a holder who has this token (166ms)


  12 passing (3s)

```

### 6. Deploy contract

コントラクトをデプロイします。.env に書いた `PUBLIC_KEY` の Wallet にガスが必要です。

Polygon Mumbai用

```bash
npm run deploy:mumbai
```

Polygon メインネット用

```bash
npm run deploy:polygon
```

結果

```bash
> deploy:mumbai
> npx hardhat run scripts/deploy.js --network polygonMumbai

deployed to: 0x1C1448Faad97F779a39f5b8C7d88ff9b81b7d89b
```

ここで得たコントラクトアドレスを、`.env` の `CONTRACT_ADDRESS` に記載してください。

### 7. mint

Deploy したコントラクトを使って、NFT をミントし、配布します。
テスト、本番それぞれで、`.env` の `NODE_ENV` および `CONTRACT_ADDRESS` を変える必要があります。

配布先及び配布画像は、members.json というファイルに記載します。`members.json.example` というファイルを参考に、作成してください。

各項目の解説：

- address: NFTを配布するWalletのアドレス
- image_uri: イメージ画像。ipfs 上のファイルを指定する場合、 "ipfs://" から入力してください。
- external_uri: NFT からリンクする先のURL

配布には、`mint.js` を使います。オプションを付けない場合、`--dry-run=true` となり、ガス代の予測が可能です。

```bash
node scripts/mint.js ./members.json

.....
----- Log -----
....
----- Check Balance -----
Is your balance enough?: true
Before Balance : 49.500574091921937357(MATIC)
Estimated Ether: 0.364822931747079074(MATIC)
GasEstimated   : 6200168(Gas)

----- Results -----
TOTAL: 3(Batches)
OK   : 3(Batches)
NG   : 0(Batches)
GasUsed     : 0(Gas)
EstimatedGas: 6200168(Gas)
```

問題が無ければ、`--dry-run=false` オプションを付けて配布します。

```bash
node scripts/mint.js ./members.json --dry-run=false
```

## optional tools

### create member json from command line

IPFS URL と website URL が同一の場合、 data/member-address.txt を元に members.json を作成できます。
data/member-addresses.txt はWalletアドレスのリストです。

```bash
node scripts/create-member-file.js --ipfsUrl=ipfs://.... --websiteUrl https://...
```

