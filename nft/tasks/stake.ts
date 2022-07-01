import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();

task("stake", "Stake amount of lp token to staking contract")
    .addParam("amount", "Amount to stake")
    .setAction(async (taskArgs, hre) => {
            const [signer] = await hre.ethers.getSigners();
            const contractAddr = process.env.CONTRACT_ADDRESS;

            const stakingContract = await hre.ethers.getContractAt(
                "Staking",
                contractAddr as string,
                signer
            );

            const result = await stakingContract.stake(taskArgs.amount);

            console.log(result);
    });