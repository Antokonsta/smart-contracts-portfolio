import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle";

dotenv.config();

task("mint", "Mint amount of tokens to the address")
    .addParam("address", "Address to mint to")
    .addParam("value", "Amount of tokens to be minted")
    .setAction(async (taskArgs, hre) => {
            const [signer] = await hre.ethers.getSigners();
            const contractAddr = process.env.CONTRACT_ADDRESS;

            const ERC20Contract = await hre.ethers.getContractAt(
                "ERC20",
                contractAddr as string,
                signer
            );

            const result = await ERC20Contract.mint(taskArgs.address, taskArgs.value);

            console.log(result);
    });