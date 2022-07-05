// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


/// @title ERC-1155 implementation
/// @author Anton Konstantinov
contract MyERC1155Contract is ERC1155 {

    constructor() ERC1155("https://ipfs.io/ipfs/QmdqL2dsxW2Eepd6m34PCbWJCtEztKv1rgWxPhV8LYfGV4/{id}.json") {}

    function mintToken(address to, uint256 tokenId, uint256 amount, string memory metadata) external {
        _mint(to, tokenId, amount, "");
        _setURI(metadata);
    }

}