/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

import {expect} from "chai"
import {Contract} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import {ethers} from "hardhat";

describe("ERC20 functionality test", function () {
    let owner: SignerWithAddress
    let acc1: SignerWithAddress
    let acc2: SignerWithAddress
    let acc3: SignerWithAddress
    let acc4: SignerWithAddress
    let erc20: Contract


    beforeEach(async function () {
        [owner, acc1, acc2, acc3, acc4] = await ethers.getSigners()

        const ERC20 = await ethers.getContractFactory("ERC20", owner)
        erc20 = await ERC20.deploy("PancakeGoldToken", "PGT", 1_000, 0)
        await erc20.deployed()
    });

    it("Construction - should be deployed with proper address", async function () {
        expect(erc20.address).to.be.properAddress
    });

    it("Construction - should be constructed with correct values", async function () {
        expect(await erc20.name()).to.equal("PancakeGoldToken")
        expect(await erc20.symbol()).to.equal("PGT")
        expect(await erc20.decimals()).to.equal(0)
        expect(await erc20.totalSupply()).to.equal(1_000)
        expect(await erc20.balanceOf(owner.address)).to.equal(1_000)
    });

    it("Transfer - should transfer tokens", async function () {
        const transferTx = await erc20.transfer(acc1.address, 100)
        await transferTx.wait()
        expect(await erc20.balanceOf(acc1.address)).to.equal(100)
        expect(await erc20.balanceOf(owner.address)).to.equal(900)

    });

    it("Transfer - should fail transfer amount exceeds balance", async function () {
        await expect(erc20.transfer(acc1.address, 1_000_000))
            .to.be.revertedWith("ERC20: transfer amount exceeds balance")
    });

    it("Transfer - should emit transfer event", async function () {
        await expect(erc20.connect(owner).transfer(acc1.address, 100))
            .to.emit(erc20, 'Transfer').withArgs(owner.address, acc1.address, 100);
    })

    it("Allowance - should approve tokens and get allowance", async function () {
        const approveTx = await erc20.approve(acc1.address, 100)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(100)
    });

    it("Allowance - should emit approval event", async function () {
        await expect(await erc20.approve(acc1.address, 100))
            .to.emit(erc20, 'Approval').withArgs(owner.address, acc1.address, 100);
    })

    it("TransferFrom - should transfer tokens", async function () {
        const approveTx = await erc20.approve(acc1.address, 100)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(100)

        const transferFromTx = await erc20.connect(acc1).transferFrom(owner.address, acc2.address, 100)
        await transferFromTx.wait()

        expect(await erc20.balanceOf(acc2.address)).to.equal(1000)
        expect(await erc20.balanceOf(owner.address)).to.equal(900)
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(0)
    });

    it("TransferFrom - should fail to transferFrom with insufficient allowance", async function () {
        const approveTx = await erc20.approve(acc1.address, 100)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(100)

        await expect(erc20.connect(acc1).transferFrom(owner.address, acc2.address, 1_000))
            .to.be.revertedWith("ERC20: insufficient allowance")
        expect(await erc20.balanceOf(acc2.address)).to.equal(0)
        expect(await erc20.balanceOf(owner.address)).to.equal(1_000)
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(100)
    });

    it("TransferFrom - should fail to transferFrom with insufficient balance", async function () {
        const approveTx = await erc20.approve(acc1.address, 100)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(100)

        const transferTx = await erc20.transfer(acc3.address, 1_000)
        await transferTx.wait()

        expect(await erc20.balanceOf(acc3.address)).to.equal(1_000)
        expect(await erc20.balanceOf(owner.address)).to.equal(0)

        await expect(erc20.connect(acc1).transferFrom(owner.address, acc2.address, 100))
            .to.be.revertedWith("ERC20: insufficient balance")
        expect(await erc20.balanceOf(acc2.address)).to.equal(0)
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(100)
    });

    it("TransferFrom - should emit transfer event", async function () {
        const approveTx = await erc20.approve(acc1.address, 100)
        await approveTx.wait()

        await expect(await erc20.connect(acc1).transferFrom(owner.address, acc2.address, 100))
            .to.emit(erc20, 'Transfer').withArgs(owner.address, acc2.address, 100);
    });

    it("Mint - should mint", async function () {
        const mintTx = await erc20.mint(acc1.address, 100)
        await mintTx.wait()

        expect(await erc20.balanceOf(acc1.address)).to.equal(100)
        expect(await erc20.totalSupply()).to.equal(1_100)
    })

    it("Mint - should fail to mint when not owner", async function () {
        await expect(erc20.connect(acc1).mint(acc1.address, 100))
            .to.be.revertedWith("Permission denied")
    })

    it("Mint - should emit transfer event", async function () {
        await expect(erc20.mint(owner.address, 100))
            .to.emit(erc20, 'Transfer').withArgs("0x0000000000000000000000000000000000000000", owner.address, 100);
    })

    it("Burn - should burn", async function () {
        const burnTx = await erc20.burn(owner.address, 100)
        await burnTx.wait()

        expect(await erc20.balanceOf(owner.address)).to.equal(900)
        expect(await erc20.totalSupply()).to.equal(900)
    })

    it("Burn - should fail to burn when burn amount exceeds balance", async function () {
        expect(await erc20.balanceOf(acc1.address)).to.equal(0)

        await expect(erc20.burn(acc1.address, 1000)).to.be.revertedWith("ERC20: burn amount exceeds balance")
    })

    it("Burn - should fail to burn when not owner", async function () {
        await expect(erc20.connect(acc1).burn(owner.address, 1000))
            .to.be.revertedWith("Permission denied")
    })

    it("Burn - should emit transfer event", async function () {
        await expect(erc20.burn(owner.address, 100))
            .to.emit(erc20, 'Transfer').withArgs(owner.address, "0x0000000000000000000000000000000000000000", 100);
    })

});