import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {Contract} from "ethers";
import "@nomiclabs/hardhat-waffle";
import {ethers} from "hardhat";

describe("ERC-721 test", function () {
    let owner: SignerWithAddress;
    let acc1: SignerWithAddress;
    let erc721: Contract;

    beforeEach(async function () {
        // Get the signers
        [owner, acc1] = await ethers.getSigners();

        const myERC721Contract = await ethers.getContractFactory("MyERC721Contract");
        erc721 = await myERC721Contract.deploy();
        await erc721.deployed();
    });

    it("Construction - should be deployed with proper address", async function () {
        expect(erc721.address).to.be.properAddress;
    });

    it("mintToken - should mint", async () => {
        expect(await erc721.balanceOf(acc1.address)).to.equal(0);

        await erc721.mintToken(acc1.address, "");
        expect(await erc721.balanceOf(acc1.address)).to.equal(1);

        await erc721.mintToken(acc1.address, "");
        expect(await erc721.balanceOf(acc1.address)).to.equal(2);
    });

    it("mintToken - should be able to mint and get Token Uri", async () => {
        await erc721.connect(acc1).mintToken(
            owner.address,
            "QmcVuxccdpTUFemjK6G9eGqcig7rEVinfDa3bswXBVkJvY"
        );

        const tokenUri = await erc721.tokenURI(0);

        expect(tokenUri).to.eq("QmcVuxccdpTUFemjK6G9eGqcig7rEVinfDa3bswXBVkJvY");
    });

    it("mintToken - should get right supply", async function () {
        expect(await erc721.supply()).to.eq(0);
        await erc721.connect(acc1).mintToken(
            acc1.address,
            "QmcVuxccdpTUFemjK6G9eGqcig7rEVinfDa3bswXBVkJvY"
        );
        expect(await erc721.supply()).to.eq(1);
    });

    it("mintToken - should get owner", async function () {
        await erc721.connect(acc1).mintToken(
            acc1.address,
            "QmcVuxccdpTUFemjK6G9eGqcig7rEVinfDa3bswXBVkJvY"
        );
        expect(await erc721.ownerOf(0)).to.eq(acc1.address);
    });
});