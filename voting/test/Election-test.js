const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("Elections", function () {
    it("Should deploy Elections contract successfully", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        expect(elections.address).to.be.properAddress
    })

    it("New election - Should be created", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")
        let inProgress = await elections.inProgress("My Election")

        expect(inProgress).to.equal(true)
    })

    it("New election - Should revert when election with same name was created", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await expect(elections.createElection([candidate1.address, candidate2.address], "My Election"))
            .to.be.revertedWith("Election with this specific name was already created")
    })

    it("New election - Should revert when not owner creating", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [owner, notOwner] = await ethers.getSigners()

        await expect(elections.connect(notOwner).createElection([owner.address, notOwner.address], "My Election"))
            .to.be.revertedWith("Elections can be created only by owner")
    })

    it("Vote - Should vote for candidate", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await elections.vote("My Election", candidate2.address, {value: "10000000000000000"})

        expect(await elections.getPrize("My Election")).to.equal(9000000000000000)
        expect(await elections.getCount("My Election", candidate2.address)).to.equal(1)
    })

    it("Vote - Should revert when Election name doesn't exist", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await expect(elections.vote("Non existent election", candidate2.address, {value: "10000000000000000"}))
            .to.be.revertedWith("Election name doesn't exist")
    })

    it("Vote - Should revert when you've already voted", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await elections.vote("My Election", candidate2.address, {value: "10000000000000000"})

        await expect(elections.vote("My Election", candidate2.address, {value: "10000000000000000"}))
            .to.be.revertedWith("You already voted")
    })

    it("Vote - Should revert when insufficient amount", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await expect(elections.vote("My Election", candidate2.address, {value: "9000000000000000"}))
            .to.be.revertedWith("Insufficient amount")
    })

    it("Vote - Should revert when wrong candidate", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2, notCandidate] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await expect(elections.vote("My Election", notCandidate.address, {value: "10000000000000000"}))
            .to.be.revertedWith("It's not a candidate for this election")
    })

    it("Vote - Should revert when election finished", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2, voter1, voter2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await elections.vote("My Election", candidate2.address, {value: "10000000000000000"})
        await elections.connect(voter1).vote("My Election", candidate1.address, {value: "10000000000000000"})
        await elections.connect(voter2).vote("My Election", candidate1.address, {value: "10000000000000000"})

        await elections.finishElection("My Election");

        await expect(elections.vote("My Election", candidate2.address, {value: "10000000000000000"}))
            .to.be.revertedWith("Election finished")
    })

    it("Finish election - Should finish election", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2, voter1, voter2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await elections.vote("My Election", candidate2.address, {value: "10000000000000000"})
        await elections.connect(voter1).vote("My Election", candidate2.address, {value: "10000000000000000"})
        await elections.connect(voter2).vote("My Election", candidate1.address, {value: "10000000000000000"})

        let prize = BigInt(await elections.getPrize("My Election"))

        const balanceOld = await ethers.provider.getBalance(candidate2.address);

        await elections.finishElection("My Election");

        await expect(await ethers.provider.getBalance(candidate2.address)).to.eq(balanceOld.toBigInt() + prize)
        await expect(await elections.inProgress("My Election")).to.eq(false)
    })

    it("Finish election - Should revert when election already finished", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2, voter1, voter2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await elections.vote("My Election", candidate2.address, {value: "10000000000000000"})
        await elections.connect(voter1).vote("My Election", candidate2.address, {value: "10000000000000000"})
        await elections.connect(voter2).vote("My Election", candidate1.address, {value: "10000000000000000"})

        await elections.finishElection("My Election");

        await expect(elections.finishElection("My Election"))
            .to.be.revertedWith("Election finished")
    })

    it("Collect Commission - Should collect successfully", async function () {
        const Elections = await ethers.getContractFactory("Elections")
        let elections = await Elections.deploy()
        await elections.deployed()

        let [candidate1, candidate2, voter1, voter2] = await ethers.getSigners()

        await elections.createElection([candidate1.address, candidate2.address], "My Election")

        await elections.vote("My Election", candidate2.address, {value: "10000000000000000"})
        await elections.connect(voter1).vote("My Election", candidate2.address, {value: "10000000000000000"})
        await elections.connect(voter2).vote("My Election", candidate1.address, {value: "10000000000000000"})

        await elections.finishElection("My Election");

        const balanceOfOwnerOld = await ethers.provider.getBalance(candidate1.address);

        let tx = await elections.collectCommission()

        const balanceOfOwnerNew = await ethers.provider.getBalance(candidate1.address);
        expect(balanceOfOwnerNew > balanceOfOwnerOld)
    })
});
