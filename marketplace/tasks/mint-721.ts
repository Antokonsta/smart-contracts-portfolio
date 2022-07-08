import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();

task("mint-721", "Mint Token")
    .addParam("to", "Address to mint to")
    .addParam("uri", "URI of the token")
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners();
        const contractAddr = process.env.CONTRACT_ADDRESS_721;

        const myERC721Contract = await hre.ethers.getContractAt(
            "MyERC721Contract",
            contractAddr as string,
            signer
        );

        const result = await myERC721Contract.mintToken(taskArgs.to, taskArgs.uri);

        console.log(result);
    });