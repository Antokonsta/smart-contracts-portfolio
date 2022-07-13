import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();

task("createItem721", "Mint Token")
    .addParam("uri", "URI of the token")
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners();
        const contractAddr = process.env.CONTRACT_ADDRESS_MARKET;

        const myMarketplaceContract = await hre.ethers.getContractAt(
            "MyMarketplaceContract",
            contractAddr as string,
            signer
        );

        const result = await myMarketplaceContract.createItem721(taskArgs.uri);

        console.log(result);
    });