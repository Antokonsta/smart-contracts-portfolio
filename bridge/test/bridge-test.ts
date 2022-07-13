import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {Contract} from "ethers";
import "@nomiclabs/hardhat-waffle";
import {ethers} from "hardhat";

describe("Chains bridge functionality test", function () {
    let bridgeEth: Contract;
    let bridgeBsc: Contract;
    let myTokenEth: Contract;
    let myTokenBsc: Contract;
    let validator: SignerWithAddress;
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;
    const hardhatChainId = 31337;
    const bscTestNetChainId = 97;
    const swapAmount = 50;
    const initialNonce = 0;

    this.beforeEach(async () => {
        [validator, acc1, acc2] = await ethers.getSigners();

        const myERC20TokenContractFactory = await ethers.getContractFactory("MyERC20Token");
        const myBridgeContractFactory = await ethers.getContractFactory("MyBridgeContract");


        myTokenEth = await myERC20TokenContractFactory.deploy();
        await myTokenEth.deployed();

        myTokenBsc = await myERC20TokenContractFactory.deploy();
        await myTokenBsc.deployed();

        bridgeEth = await myBridgeContractFactory.deploy();
        await bridgeEth.deployed();

        bridgeBsc = await myBridgeContractFactory.deploy();
        await bridgeBsc.deployed();

        myTokenEth.mint(acc1.address, 100);

        await myTokenEth.changeOwner(bridgeEth.address);
        await myTokenBsc.changeOwner(bridgeBsc.address);
    });

    it("Construction - should be deployed with proper address", async function () {
        expect(myTokenEth.address).to.be.properAddress
        expect(myTokenBsc.address).to.be.properAddress
        expect(bridgeEth.address).to.be.properAddress
        expect(bridgeBsc.address).to.be.properAddress
    })

    it("Swap - should revert for not allowed token", async function () {
        await expect(
            bridgeEth.connect(acc1).swap(myTokenEth.address, acc2.address, 1, bscTestNetChainId)
        ).to.be.revertedWith("Token is not allowed");
    });

    it("Swap - should revert for not allowed token after exclude", async function () {
        bridgeEth.includeToken(myTokenEth.address, myTokenBsc.address);
        bridgeEth.excludeToken(myTokenEth.address);
        await expect(
            bridgeEth.connect(acc1).swap(myTokenEth.address, acc2.address, 1, bscTestNetChainId)
        ).to.be.revertedWith("Token is not allowed");
    });


    it("Swap - should revert for not allowed chain id", async function () {
        bridgeEth.includeToken(myTokenEth.address, myTokenBsc.address);
        await expect(
            bridgeEth.connect(acc1).swap(myTokenEth.address, acc2.address, 1, bscTestNetChainId)
        ).to.be.revertedWith("This chain id is not allowed");
    });


    it("Swap - should swap successfully", async function () {
        bridgeEth.includeToken(myTokenEth.address, myTokenBsc.address);
        bridgeEth.updateChainById(bscTestNetChainId, true);

        const initialSupply = await myTokenEth.totalSupply();
        const initialAcc1Balance = await myTokenEth.balanceOf(acc1.address);

        const swapTransaction = await bridgeEth.connect(acc1).swap(myTokenEth.address, acc2.address, swapAmount, bscTestNetChainId);
        const rc = await swapTransaction.wait();
        const swapInitializedEvent = rc.events.find((e: { event: string }) => e.event == 'SwapInitialized');
        const [tokenAddressToRedeem, to, amount, nonce, toChainId] = swapInitializedEvent.args;

        expect(amount).to.equal(swapAmount);
        expect(to).to.equal(acc2.address);
        expect(nonce).to.equal(initialNonce);
        expect(toChainId).to.equal(bscTestNetChainId);
        expect(tokenAddressToRedeem).to.equal(myTokenBsc.address);

        expect(await myTokenEth.totalSupply()).to.equal(initialSupply.sub(swapAmount));
        expect(await myTokenEth.balanceOf(acc1.address)).to.equal(initialAcc1Balance.sub(swapAmount));
    });


    it("Redeem - should redeem successfully", async function () {
        const initialSupply = await myTokenBsc.totalSupply();
        const messageToSign = ethers.utils.arrayify(
            ethers.utils.solidityKeccak256(["address", "address", "uint256", "uint256", "uint256"],
                [myTokenBsc.address, acc2.address, swapAmount, initialNonce, hardhatChainId])
        );
        const signature = await validator.signMessage(messageToSign);
        const sig = ethers.utils.splitSignature(signature);
        const redeemTransaction = await bridgeBsc.connect(acc2).redeem(myTokenBsc.address, acc2.address, swapAmount, initialNonce, hardhatChainId, sig.v, sig.r, sig.s);
        const rc = await redeemTransaction.wait();
        const redeemEvent = rc.events.find((e: { event: string }) => e.event == 'Redeem');
        const [to, amount] = redeemEvent.args;

        expect(to).to.equal(acc2.address);
        expect(amount).to.equal(swapAmount);
        expect(await myTokenBsc.balanceOf(acc2.address)).to.equal(swapAmount);
        expect(await myTokenBsc.totalSupply()).to.equal(initialSupply.add(swapAmount));
    });

    it("Redeem - should revert when wrong signer", async function () {
        const messageToSign = ethers.utils.arrayify(
            ethers.utils.solidityKeccak256(["address", "address", "uint256", "uint256", "uint256"],
                [myTokenBsc.address, acc2.address, swapAmount, initialNonce, hardhatChainId])
        );
        const signature = await acc1.signMessage(messageToSign);
        const sig = ethers.utils.splitSignature(signature);
        await expect(
            bridgeBsc.connect(acc2).redeem(myTokenBsc.address, acc2.address, swapAmount, initialNonce, hardhatChainId, sig.v, sig.r, sig.s)
        ).to.be.revertedWith("Wrong signer");
    });

    it("Redeem - should revert with wrong chain id", async function () {
        const messageToSign = ethers.utils.arrayify(
            ethers.utils.solidityKeccak256(["address", "address", "uint256", "uint256", "uint256"],
                [myTokenBsc.address, acc2.address, swapAmount, initialNonce, bscTestNetChainId])
        );
        const signature = await acc1.signMessage(messageToSign);
        const sig = ethers.utils.splitSignature(signature);
        await expect(
            bridgeBsc.connect(acc2).redeem(myTokenBsc.address, acc2.address, swapAmount, initialNonce, bscTestNetChainId, sig.v, sig.r, sig.s)
        ).to.be.revertedWith("Wrong chain id");
    });


    it("IncludeToken - check only validator", async function () {
        await expect(
            bridgeEth.connect(acc1).includeToken(myTokenEth.address, myTokenBsc.address)
        ).to.be.revertedWith("Access denied");
    });

    it("ExcludeToken - check only validator", async function () {
        await expect(
            bridgeEth.connect(acc1).excludeToken(myTokenEth.address)
        ).to.be.revertedWith("Access denied");
    });

    it("UpdateChainById - check only validator", async function () {
        await expect(
            bridgeEth.connect(acc1).updateChainById(bscTestNetChainId, true)
        ).to.be.revertedWith("Access denied");
    });
});
