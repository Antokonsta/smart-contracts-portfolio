require('dotenv').config()

task("in-progress", "Shows whether election in progress or finished")
    .addParam("electionName", "Uniqua name of election")
    .setAction(async (taskArgs) => {
        const elections = await hre.ethers.getContractAt("Elections", process.env.CONTRACT_ADDRESS);
        const result = await elections.inProgress(taskArgs.electionName)

        console.log("This election is in Progress: " + result)
    });