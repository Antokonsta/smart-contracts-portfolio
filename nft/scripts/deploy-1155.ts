import { ethers } from "hardhat"
import "@nomiclabs/hardhat-waffle";

async function main() {

    const myERC1155Contract = await ethers.getContractFactory("MyERC1155Contract");
    const myERC1155 = await myERC1155Contract.deploy();

    await myERC1155.deployed();

    console.log("myERC1155 deployed to:", myERC1155.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});