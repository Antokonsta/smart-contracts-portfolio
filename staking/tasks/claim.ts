import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();

task("claim", "Claim reward from staking contract")
    .setAction(async (taskArgs, hre) => {
            const [signer] = await hre.ethers.getSigners();
            const contractAddr = process.env.CONTRACT_ADDRESS;

            const stakingContract = await hre.ethers.getContractAt(
                "Staking",
                contractAddr as string,
                signer
            );

            const result = await stakingContract.claim();

            console.log(result);
    });