# Solidity smart contracts for the bridge between chains

## Task:

### 📝 English version
- Write a cross-chain bridge contract to send ERC-20 tokens between Ethereum networks and Binance Smart chain.
- Write full-fledged tests for the contract
- Write deployment script
- Deploy to the test network
- Write a task for an exchange, ransom
- Verify the contract

Requirements
- The swap() function: debits tokens from the user and dispatches the swapInitialized event.
- redeem() function: restore function ecrecover and restore by hashed message and validator address signature, if address is intended with address, it is recommended to contract bridge to use send tokens
- The updateChainById() function: add it or remove it by chainID.
- includeToken() function: add a token to transfer it to another network.
- The excludeToken() function: confirmation of the token to transfer

### 📝 Russian version
- Написать контракт кроссчейн моста для отправки токенов стандарта ERC-20 между сетями Ethereum и Binance Smart chain.
- Написать полноценные тесты к контракту
- Написать скрипт деплоя
- Задеплоить в тестовую сеть
- Написать таск на swap, redeem
- Верифицировать контракт

Требования
- Функция swap(): списывает токены с пользователя и отправляет event ‘swapInitialized’
- Функция redeem(): вызывает функцию ecrecover и восстанавливает по хэшированному сообщению и сигнатуре адрес валидатора, если адрес совпадает с адресом указанным на контракте моста то пользователю отправляются токены
- Функция updateChainById(): добавить блокчейн или удалить по его chainID
- Функция includeToken(): добавить токен для передачи его в другую сеть
- Функция excludeToken(): исключить токен для передачи

Ссылки:
Презентация: https://docs.google.com/presentation/d/14CMVKUrRNP64kbsBbpz_OU3135k_fJSd3YBI1RR__CA/edit?usp=sharing
ECDSA:
https://docs.openzeppelin.com/contracts/4.x/api/utils#ECDSA
Signing Messages:   
https://docs.ethers.io/v4/cookbook-signing.html?highlight=signmessage
Mathematical and Cryptographic Functions:
https://docs.soliditylang.org/en/v0.8.0/units-and-global-variables.html#mathematical-and-cryptographic-functions

## 💡 Solution:

### Business process description (token from ethereum to BSC):
- User calls swap function on the contract in ethereum network => SwapInitialized event will be emitted
- Server process SwapInitialized event and signs the request to redeem using bridge owner account => signature was created
```shell
const messageToSign = ethers.utils.arrayify(
            ethers.utils.solidityKeccak256(
            ["address", "address", "uint256", "uint256", "uint256"],
            [myTokenBsc.address, acc2.address, swapAmount, initialNonce, hardhatChainId])
        );
const signature = await validator.signMessage(messageToSign);
const sig = ethers.utils.splitSignature(signature);
await bridgeBsc.connect(acc2).redeem(myTokenBsc.address, acc2.address, swapAmount, initialNonce, hardhatChainId, sig.v, sig.r, sig.s);
```
- User calls redeem function using the given signature


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
- Deploy bridge contract and Copy address of deployed contract and paste to .env file as CONTRACT_ADDRESS_BRIDGE
Ethereum's deployment:
```shell
npx hardhat run .\scripts\deploy.ts
```

Binance smart chain deployment:
```shell
npx hardhat run ./scripts/deploy.ts --network binance_testnet
```

### Tasks
- swap
- redeem

### Verification
Ethereum's verification:
- ```npx hardhat verify 0xe4266aE5853b4F8fA63075E28060e99027EdC08F```
- Etherscan url: https://rinkeby.etherscan.io/address/0xe4266aE5853b4F8fA63075E28060e99027EdC08F#code

Binance smart chain verification:
- ```npx hardhat verify 0x52fc87D051dfF9aF784A95dd7E0a484DC1288182 --network binance_testnet```
- BscScan url: https://testnet.bscscan.com/address/0x52fc87D051dfF9aF784A95dd7E0a484DC1288182#code

