require('win-ca').inject('+')
import * as dotenv from "dotenv";

import {HardhatUserConfig, task} from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";

import "./tasks/index.ts";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

const config: HardhatUserConfig = {
    solidity: "0.8.4",
    defaultNetwork: "ropsten",
    networks: {
        ropsten: {
            url: process.env.URL,
            accounts: [process.env.PRIVATE_KEY as string],
        }
    },
    etherscan: {
        apiKey: {
            ropsten: process.env.ETHERSCAN_API as string
        }
    }
};

export default config;