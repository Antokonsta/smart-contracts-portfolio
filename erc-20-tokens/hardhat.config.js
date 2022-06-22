require('win-ca').inject('+')
require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require('dotenv').config({path:__dirname+'/.env'})
require('./tasks/create-election.js')
require('./tasks/vote.js')
require('./tasks/finish-election.js')
require('./tasks/collect-commission.js')
require('./tasks/in-progress.js')
require('./tasks/prize.js')
require('./tasks/count.js')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.5",
  networks: {
    ropsten: {
      url: process.env.URL,
      accounts: [process.env.PRIVATE_KEY],
    }
  }
};
