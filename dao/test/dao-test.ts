import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {Bytes, Contract} from "ethers";
import "@nomiclabs/hardhat-waffle";
import {ethers} from "hardhat";

describe("DAO functionality test", function () {
    let owner: SignerWithAddress;
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;
    let chairman: SignerWithAddress;
    let dao: Contract;
    let myToken: Contract;
    let totalAmount: number = 10000000;
    let duration: number = 3 * 24 * 60 * 60; //3days
    let callData: string;

    beforeEach(async function () {
        [owner, acc1, acc2, chairman] = await ethers.getSigners();

        const myERC20TokenContractFactory = await ethers.getContractFactory("MyERC20Token");
        const myDaoTokenContractFactory = await ethers.getContractFactory("MyDaoContract");

        myToken = await myERC20TokenContractFactory.deploy();
        await myToken.deployed();

        dao = await myDaoTokenContractFactory.deploy(chairman.address, myToken.address, totalAmount / 4, duration);
        await dao.deployed();

        await myToken.changeOwner(owner.address);

        var jsonInterface =
            ["function mint(address _to,uint256 _value)"];
        const i = new ethers.utils.Interface(jsonInterface);
        callData = i.encodeFunctionData('mint', [acc1.address, 9990]);
    });

    it("Construction - should be deployed with proper address", async function () {
        expect(myToken.address).to.be.properAddress;
        expect(dao.address).to.be.properAddress;
    });

    it("Deposit, Withdraw - should be able to deposit and withdraw", async function () {
        // Deposit
        await myToken.mint(acc1.address, totalAmount / 8);

        await myToken.connect(acc1).approve(dao.address, totalAmount / 8);
        await dao.connect(acc1).deposit(totalAmount / 8);

        const balanceAfter = await myToken.balanceOf(acc1.address);
        const daoBalanceAfter = await myToken.balanceOf(dao.address);

        expect(balanceAfter).to.be.equal(0);
        expect(daoBalanceAfter).to.be.equal(totalAmount / 8);

        // Withdraw
        await dao.connect(acc1).withdraw(totalAmount / 8);

        const balanceAfterWithdraw = await myToken.balanceOf(acc1.address);
        const daoBalanceAfterWithdraw = await myToken.balanceOf(dao.address);

        expect(balanceAfterWithdraw).to.be.equal(totalAmount / 8);
        expect(daoBalanceAfterWithdraw).to.be.equal(0);
    });

    it("AddProposal, Vote, Finish - should be able to add proposal, vote and finish", async function () {
        // Deposit as acc1 and acc2
        await myToken.mint(acc1.address, totalAmount / 8 + 10);
        await myToken.connect(acc1).approve(dao.address, totalAmount / 8 + 10);
        await dao.connect(acc1).deposit(totalAmount / 8 + 10);

        await myToken.mint(acc2.address, totalAmount / 8);
        await myToken.connect(acc2).approve(dao.address, totalAmount / 8);
        await dao.connect(acc2).deposit(totalAmount / 8);


        // Add proposal
        await dao.connect(chairman)
            .addProposal(callData, myToken.address, "Mint 9990 Tokens to acc1");

        // Vote
        await dao.connect(acc1).vote(0, 10, true);

        // add 3 days
        await ethers.provider.send('evm_increaseTime', [duration]);

        // Try finish
        await expect(dao.connect(acc2).finishProposal(1))
            .to.be.revertedWith("Proposal is not active");
        await expect(dao.connect(acc2).finishProposal(0))
            .to.be.revertedWith("Not enough votes");

        // Vote
        await dao.connect(acc1).vote(0, totalAmount / 8, true);
        await dao.connect(acc2).vote(0, totalAmount / 8, false);

        // Try finish without permission
        await expect(dao.connect(acc2).finishProposal(0))
            .to.be.revertedWith("Operation failed");

        // Give permission to mint
        await myToken.changeOwner(dao.address);

        //finish proposal
        await dao.connect(acc2).finishProposal(0);

        // Check balance
        const balanceAfter = await myToken.balanceOf(acc1.address);
        expect(balanceAfter).to.be.equal(9990);

        // Withdraw and check balance
        await dao.connect(acc1).withdraw(totalAmount / 8);
        const balanceAfterWithdraw = await myToken.balanceOf(acc1.address);
        expect(balanceAfterWithdraw).to.be.equal(9990 + totalAmount / 8);
    });

    it('Finish - should be able to finish when against wins', async function () {
        // Deposit
        await myToken.mint(acc1.address, totalAmount / 4);
        await myToken.connect(acc1).approve(dao.address, totalAmount / 4);
        await dao.connect(acc1).deposit(totalAmount / 4);

        const balanceBefore = await myToken.balanceOf(acc1.address);
        expect(balanceBefore).to.be.equal(0);

        // Add proposal
        await dao.connect(chairman)
            .addProposal(callData, myToken.address, "Mint 9990 Tokens to acc1");

        // Add 3 days
        await ethers.provider.send('evm_increaseTime', [duration]);

        // Try to add proposal as acc2
        await expect(dao.connect(acc2).addProposal(callData, myToken.address, "Mint 9990 Tokens to acc1"))
            .to.be.revertedWith("Chairman only");

        // Add another proposal
        await dao.connect(chairman)
            .addProposal(callData, myToken.address, "Mint 9990 Tokens to acc1");

        await expect(dao.connect(acc2).finishProposal(1))
            .to.be.revertedWith("Proposal is not finished");

        // Vote for last and after to first proposal
        await dao.connect(acc1).vote(1, totalAmount / 4, false);
        await dao.connect(acc1).vote(0, totalAmount / 4, false);

        await expect(dao.connect(acc1).vote(2, totalAmount / 4, false))
            .to.be.revertedWith("Proposal is not active");

        // Try to withdraw
        await expect(dao.connect(acc1).withdraw(totalAmount / 4))
            .to.be.revertedWith("Can't withdraw yet");

        const balanceBetween = await myToken.balanceOf(acc1.address);
        expect(balanceBetween).to.be.equal(0);

        // Add 3 days again
        await ethers.provider.send('evm_increaseTime', [duration]);

        await dao.connect(acc2).finishProposal(0);
        await dao.connect(acc2).finishProposal(1);

        // Check balance
        const balanceAfter = await myToken.balanceOf(acc1.address);
        expect(balanceAfter).to.be.equal(0);

        // Try to withdraw more amount
        await expect(dao.connect(acc1).withdraw(totalAmount / 2))
            .to.be.revertedWith("Not enough tokens");

        // Withdraw and check balance
        await dao.connect(acc1).withdraw(totalAmount / 4);
        const balanceAfterWithdraw = await myToken.balanceOf(acc1.address);
        expect(balanceAfterWithdraw).to.be.equal(totalAmount / 4);
    });

    it("Vote - should revert when no tokens deposited", async function () {
        await dao.connect(chairman)
            .addProposal(callData, myToken.address, "Mint 9990 Tokens to acc1");

        await expect(dao.connect(acc2).vote(0, totalAmount / 8, true))
            .to.be.revertedWith("Not enough tokens");
    });

});
