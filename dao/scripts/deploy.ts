import { ethers } from "hardhat"
import "@nomiclabs/hardhat-waffle";


async function main() {
    const totalAmount = 10000000;
    const three_days = 3 * 24 * 60 * 60;

    const myDaoContractFactory = await ethers.getContractFactory("MyDaoContract");
    const dao = await myDaoContractFactory.deploy(process.env.CHAIRMAN_ADDRESS, process.env.CONTRACT_ADDRESS_ERC20, totalAmount / 4, three_days);



    console.log("DAO deployed to:", dao.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});