import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle"

dotenv.config();

task("transfer-from", "Transfer amount of tokens to address from address based on allowance")
    .addParam("from", "Address transfer from")
    .addParam("to", "Address transfer to")
    .addParam("amount", "Amount of tokens to transfer")
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners();
        const contractAddr = process.env.CONTRACT_ADDRESS;

        const ERC20Contract = await hre.ethers.getContractAt(
            "ERC20",
            contractAddr as string,
            signer
        );

        const result = await ERC20Contract.transferFrom(taskArgs.from, taskArgs.to, taskArgs.amount);

        console.log(result);
    });