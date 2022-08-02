// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ERC20 token for testing bridge
/// @author Anton Konstantinov
contract MyERC20Token is ERC20 {
    address private owner;

    modifier ownerOnly {
        require(msg.sender == owner, "Permission denied");
        _;
    }

    constructor() ERC20("MyERC20Token", "MyErc20"){
        owner = msg.sender;
        _mint(msg.sender, 10 * 10 ** 18);
    }

    function changeOwner(address newOwner) public ownerOnly{
        owner = newOwner;
    }

    function burn(address from, uint256 amount) public ownerOnly{
        _burn(from, amount);
    }

    function mint(address to, uint256 amount) public ownerOnly {
        _mint(to, amount);
    }
}