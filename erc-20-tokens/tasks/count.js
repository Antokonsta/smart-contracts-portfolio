require('dotenv').config()

task("count", "Get count of votes for this candidate")
    .addParam("candidate", "Candidate's address")
    .addParam("electionName", "Uniqua name of election")
    .setAction(async (taskArgs) => {
        const elections = await hre.ethers.getContractAt("Elections", process.env.CONTRACT_ADDRESS);
        const result = await elections.getCount(taskArgs.electionName, taskArgs.candidate)

        console.log("This candidate got this amount of votes: " + result)
    });