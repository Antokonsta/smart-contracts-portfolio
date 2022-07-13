// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./MyERC721Contract.sol";
import "./MyERC20Token.sol";
import "./MyERC1155Contract.sol";

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


/// @title Marketplace for ERC-721 and ERC-1155 tokens
/// @author Anton Konstantinov
contract MyMarketplaceContract is ERC721Holder, ERC1155Holder {
    using Counters for Counters.Counter;
    Counters.Counter private counter1155;

    MyERC20Token private myErc20;
    MyERC721Contract private myErc721;
    MyERC1155Contract private myErc1155;

    mapping(uint256 => Item721) private _items721;
    mapping(uint256 => AuctionItem721) private _auctionItems721;

    mapping(uint256 => Item1155) private _items1155;
    mapping(uint256 => AuctionItem1155) private _auctionItems1155;


    struct Item721 {
        address owner;
        bool available;
        uint256 price;
    }

    struct AuctionItem721 {
        address owner;
        bool available;
        address lastBuyer;
        uint256 bidsNumber;
        uint256 startDate;
        uint256 lastPrice;
    }

    struct Item1155 {
        address owner;
        bool available;
        uint256 price;
        uint256 amount;
    }

    struct AuctionItem1155 {
        address owner;
        bool available;
        address lastBuyer;
        uint256 startDate;
        uint256 lastPrice;
        uint256 bidsNumber;
        uint256 amount;
    }

    constructor(address _myErc20, address _myErc721, address _myErc1155) {
        myErc20 = MyERC20Token(_myErc20);
        myErc721 = MyERC721Contract(_myErc721);
        myErc1155 = MyERC1155Contract(_myErc1155);
    }

    /// @notice Creates new item721 with given Uri and incremented id
    function createItem721(string memory _tokenUri) external returns (uint256) {
        uint256 id = myErc721.mintToken(msg.sender, _tokenUri);
        _items721[id].owner = msg.sender;

        emit Item721Created(id, msg.sender);
        return id;
    }

    /// @notice Creates new item1155 with given amount
    function createItem1155(uint256 amount) external returns (uint256) {
        uint256 tokenId = counter1155.current();
        myErc1155.mintToken(msg.sender, tokenId, amount);

        _items1155[tokenId].owner = msg.sender;

        counter1155.increment();

        emit Item1155Created(tokenId, msg.sender, amount);
        return tokenId;
    }

    /// @notice Lists item721 for sale, msg.sender should be the owner of the token
    function listItem721(uint256 id, uint256 price) public {
        myErc721.safeTransferFrom(msg.sender, address(this), id);

        Item721 storage i = _items721[id];
        i.available = true;
        i.price = price;

        emit Item721Listed(i);
    }

    /// @notice Lists item1155 for sale, msg.sender should be the owner of the token
    function listItem1155(uint256 id, uint256 amount, uint256 price) public {
        myErc1155.safeTransferFrom(msg.sender, address(this), id, amount, "");

        Item1155 storage i = _items1155[id];
        i.available = true;
        i.amount = amount;
        i.price = price;

        emit Item1155Listed(i);
    }

    /// @notice Cancel item721 from sale, msg.sender should be the owner of the token
    function cancel721(uint256 id) public {
        require(_items721[id].owner == msg.sender, "You're not the owner to cancel");
        _items721[id].available = false;
        myErc721.safeTransferFrom(address(this), msg.sender, id);

        emit Item721Canceled(id);
    }

    /// @notice Cancel item1155 from sale, msg.sender should be the owner of the token
    function cancel1155(uint256 id) public {
        Item1155 storage i = _items1155[id];
        require(i.owner == msg.sender, "You're not the owner to cancel");

        i.available = false;
        myErc1155.safeTransferFrom(address(this), msg.sender, id, i.amount, "");

        emit Item1155Canceled(id);
    }

    /// @notice Buy available item721, msg.sender must allow price amount of ERC20 tokens to this contract
    function buyItem721(uint256 id) public {
        Item721 storage i = _items721[id];
        require(i.available, "Item is not available");

        myErc20.transferFrom(msg.sender, i.owner, i.price);
        myErc721.safeTransferFrom(address(this), msg.sender, id);

        emit Item721Bought(id, i.owner);

        i.owner = msg.sender;
        i.available = false;
    }

    /// @notice Buy available item1155, msg.sender must allow price amount of ERC20 tokens to this contract
    function buyItem1155(uint256 id) public {
        Item1155 storage i = _items1155[id];
        require(i.available, "Item is not available");

        myErc20.transferFrom(msg.sender, i.owner, i.price);
        myErc1155.safeTransferFrom(address(this), msg.sender, id, i.amount, "");

        emit Item1155Bought(id, i.owner);

        i.owner = msg.sender;
        i.available = false;
    }


    /// @notice List item721 for auction, msg.sender should be the owner of the token
    function listItemOnAuction721(uint256 id, uint256 minPrice) public {
        AuctionItem721 storage a = _auctionItems721[id];
        require(!a.available, "Item is already listed for auction");

        myErc721.safeTransferFrom(msg.sender, address(this), id);

        a.startDate = block.timestamp;
        a.lastPrice = minPrice;
        a.owner = msg.sender;
        a.available = true;

        emit Auction721Created(id, minPrice);
    }

    /// @notice List item1155 for auction, msg.sender should be the owner of the token
    function listItemOnAuction1155(uint256 id, uint256 amount, uint256 minPrice) public {
        AuctionItem1155 storage a = _auctionItems1155[id];
        require(!a.available, "Item is already listed for auction");

        myErc1155.safeTransferFrom(msg.sender, address(this), id, amount, "");

        a.startDate = block.timestamp;
        a.lastPrice = minPrice;
        a.amount = amount;
        a.owner = msg.sender;
        a.available = true;

        emit Auction1155Created(id, amount, minPrice);
    }

    /// @notice Make bid for available item721, msg.sender must allow price amount of ERC20 tokens to this contract
    function makeBid721(uint256 id, uint256 price) public {
        AuctionItem721 storage a = _auctionItems721[id];
        require(a.available, "Item is not available");
        require(price > a.lastPrice, "Bid is too low");

        if (a.bidsNumber > 0) {
            myErc20.transfer(a.lastBuyer, a.lastPrice);
        }

        myErc20.transferFrom(msg.sender, address(this), price);

        a.bidsNumber += 1;
        a.lastBuyer = msg.sender;
        a.lastPrice = price;

        emit BidMade721(id, price, msg.sender);
    }

    /// @notice Make bid for available item1155, msg.sender must allow price amount of ERC20 tokens to this contract
    function makeBid1155(uint256 id, uint256 price) public {
        AuctionItem1155 storage a = _auctionItems1155[id];
        require(a.available, "Item is not available");
        require(price > a.lastPrice, "Bid is too low");

        if (a.bidsNumber > 0) {
            myErc20.transfer(a.lastBuyer, a.lastPrice);
        }

        myErc20.transferFrom(msg.sender, address(this), price);

        a.bidsNumber += 1;
        a.lastBuyer = msg.sender;
        a.lastPrice = price;

        emit BidMade1155(id, price, msg.sender);
    }

    /// @notice Finish item721 auction, msg.sender should be the owner of the token, Bids count must >= 2
    function finishAuction721(uint256 id) public {
        AuctionItem721 storage a = _auctionItems721[id];
        require(a.owner == msg.sender, "You're not the owner to finish");
        require(block.timestamp > a.startDate + 3 days, "Auction is not finished");
        require(a.bidsNumber >= 2, "Bids number is less than 2");

        myErc20.transfer(a.owner, a.lastPrice);
        myErc721.safeTransferFrom(address(this), a.lastBuyer, id);

        a.available = false;

        emit Auction721Finished(id);
    }

    /// @notice Finish item1155 auction, msg.sender should be the owner of the token, Bids count must >= 2
    function finishAuction1155(uint256 id) public {
        AuctionItem1155 storage a = _auctionItems1155[id];
        require(a.owner == msg.sender, "You're not the owner to finish");
        require(block.timestamp > a.startDate + 3 days, "Auction is not finished");
        require(a.bidsNumber >= 2, "Bids number is less than 2");

        myErc20.transfer(a.owner, a.lastPrice);
        myErc1155.safeTransferFrom(address(this), a.lastBuyer, id, a.amount, "");

        a.available = false;

        emit Auction1155Finished(id);
    }

    /// @notice Cancel item721 auction, msg.sender should be the owner of the token, Bids count must < 2
    function cancelAuction721(uint256 id) public {
        AuctionItem721 storage a = _auctionItems721[id];
        require(a.owner == msg.sender, "You're not the owner to cancel");
        require(block.timestamp > a.startDate + 3 days, "Auction is not finished");
        require(a.bidsNumber < 2, "Bids were already made");

        myErc20.transfer(a.lastBuyer, a.lastPrice);
        myErc721.safeTransferFrom(address(this), a.owner, id);

        a.available = false;

        emit Auction721Canceled(id);
    }

    /// @notice Cancel item1155 auction, msg.sender should be the owner of the token, Bids count must < 2
    function cancelAuction1155(uint256 id) public {
        AuctionItem1155 storage a = _auctionItems1155[id];
        require(a.owner == msg.sender, "You're not the owner to cancel");
        require(block.timestamp > a.startDate + 3 days, "Auction is not finished");
        require(a.bidsNumber < 2, "Bids were already made");

        myErc20.transfer(a.lastBuyer, a.lastPrice);
        myErc1155.safeTransferFrom(address(this), a.owner, id, a.amount, "");

        a.available = false;

        emit Auction1155Canceled(id);
    }

    event Item721Created(uint256 id, address owner);
    event Item1155Created(uint256 id, address owner, uint256 amount);
    event Item721Listed(Item721 item);
    event Item1155Listed(Item1155 item);
    event Item721Canceled(uint256 id);
    event Item1155Canceled(uint256 id);
    event Item721Bought(uint256 id, address lastOwner);
    event Item1155Bought(uint256 id, address lastOwner);

    event Auction721Created(uint256 id, uint256 minPrice);
    event Auction1155Created(uint256 id, uint256 amount, uint256 minPrice);
    event BidMade721(uint256 id, uint256 price, address bidMaker);
    event BidMade1155(uint256 id, uint256 price, address bidMaker);
    event Auction721Finished(uint256 id);
    event Auction1155Finished(uint256 id);
    event Auction721Canceled(uint256 id);
    event Auction1155Canceled(uint256 id);
}