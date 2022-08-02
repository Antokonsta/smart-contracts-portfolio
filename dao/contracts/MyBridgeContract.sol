// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./MyERC20Token.sol";

/// @title Bridge between chains
/// @author Anton Konstantinov
contract MyBridgeContract {

    uint256 private nonceCounter;
    address private validator;
    uint256 private chainId;

    mapping(uint256 => bool) private _chainIdsAllowance;
    mapping(address => address) private _tokenSwapToRedeemMapping;

    constructor() {
        validator = msg.sender;
        chainId = block.chainid;
    }

    modifier onlyValidator() {
        require(msg.sender == validator, "Access denied");
        _;
    }

    /// @notice Swaps ERC20 tokens between different chains, burns tokens from sender chain
    /// @param toChainId ChainId of receiver blockchain
    function swap(address tokenAddressToSwap, address to, uint256 amount, uint256 toChainId) public returns (uint256 nonce) {
        require(_tokenSwapToRedeemMapping[tokenAddressToSwap] != address(0), "Token is not allowed");
        require(_chainIdsAllowance[toChainId], "This chain id is not allowed");

        MyERC20Token(tokenAddressToSwap).burn(msg.sender, amount);
        nonce = nonceCounter++;
        emit SwapInitialized(_tokenSwapToRedeemMapping[tokenAddressToSwap], to, amount, nonce, toChainId);
    }

    /// @notice Redeems swapped tokens, mints tokens to receiver chain, signature and nonce should be provided from validator
    /// @param v Part of signature
    /// @param r Part of signature
    /// @param s Part of signature
    function redeem(address tokenAddressToRedeem, address to, uint256 amount, uint256 nonce, uint256 _chainId, uint8 v, bytes32 r, bytes32 s) public {
        require(chainId == _chainId, "Wrong chain id");

        bytes32 message = keccak256(abi.encodePacked(tokenAddressToRedeem, to, amount, nonce, _chainId));
        address recoveredValidator = ecrecover(hashMessage(message), v, r, s);

        require(recoveredValidator == validator, "Wrong signer");

        MyERC20Token(tokenAddressToRedeem).mint(to, amount);
        emit Redeem(to, amount);
    }

    function includeToken(address tokenAddressToSwap, address tokenAddressToRedeem) public onlyValidator {
        _tokenSwapToRedeemMapping[tokenAddressToSwap] = tokenAddressToRedeem;
    }

    function excludeToken(address token) public onlyValidator {
        _tokenSwapToRedeemMapping[token] = address(0);
    }

    function updateChainById(uint256 targetChainId, bool isAllowed) public onlyValidator {
        _chainIdsAllowance[targetChainId] = isAllowed;
    }

    function hashMessage(bytes32 message) private pure returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, message));
    }

    event SwapInitialized (address tokenAddressToRedeem, address to, uint256 amount, uint256 nonce, uint256 toChainId);

    event Redeem (address to, uint256 amount);
}