import * as dotenv from "dotenv";

import {task} from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();


task("redeem", "Redeem tokens")
    .addParam("tokenAddressToRedeem", "Address of token to recieve")
    .addParam("to", "Address of wallet to mint")
    .addParam("amount", "Amount of tokens to mint")
    .addParam("nonce", "Nonce value")
    .addParam("chainId", "ChainId of current blockchain")
    .addParam("v", "Part of signature")
    .addParam("r", "Part of signature")
    .addParam("s", "Part of signature")
    .setAction(async (taskArgs, hre) => {
            const [signer] = await hre.ethers.getSigners();
            const contractAddr = process.env.CONTRACT_ADDRESS_BRIDGE;

            const BridgeContract = await hre.ethers.getContractAt(
                "MyBridgeContract",
                contractAddr as string,
                signer
            );

            const result = await BridgeContract.redeem(
                taskArgs.tokenAddressToRedeem, taskArgs.to, taskArgs.amount, taskArgs.nonce,
                taskArgs.chainId, taskArgs.v, taskArgs.r, taskArgs.s);

            console.log(result);
    });