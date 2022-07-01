// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ERC20 token for testing staking
/// @author Anton Konstantinov
contract MyERC20Token is ERC20 {
    constructor() ERC20("MyERC20Token", "MET") {
        _mint(msg.sender, 1_000 * 10 ** 18);
    }
}