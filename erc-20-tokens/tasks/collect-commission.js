require('dotenv').config()

task("collect-commission", "Collect commissions from the platform")
    .setAction(async (taskArgs) => {
        const elections = await hre.ethers.getContractAt("Elections", process.env.CONTRACT_ADDRESS);
        await elections.collectCommission();

        console.log("Commission was collected")
    });