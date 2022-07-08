// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title ERC-721 implementation
/// @author Anton Konstantinov
contract MyERC721Contract is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private counter;

    constructor() ERC721("PancakeShibaAvalanche", "PSA") {}

    function mintToken(address _to, string memory _tokenUri) external returns (uint256) {
        uint256 current = counter.current();
        _mint(_to, current);
        _setTokenURI(current, _tokenUri);

        counter.increment();
        return current;
    }

    function supply() external view returns (uint256) {
        return counter.current();
    }
}