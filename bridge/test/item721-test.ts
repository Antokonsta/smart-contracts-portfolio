import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {BigNumber, Contract} from "ethers";
import "@nomiclabs/hardhat-waffle";
import {ethers, network} from "hardhat";

describe("Marketplace item721 test", function () {
    let owner: SignerWithAddress;
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;
    let acc3: SignerWithAddress;
    let marketplace: Contract;
    let myErc20: Contract;
    let myErc721: Contract;
    let myErc1155: Contract;
    let id = BigNumber.from(0);

    beforeEach(async function () {
        // Get the signers
        [owner, acc1, acc2, acc3] = await ethers.getSigners();

        const myERC20TokenFactory = await ethers.getContractFactory("MyERC20Token");
        myErc20 = <Contract>await myERC20TokenFactory.deploy("PancakeGoldToken", "PGT", 1_000, 0);
        await myErc20.deployed();


        const myERC721Contract = await ethers.getContractFactory("MyERC721Contract");
        myErc721 = <Contract>await myERC721Contract.deploy();
        await myErc721.deployed();

        const myERC1155Contract = await ethers.getContractFactory("MyERC1155Contract");
        myErc1155 = <Contract>await myERC1155Contract.deploy();
        await myErc1155.deployed();

        const marketplaceContract = await ethers.getContractFactory("MyMarketplaceContract");
        marketplace = <Contract>(await marketplaceContract.deploy(
                myErc20.address,
                myErc721.address,
                myErc1155.address
            )
        );
        await marketplace.deployed();
    });

    it("Construction - should be deployed with proper address", async function () {
        expect(marketplace.address).to.be.properAddress;
    });


    it("listItem721 - should list and buy successfully", async function () {
        await marketplace.connect(acc1).createItem721("");

        expect(await myErc721.balanceOf(acc1.address)).to.eq(1);

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItem721(id, 1);

        await myErc20.mint(acc2.address, 1);
        await myErc20.connect(acc2).approve(marketplace.address, 1);
        await marketplace.connect(acc2).buyItem721(id);

        expect(await myErc721.balanceOf(acc1.address)).to.eq(0);
        expect(await myErc721.balanceOf(acc2.address)).to.eq(1);
    });

    it("listItem721 - should list and cancel", async function () {
        await marketplace.connect(acc1).createItem721("");
        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItem721(id, 1);

        expect(await myErc721.balanceOf(acc1.address)).to.eq(0);

        await marketplace.connect(acc1).cancel721(id);

        expect(await myErc721.balanceOf(acc1.address)).to.eq(1);
    });

    it("buyItem721 - should revert if item is not available anymore", async function () {
        await marketplace.connect(acc1).createItem721("");
        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItem721(id, 1);

        await marketplace.connect(acc1).cancel721(id);


        await expect(marketplace.connect(acc2).buyItem721(id)).to.be.revertedWith(
            "Item is not available"
        );
    });

    it("cancel721 - should revert if not an owner", async function () {
        await marketplace.connect(acc1).createItem721("");
        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItem721(id, 1);

        await expect(marketplace.connect(acc2).cancel721(id)).to.be.revertedWith(
            "You're not the owner to cancel"
        );
    });

    it("listItemOnAuction721 - should list on auction and finish", async function () {
        await marketplace.connect(acc1).createItem721("");

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItemOnAuction721(id, 1);

        expect(await myErc721.balanceOf(acc1.address)).to.eq(0);

        await myErc20.mint(acc2.address, 10);
        await myErc20.connect(acc2).approve(marketplace.address, 10);
        await marketplace.connect(acc2).makeBid721(id, 10);

        expect(await myErc20.balanceOf(acc2.address)).to.eq(0);
        expect(await myErc20.balanceOf(marketplace.address)).to.eq(10);

        await myErc20.mint(acc3.address, 15);
        await myErc20.connect(acc3).approve(marketplace.address, 15);
        await marketplace.connect(acc3).makeBid721(id, 15);

        expect(await myErc20.balanceOf(acc3.address)).to.eq(0);
        expect(await myErc20.balanceOf(acc2.address)).to.eq(10);
        expect(await myErc20.balanceOf(marketplace.address)).to.eq(15);


        await expect(marketplace.connect(acc1).finishAuction721(id)).to.be.revertedWith(
            "Auction is not finished"
        );

        await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 4]); //+4 days


        await marketplace.connect(acc1).finishAuction721(id);

        expect(await myErc20.balanceOf(acc3.address)).to.eq(0);
        expect(await myErc20.balanceOf(acc1.address)).to.eq(15);
        expect(await myErc721.balanceOf(acc3.address)).to.eq(1);
        expect(await myErc721.balanceOf(acc1.address)).to.eq(0);
    });

    it("listItemOnAuction721 - should revert if already listed", async function () {
        await marketplace.connect(acc1).createItem721("");

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItemOnAuction721(id, 1);

        await expect(marketplace.connect(acc1).listItemOnAuction721(id, 1)).to.be.revertedWith(
            "Item is already listed for auction"
        );
    });

    it("finishAuction721 - should reverted because of number of bids", async function () {
        await marketplace.connect(acc1).createItem721("");

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItemOnAuction721(id, 1);

        expect(await myErc721.balanceOf(acc1.address)).to.eq(0);

        await myErc20.mint(acc2.address, 10);
        await myErc20.connect(acc2).approve(marketplace.address, 10);
        await marketplace.connect(acc2).makeBid721(id, 10);

        await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 4]); //+4 days

        await expect(marketplace.connect(acc1).finishAuction721(id)).to.be.revertedWith(
            "Bids number is less than 2"
        );
    });

    it("finishAuction721 - revert if not owner is trying to finish", async function () {
        await marketplace.connect(acc1).createItem721("");

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItemOnAuction721(id, 1);

        await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 4]); //+4 days

        await expect(marketplace.connect(acc2).finishAuction721(id)).to.be.revertedWith(
            "You're not the owner to finish"
        );

    });

    it("cancelAuction721 - should reverted on cancel", async function () {
        await marketplace.connect(acc1).createItem721("");

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItemOnAuction721(id, 1);

        expect(await myErc721.balanceOf(acc1.address)).to.eq(0);

        await myErc20.mint(acc2.address, 10);
        await myErc20.connect(acc2).approve(marketplace.address, 10);
        await marketplace.connect(acc2).makeBid721(id, 10);

        expect(await myErc20.balanceOf(acc2.address)).to.eq(0);
        expect(await myErc20.balanceOf(marketplace.address)).to.eq(10);


        await expect(marketplace.connect(acc1).cancelAuction721(id)).to.be.revertedWith(
            "Auction is not finished"
        );

        await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 4]); //+4 days


        await myErc20.mint(acc3.address, 15);
        await myErc20.connect(acc3).approve(marketplace.address, 15);
        await marketplace.connect(acc3).makeBid721(id, 15);

        expect(await myErc20.balanceOf(acc3.address)).to.eq(0);
        expect(await myErc20.balanceOf(acc2.address)).to.eq(10);
        expect(await myErc20.balanceOf(marketplace.address)).to.eq(15);


        expect(marketplace.connect(acc1).cancelAuction721(id)).to.be.revertedWith(
            "Bids were already made"
        );
    });

    it("cancelAuction721 - should cancel successfully", async function () {
        await marketplace.connect(acc1).createItem721("");

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItemOnAuction721(id, 1);

        expect(await myErc721.balanceOf(acc1.address)).to.eq(0);

        await myErc20.mint(acc2.address, 10);
        await myErc20.connect(acc2).approve(marketplace.address, 10);
        await marketplace.connect(acc2).makeBid721(id, 10);

        expect(await myErc20.balanceOf(acc2.address)).to.eq(0);
        expect(await myErc20.balanceOf(marketplace.address)).to.eq(10);


        await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 4]); //+4 days

        await marketplace.connect(acc1).cancelAuction721(id);

        expect(await myErc20.balanceOf(acc2.address)).to.eq(10);
        expect(await myErc20.balanceOf(acc1.address)).to.eq(0);
        expect(await myErc721.balanceOf(acc1.address)).to.eq(1);
        expect(await myErc721.balanceOf(acc2.address)).to.eq(0);
    });

    it("cancelAuction721 - revert if not owner is trying to close", async function () {
        await marketplace.connect(acc1).createItem721("");

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItemOnAuction721(id, 1);

        await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 4]); //+4 days

        await expect(marketplace.connect(acc2).cancelAuction721(id)).to.be.revertedWith(
            "You're not the owner to cancel"
        );

    });

    it("makeBid721 - on cancelled auction", async function () {
        await marketplace.connect(acc1).createItem721("");

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItemOnAuction721(id, 1);

        expect(await myErc721.balanceOf(acc1.address)).to.eq(0);

        await myErc20.mint(acc2.address, 10);
        await myErc20.connect(acc2).approve(marketplace.address, 10);
        await marketplace.connect(acc2).makeBid721(id, 10);

        expect(await myErc20.balanceOf(acc2.address)).to.eq(0);
        expect(await myErc20.balanceOf(marketplace.address)).to.eq(10);


        await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 4]); //+4 days

        await marketplace.connect(acc1).cancelAuction721(id);

        expect(await myErc20.balanceOf(acc2.address)).to.eq(10);
        expect(await myErc20.balanceOf(acc1.address)).to.eq(0);
        expect(await myErc721.balanceOf(acc1.address)).to.eq(1);
        expect(await myErc721.balanceOf(acc2.address)).to.eq(0);


        await expect(marketplace.connect(acc2).makeBid721(id, 10)).to.be.revertedWith(
            "Item is not available"
        );
    });

    it("makeBid721 - reverted with low bid", async function () {
        await marketplace.connect(acc1).createItem721("");

        await myErc721.connect(acc1).approve(marketplace.address, id);
        await marketplace.connect(acc1).listItemOnAuction721(id, 2);

        expect(await myErc721.balanceOf(acc1.address)).to.eq(0);

        await myErc20.mint(acc2.address, 10);
        await myErc20.connect(acc2).approve(marketplace.address, 10);

        await expect(marketplace.connect(acc2).makeBid721(id, 1)).to.be.revertedWith(
            "Bid is too low"
        );
    });
});
