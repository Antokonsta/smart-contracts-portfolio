# Solidity smart contracts for the marketplace

## Task:

### 📝 English version
- Write a marketplace contract, which should include the NFT creation function, as well as the auction functionality.
- Write full-fledged tests for the contract
- Write deployment script
- Deploy to the test network
- Write a task on mint
- Verify the contract

Requirements
- The listItem() function - an exhibition for the sale of an item.
- Function buyItem() - purchase of an item.
- The cancel() function - cancel the sale of the displayed item
- Function listItemOnAuction() - displaying an item for sale in an auction.
- The makeBid() function - place a bid on an auction item with a specific id.
- finishAuction() function - end the auction and send the NFT to the winner

The auction lasts 3 days from the start of the auction. During this period, the auction cannot be cancelled.
If after the expiration of the period more than two bids are collected, the auction is considered to be held and the creator of the auction
completes it (NFT goes to the last bidder and tokens to the creator of the auction).
Otherwise, the tokens are returned to the last bidder, and the NFT remains with the creator.

### 📝 Russian version
- Написать контракт маркетплейса, который должен включать в себя функцию создания NFT, а также функционал аукциона.
- Написать полноценные тесты к контракту
- Написать скрипт деплоя
- Задеплоить в тестовую сеть
- Написать таск на mint
- Верифицировать контракт

Требования
- Функция listItem() - выставка на продажу предмета.
- Функция buyItem() - покупка предмета.
- Функция cancel() - отмена продажи выставленного предмета
- Функция listItemOnAuction() - выставка предмета на продажу в аукционе.
- Функция makeBid() - сделать ставку на предмет аукциона с определенным id.
- Функция finishAuction() - завершить аукцион и отправить НФТ победителю

Аукцион длится 3 дня с момента старта аукциона. В течении этого срока аукцион не может быть отменен.
В случае если по истечению срока набирается более двух ставок аукцион считается состоявшимся и создатель аукциона 
его завершает (НФТ переходит к последнему биддеру и токены создателю аукциона). 
В противном случае токены возвращаются последнему биддеру, а НФТ остается у создателя.
## 💡 Solution:

### Installation
```shell
npm install --save-dev @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers @types/mocha dotenv win-ca hardhat @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-ethers ts-node @typechain/hardhat hardhat-gas-reporter solidity-coverage @openzeppelin/contracts hardhat-contract-sizer
```

### Tests
```shell
npx hardhat coverage --show-stack-traces --network hardhat
```
```shell
npx hardhat test --show-stack-traces --network hardhat
```

### Deployment 
- Deploy ERC-721 token and Copy address of deployed contract and paste to .env file as CONTRACT_ADDRESS_721
```shell
npx hardhat run .\scripts\deploy-721.ts
```

- Deploy ERC-1155 token and Copy address of deployed contract and paste to .env file as CONTRACT_ADDRESS_1155
```shell
npx hardhat run .\scripts\deploy-1155.ts
```

- Use tasks

### Tasks 
721:
- need to create Json with metadata like : .\metadata\rhino.json (and pass it to --tokenUri), where image is a image file in ipfs
- ```npx hardhat mint-721 --to 0x6757a87A1df3546a78C8BC9A05b38b87A1933774 --uri ipfs://QmccGF1pm58Tjm93gHVsv8fMqYrKkZr4XpgQxM1NynodR3```

1155:
- need to create folder in IPFS and add JSON metadata files with ids like: 0.json, 1.json, 2.json
- URI can't be changed (set in the constructor)
- need to make sure that picture is discoverable in IPFS
- ```npx hardhat mint-1155 --to 0x6757a87A1df3546a78C8BC9A05b38b87A1933774 --id 2 --amount 20```

### Verification 

721:
- ```npx hardhat verify 0x52fc87D051dfF9aF784A95dd7E0a484DC1288182```
- Etherscan url: https://rinkeby.etherscan.io/address/0x52fc87d051dff9af784a95dd7e0a484dc1288182#code

1155:
- ```npx hardhat verify 0xb6F79487A0CEd90A8ded7e6d08bac86539AE4543```
- Etherscan url: https://rinkeby.etherscan.io/address/0xb6F79487A0CEd90A8ded7e6d08bac86539AE4543#code

### OpenSea
- ERC-721 collection: https://testnets.opensea.io/collection/pancakeshibaavalanche
- ERC-1155 collection: https://testnets.opensea.io/collection/anton-erc-1155-collection-v4
