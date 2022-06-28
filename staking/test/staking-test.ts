import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {Contract} from "ethers";
import "@nomiclabs/hardhat-waffle";
import {ethers, network} from "hardhat";

describe("Staking ERC-20 functionality", function () {
    let lpPoolContract: Contract;
    let rewardTokenContract: Contract;
    let stakingContract: Contract;
    let owner: SignerWithAddress;
    let acc1: SignerWithAddress;

    const stakingAmount = 1_000;

    this.beforeEach(async () => {
        [owner, acc1] = await ethers.getSigners();
        const myERC20TokenFactory = await ethers.getContractFactory("MyERC20Token");

        lpPoolContract = await myERC20TokenFactory.deploy();
        rewardTokenContract = await myERC20TokenFactory.deploy();

        const stakingFactory = await ethers.getContractFactory("Staking");
        stakingContract = await stakingFactory.deploy(lpPoolContract.address, rewardTokenContract.address);

        await lpPoolContract.deployed();
        await rewardTokenContract.deployed();
        await stakingContract.deployed();

        await rewardTokenContract.approve(stakingContract.address, 1_000_000);
        await lpPoolContract.transfer(acc1.address, stakingAmount);
        await rewardTokenContract.transfer(stakingContract.address, 1_000)

        stakingContract = stakingContract.connect(acc1);
        lpPoolContract = lpPoolContract.connect(acc1);
        rewardTokenContract = rewardTokenContract.connect(acc1);
    })

    it("Construction - should be deployed with proper address", async function () {
        expect(stakingContract.address).to.be.properAddress
    })

    it("Stake - should revert on zero stakingAmount", async function () {
        await expect(stakingContract.stake(0)).to.be.revertedWith("Staking amount should be more than 0");
    });

    it("Stake - should stake correctly", async function () {
        await lpPoolContract.approve(stakingContract.address, stakingAmount);

        const stakeTx = await stakingContract.stake(stakingAmount);
        await stakeTx.wait();

        expect(await lpPoolContract.balanceOf(acc1.address)).to.equal(0)
    });

    it("Unstake - should revert for unstake during lock time", async function () {
        await lpPoolContract.approve(stakingContract.address, stakingAmount);

        const stakeTx = await stakingContract.stake(stakingAmount);
        await stakeTx.wait();

        await expect(stakingContract.unstake()).to.be.revertedWith("Lock time isn't finished");
    });

    it("Unstake - should revert for unstake if no deposited amount", async function () {
        await expect(stakingContract.unstake()).to.be.revertedWith("You have no deposit");
    });

    it("Unstake - should unstake correctly - no reward", async function () {
        await lpPoolContract.approve(stakingContract.address, stakingAmount);
        const newLockTime = 2 * 60;  //2 mins
        await stakingContract.connect(owner).setLockTime(newLockTime);
        await stakingContract.connect(acc1).stake(stakingAmount);

        await network.provider.send("evm_increaseTime", [newLockTime + 1]);
        const unstakingTx = await stakingContract.unstake();
        await unstakingTx.wait()

        expect(await lpPoolContract.balanceOf(acc1.address)).to.equal(stakingAmount)
    });

    it("Unstake - should unstake correctly - with Reward", async function () {
        await lpPoolContract.approve(stakingContract.address, stakingAmount);
        const newLockTime = 2 * 60;  //2 mins
        await stakingContract.connect(owner).setLockTime(newLockTime);
        await stakingContract.connect(acc1).stake(stakingAmount);

        await network.provider.send("evm_increaseTime", [newLockTime * 10]);
        const unstakingTx = await stakingContract.unstake();
        await unstakingTx.wait()

        expect(await lpPoolContract.balanceOf(acc1.address)).to.equal(stakingAmount)
    });


    it("Claim - should revert if no rewards", async function () {
        await expect(stakingContract.claim()).to.be.revertedWith("You have no rewards");
    });

    it("Claim - should claim successfully", async function () {
        await lpPoolContract.approve(stakingContract.address, stakingAmount);

        const initialReward = await rewardTokenContract.balanceOf(acc1.address);
        await stakingContract.stake(stakingAmount);

        await network.provider.send("evm_increaseTime", [10 * 60 * 2]); // Add 20 minutes
        await stakingContract.claim();

        const rewardAfterClaim = await rewardTokenContract.balanceOf(acc1.address);

        expect(rewardAfterClaim - initialReward).to.be.equal(stakingAmount * 20 * 2 / 100);
    });

    it("Claim - should claim successfully with new Reward Percent", async function () {
        await lpPoolContract.approve(stakingContract.address, stakingAmount);

        const initialReward = await rewardTokenContract.balanceOf(acc1.address);
        const newPercent = 30;
        await stakingContract.connect(owner).setRewardPercent(newPercent);
        await stakingContract.connect(acc1).stake(stakingAmount);

        await network.provider.send("evm_increaseTime", [10 * 60 * 2]); // Add 20 minutes
        await stakingContract.claim();

        const rewardAfterClaim = await rewardTokenContract.balanceOf(acc1.address);

        expect(rewardAfterClaim - initialReward).to.be.equal(stakingAmount * newPercent * 2 / 100);
    });

    it("Claim - should claim successfully with new Frequency", async function () {
        await lpPoolContract.approve(stakingContract.address, stakingAmount);

        const initialReward = await rewardTokenContract.balanceOf(acc1.address);
        const newFrequency = 20 * 60; //20 minutes
        await stakingContract.connect(owner).setRewardFrequency(newFrequency);
        await stakingContract.connect(acc1).stake(stakingAmount);

        await network.provider.send("evm_increaseTime", [newFrequency * 2]); // Add 40 minutes
        await stakingContract.claim();

        const rewardAfterClaim = await rewardTokenContract.balanceOf(acc1.address);

        expect(rewardAfterClaim - initialReward).to.be.equal(stakingAmount * 20 * 2 / 100);
    });


    it("setRewardPercent - Check that only owner can change percentage", async function () {
        await expect(stakingContract.setRewardPercent(10)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("setRewardFrequency - Check that only owner can change reward frequency", async function () {
        await expect(stakingContract.setRewardFrequency(0)).to.be.revertedWith("'Ownable: caller is not the owner");
    });

    it("setLockTime - Check that only owner can change stake lock time", async function () {
        await expect(stakingContract.setLockTime(0)).to.be.revertedWith("'Ownable: caller is not the owner");
    });

});