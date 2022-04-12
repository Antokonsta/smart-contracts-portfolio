require('dotenv').config()

task("finish-election", "Finish election")
    .addParam("electionName", "Uniqua name of election")
    .setAction(async (taskArgs) => {
        const elections = await hre.ethers.getContractAt("Elections", process.env.CONTRACT_ADDRESS);
        await elections.finishElection(taskArgs.electionName);

        console.log("Election was successfully finished")
    });