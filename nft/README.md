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
npm install --save-dev @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers @types/mocha dotenv win-ca hardhat @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-ethers ts-node @typechain/hardhat hardhat-gas-reporter solidity-coverage @openzeppelin/contracts
```

### Tests
```shell
npx hardhat coverage --show-stack-traces --network hardhat
```
```shell
npx hardhat test --show-stack-traces --network hardhat
```

### Deployment 
- Created LP token v2 via UniSwap website and paste to .env LPTOKEN_ADDRESS (need to approve spending)
- Paste REWARD_TOKEN_ADDRESS to .env from previous assignment
```shell
npx hardhat run .\scripts\deploy.ts
```
- Copy address of deployed contract and paste to .env file as CONTRACT_ADDRESS
- Use tasks

### Tasks 
- stake
- claim
- unstake

### Verification

- ```npx hardhat verify 0xA3E37497e5Df7148B59b6c87178c1EcBeE69CA8e --constructor-args arguments.ts```
- Etherscan url: https://ropsten.etherscan.io/address/0xA3E37497e5Df7148B59b6c87178c1EcBeE69CA8e
