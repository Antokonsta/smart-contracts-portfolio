require('dotenv').config()

task("vote", "Vote for candidate")
    .addParam("candidate", "Candidate's address")
    .addParam("electionName", "Uniqua name of election")
    .setAction(async (taskArgs) => {
        const elections = await hre.ethers.getContractAt("Elections", process.env.CONTRACT_ADDRESS);
        await elections.vote(taskArgs.electionName, taskArgs.candidate, {value: "10000000000000000"})

        console.log("Vote successfully added")
    });