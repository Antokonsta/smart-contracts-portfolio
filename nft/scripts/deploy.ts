import { ethers } from "hardhat"
import "@nomiclabs/hardhat-waffle";

async function main() {
    const stakingFactory = await ethers.getContractFactory("Staking");
    const stakingContract = await stakingFactory.deploy(process.env.LPTOKEN_ADDRESS as string, process.env.REWARD_TOKEN_ADDRESS as string);

    await stakingContract.deployed();

    console.log("Staking contract was deployed with address: ", stakingContract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});