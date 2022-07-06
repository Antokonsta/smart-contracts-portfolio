import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {Contract} from "ethers";
import "@nomiclabs/hardhat-waffle";
import {ethers} from "hardhat";

describe("ERC-1155 test", function () {
    let owner: SignerWithAddress;
    let acc1: SignerWithAddress;
    let erc1155: Contract;

    beforeEach(async function () {
        // Get the signers
        [owner, acc1] = await ethers.getSigners();

        const myERC1155Contract = await ethers.getContractFactory("MyERC1155Contract");
        erc1155 = await myERC1155Contract.deploy();
        await erc1155.deployed();
    });

    it("Construction - should be deployed with proper address", async function () {
        expect(erc1155.address).to.be.properAddress;
    });

    it("mintToken - should mint", async () => {
        expect(await erc1155.balanceOf(acc1.address, 0)).to.equal(0);

        await erc1155.mintToken(acc1.address, 0, 10);
        expect(await erc1155.balanceOf(acc1.address, 0)).to.equal(10);

        await erc1155.mintToken(acc1.address, 0, 10);
        expect(await erc1155.balanceOf(acc1.address, 0)).to.equal(20);
    });

});