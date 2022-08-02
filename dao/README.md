# Solidity smart contracts for the DAO

## Task:

### 📝 English version
DAO voting

It is necessary to implement a smart contract that will call the function signature through user voting.
- Write a DAO contract
- Write full-fledged tests for the contract
- Write deployment script
- Deploy to the test network
- Write a task for vote, addProposal, finish, deposit.
- Verify the contract

Requirements
- To participate in voting, users need to deposit voting tokens.
- Withdraw tokens from the DAO, users can only after the end of all the voting in which they participated.
- Only the chairman can propose a vote.
- To participate in the voting, the user must make a deposit, one token, one vote.
- The user can participate in voting with the same tokens, that is, the user has contributed 100 tokens, he can participate in voting No. 1 with all 100 tokens and in voting No. 2 also with all 100 tokens.
- Any user can finish voting after a certain amount of time set in the constructor.

### 📝 Russian version
DAO голосование

Необходимы реализовать смарт контракт, который будет вызывать сигнатуру функции посредством голосования пользователей.
- Написать контракт DAO
- Написать полноценные тесты к контракту
- Написать скрипт деплоя
- Задеплоить в тестовую сеть
- Написать таск на vote, addProposal, finish, deposit.
- Верифицировать контракт

Требования
- Для участия в голосовании пользователям необходимо внести  токены для голосования.
- Вывести токены с DAO, пользователи могут только после окончания всех голосований, в которых они участвовали.
- Голосование может предложить только председатель.
- Для участия в голосовании пользователю необходимо внести депозит, один токен один голос.
- Пользователь может участвовать в голосовании одними и теми же токенами, то есть пользователь внес 100 токенов он может участвовать в голосовании №1 всеми 100 токенами и в голосовании №2 тоже всеми 100 токенами.
- Финишировать голосование может любой пользователь по прошествии определенного количества времени установленном в конструкторе.

Ссылки:

презентация:
https://docs.google.com/presentation/d/1U9iOUNTx2kMJzoPa_v3LnVbf0EGK0Lbrvoa9aewNvLg/edit?usp=sharing

Плагины:
https://docs.google.com/presentation/d/1Cc9Dr-RuzMbOYb-UdKPZohL_i-SRzR1M/edit?usp=sharing&ouid=111440975366925077229&rtpof=true&sd=true

WEB3
https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html

ethers
https://docs.ethers.io/v5/api/utils/abi/coder/

NatSpec:
https://docs.soliditylang.org/en/develop/natspec-format.html#tags

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

