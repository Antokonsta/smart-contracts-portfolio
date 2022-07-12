import * as dotenv from "dotenv";

import {task} from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();


task("createItem1155", "J1155 mint task")
    .addParam("amount", "Amount of token to mint")
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners();
        const contractAddr = process.env.CONTRACT_ADDRESS_MARKET;

        const myMarketplaceContract = await hre.ethers.getContractAt(
            "MyMarketplaceContract",
            contractAddr as string,
            signer
        );

        const result = await myMarketplaceContract.createItem1155(taskArgs.amount);

        console.log(result);
    });