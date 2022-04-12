require('dotenv').config()

task("prize", "Get current prize of elections")
    .addParam("electionName", "Uniqua name of election")
    .setAction(async (taskArgs) => {
        const elections = await hre.ethers.getContractAt("Elections", process.env.CONTRACT_ADDRESS);
        const result = await elections.getPrize(taskArgs.electionName)

        console.log("The prize of this election is: " + result)
    });