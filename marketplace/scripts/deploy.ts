import { ethers } from "hardhat"
import "@nomiclabs/hardhat-waffle";

async function main() {
    const contractAddrErc20 = process.env.CONTRACT_ADDRESS_ERC20;
    const contractAddr721 = process.env.CONTRACT_ADDRESS_721;
    const contractAddr1155 = process.env.CONTRACT_ADDRESS_1155;

    const myMarketplaceContract = await ethers.getContractFactory("MyMarketplaceContract");
    const myMarketplace = await myMarketplaceContract.deploy(
        contractAddrErc20 as string,
        contractAddr721 as string,
        contractAddr1155 as string,
    );

    await myMarketplace.deployed();

    console.log("myMarketplace deployed to:", myMarketplace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});