# Solidity smart contract for erc-20 token

## Task:

### 📝 English version
Write an ERC-20 token

- Implement all the main functionality of the contract. Do not inherit from openzeppelin and other libraries and do not copy code (!)
- Add mint and burn functions, access to which only the owner of the smart contract has
- Write full-fledged tests for the contract
- Write deployment script
- Deploy to the test network
- Write tasks for transfer, transferFrom, approve, mint, burn
- Verify the contract

Requirements
- All ERC20 tokens on the network must comply with the standard described in eip.
- Contain the full set of features from eip.
- The implementation of the logic and the responsibility for correctness lies with you, however, the network is full of examples of ERC20 tokens, where you can see how the implementation of such tokens usually looks like.

### 📝 Russian version
Написать токен стандарта ERC-20

- Реализовать весь основной функционал контракта. Не наследовать от openzeppelin и прочих библиотек и не копировать код (!)
- Добавить функции mint и burn, доступ к которым имеет только владелец смарт контракта
- Написать полноценные тесты к контракту
- Написать скрипт деплоя
- Задеплоить в тестовую сеть
- Написать таски на transfer, transferFrom, approve, mint, burn
- Верифицировать контракт

Требования
- Все ERC20 токены в сети должны удовлетворять стандарту описанному в eip.
- Содержать полный набор функций из eip.
- Реализация логики и ответственность за правильность лежит на вас, впрочем в сети полно примеров ERC20 токенов, где можно посмотреть как обычно выглядит реализация подобных токенов.

## 💡 Solution:

- Smart contract was created 
- Tests for smart contract were created (coverage is 100%)
- Tasks were created:
```shell
npx hardhat create-election --candidates --election-name
npx hardhat vote --candidate --election-name
npx hardhat finish-election --election-name
npx hardhat collect-commission
npx hardhat in-progress --election-name
npx hardhat prize --election-name
npx hardhat count --candidate --election-name 
```
- Deploy script was created