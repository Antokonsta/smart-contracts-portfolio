import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();


task("mint-1155", "J1155 mint task")
    .addParam("to", "Address to mint to")
    .addParam("id", "Id of token")
    .addParam("amount", "Amount of token to mint")
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners();
        const contractAddr = process.env.CONTRACT_ADDRESS_1155;

        const myERC1155Contract = await hre.ethers.getContractAt(
            "MyERC1155Contract",
            contractAddr as string,
            signer
        );

        const result = await myERC1155Contract.mintToken(taskArgs.to, taskArgs.id, taskArgs.amount);

        console.log(result);
    });