import * as dotenv from "dotenv";

import {task} from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();

task("swap", "Swap tokens")
    .addParam("tokenAddressToSwap", "Token address to swap")
    .addParam("to", "Address of user's wallet on another chain")
    .addParam("amount", "Amount of tokens to swap")
    .addParam("toChainId", "Chain id to send tokens")
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners();
        const contractAddr = process.env.CONTRACT_ADDRESS_BRIDGE;

        const myBridgeContract = await hre.ethers.getContractAt(
            "MyBridgeContract",
            contractAddr as string,
            signer
        );

        const result = await myBridgeContract.swap(taskArgs.tokenAddressToSwap, taskArgs.to, taskArgs.amount, taskArgs.toChainId);

        console.log(result);
    });