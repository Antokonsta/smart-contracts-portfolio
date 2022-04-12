require('dotenv').config()

task("create-election", "Creating a new election")
    .addParam("candidates", "Candidates separated by , symbol")
    .addParam("electionName", "Uniqua name of election")
    .setAction(async (taskArgs) => {
        const elections = await hre.ethers.getContractAt("Elections", process.env.CONTRACT_ADDRESS);
        await elections.createElection(taskArgs.candidates.split(','), taskArgs.electionName)

        console.log("Election successfully created with name " + taskArgs.electionName)
    });