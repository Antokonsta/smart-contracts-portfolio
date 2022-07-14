require('win-ca').inject('+')
import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";

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
    defaultNetwork: "rinkeby",
    networks: {
        rinkeby: {
            url: process.env.URL,
            accounts: [process.env.PRIVATE_KEY as string],
            chainId: 4
        },
        binance_testnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            accounts: [process.env.PRIVATE_KEY as string],
            chainId: 97
        },
    },
    etherscan: {
        //apiKey: process.env.ETHERSCAN_API, //ETH api key
        apiKey: process.env.ETHERSCAN_API_BSC //BSC api key
    },
    gasReporter: {
        currency: 'USD',
        gasPrice: 21
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true
    }
};

export default config;



