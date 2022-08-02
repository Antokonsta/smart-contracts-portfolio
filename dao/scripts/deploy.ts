import { ethers } from "hardhat"
import "@nomiclabs/hardhat-waffle";

async function main() {
    const myBridgeContractFactory = await ethers.getContractFactory("MyBridgeContract");
    const myBridgeContract = await myBridgeContractFactory.deploy();

    await myBridgeContract.deployed();

    console.log("myBridgeContract deployed to:", myBridgeContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});