import { ethers } from "hardhat"
import "@nomiclabs/hardhat-waffle";

async function main() {

    const myERC721Contract = await ethers.getContractFactory("MyERC721Contract");
    const myERC721 = await myERC721Contract.deploy();

    await myERC721.deployed();

    console.log("myERC721 deployed to:", myERC721.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});