import * as dotenv from "dotenv";

import {task} from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();


task("add-proposal", "Add proposal")
    .addParam("calldata", "Call Data")
    .addParam("recipient", "Recipient")
    .addParam("description", "Description of proposal")
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners();
        const contractAddr = process.env.CONTRACT_ADDRESS_DAO;

        const DAOContract =await hre.ethers.getContractAt(
            "MyDaoContract",
            contractAddr as string,
            signer
        );

        const result = await DAOContract.addProposal(
            taskArgs.calldata, taskArgs.recipient, taskArgs.description);

        console.log(result);
    });