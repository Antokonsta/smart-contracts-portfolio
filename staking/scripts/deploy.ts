import { ethers } from "hardhat"
import "@nomiclabs/hardhat-waffle";

async function main() {
    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20 = await ERC20.deploy("PancakeShibaAvalanche", "PSA", 1_000_000, 18);

    await erc20.deployed();

    console.log("ERC20 token deployed to:", erc20.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});