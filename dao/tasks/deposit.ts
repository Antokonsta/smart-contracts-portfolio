import * as dotenv from "dotenv";

import {task} from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();


task("deposit", "Deposit token for votes")
    .addParam("amount", "Amount of tokens")
    .setAction(async (taskArgs, hre) => {
            const [signer] = await hre.ethers.getSigners();
            const contractAddr = process.env.CONTRACT_ADDRESS_DAO;

            const DAOContract =await hre.ethers.getContractAt(
                "MyDaoContract",
                contractAddr as string,
                signer
            );

            const result = await DAOContract.deposit(taskArgs.amount);

            console.log(result);
    });