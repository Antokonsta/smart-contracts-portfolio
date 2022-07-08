// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


/// @title ERC-1155 implementation
/// @author Anton Konstantinov
contract MyERC1155Contract is ERC1155 {

    string public name = "Anton ERC-1155 collection v4";
    string public symbol = "Anton1155Collv4";

    constructor() ERC1155("https://gateway.pinata.cloud/ipfs/QmSwM1FfmUZrAJy8JMTnkxinJpWvTbznJNRxnCXyrXiSb7/{id}.json") {}

    function mintToken(address to, uint256 tokenId, uint256 amount) external {
        _mint(to, tokenId, amount, "");
    }

}