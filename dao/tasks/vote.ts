import * as dotenv from "dotenv";

import {task} from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();

task("vote", "Vote to proposal")
    .addParam("id", "ID of proposal")
    .addParam("amount", "Amount of tokens")
    .addParam("isFor", "For or Against")
    .setAction(async (taskArgs, hre) => {
            const [signer] = await hre.ethers.getSigners();
            const contractAddr = process.env.CONTRACT_ADDRESS_DAO;

            const DAOContract =await hre.ethers.getContractAt(
                "MyDaoContract",
                contractAddr as string,
                signer
            );

            const result = await DAOContract.vote(
                taskArgs.id, taskArgs.amount, taskArgs.isFor
            );

            console.log(result);
    });