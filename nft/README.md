# Solidity smart contracts for NFT standards ERC-721, ERC-1155

## Task:

### 📝 English version
Write NFT contracts of ERC-721, ERC-1155 standards compatible with opensea. You can inherit the pattern from openzeppelin.
- Write an NFT contract
- Write full-fledged tests for the contract
- Write deployment script
- Deploy to the test network
- Write a task on mint
- Verify the contract
- Upload any file to ipfs
- Insert a link to ipfs into the NFT contract

Requirements
- All functions provided by ERC-721, ERC-1155 standards
- All NFT data should be displayed on opensea
- 
### 📝 Russian version
Написать контракты NFT стандартов ERC-721, ERC-1155 совместимые с opensea. Можно наследовать паттерн у openzeppelin.
- Написать контракт NFT
- Написать полноценные тесты к контракту
- Написать скрипт деплоя
- Задеплоить в тестовую сеть
- Написать таск на mint
- Верифицировать контракт
- Загрузить какой либо файл на ipfs
- Вставить в контракт NFT ссылку на ipfs

Требования
- Все предусмотренные стандартами ERC-721, ERC-1155 функции
- Все данные NFT должны отображаться на opensea

Ссылки
https://eips.ethereum.org/EIPS/eip-721
https://eips.ethereum.org/EIPS/eip-1155
https://opensea.io/
https://docs.opensea.io/docs/metadata-standards
https://docs.ipfs.io/
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
- need to create Json with metadata like : .\metadata\rhino.json (and pass it to --tokenUri), where image is a image file in ipfs
- ```npx hardhat mint-721 --to 0x6757a87A1df3546a78C8BC9A05b38b87A1933774 --uri ipfs://QmccGF1pm58Tjm93gHVsv8fMqYrKkZr4XpgQxM1NynodR3```
- mint-1155

### Verification 

- ```npx hardhat verify 0x52fc87D051dfF9aF784A95dd7E0a484DC1288182```
- Etherscan url: https://rinkeby.etherscan.io/address/0x52fc87d051dff9af784a95dd7e0a484dc1288182#code

### OpenSea
- ERC-721 collection: https://testnets.opensea.io/collection/pancakeshibaavalanche
