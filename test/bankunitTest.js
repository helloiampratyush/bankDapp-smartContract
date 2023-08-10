const { assert, expect } = require("chai");
const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhatConfig");
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("bankdpp", function () {
      let deployer, testContract;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        testContract = await ethers.getContract("bankdpp", deployer);
      });
      describe("deposite", function () {
        it("it will save user amount in mapped ", async function () {
          const ethAmount = ethers.utils.parseEther("2");
          const f1 = await testContract.deposite({ value: ethAmount });
          const amountSaved = await testContract.yourTotalAmountInBank();
          assert.equal(amountSaved.toString(), "2000000000000000000");
        });
      });
      describe("withdraw", function () {
        let accounts, ethAmount;
        beforeEach(async function () {
          ethAmount = ethers.utils.parseEther("2");
          const f1 = await testContract.deposite({ value: ethAmount });
          accounts = await ethers.getSigners();
        });
        it("it will reject your call if you havent deposite", async function () {
          const anotherAccountConnectedContract = await testContract.connect(
            accounts[1]
          );
          await expect(
            anotherAccountConnectedContract.withdraw(ethAmount)
          ).to.be.revertedWith("bankdpp__notEnoughSavings");
        });
        it("it will revert your payment if you call more than you deposited", async function () {
          const ethAmount1 = ethers.utils.parseEther("3");
          //const calledWithdraw = await testContract.withdraw(ethAmount1);
          await expect(testContract.withdraw(ethAmount1)).to.be.revertedWith(
            "bankdpp__invalidRequest"
          );
        });
        it("it will successfully complete your withdraw request if you have deposited enough and you are not passong any invalid request", async function () {
          const correctWithdrawCalled = await testContract.withdraw(ethAmount);
          const savings = await testContract.yourTotalAmountInBank();
          assert.equal(savings.toString(), "0");
        });
        it("it will show correct total fund present on contract", async function () {
          const getTotalFund = await testContract.totalBalanceOfBank();
          assert.equal(ethAmount, "2000000000000000000");
        });
      });
      describe("provideFeedback", function () {
        it("it will ragister your feedback that you will provide", async function () {
          const f1 =
            "hello bro it's not working properly you should use foundry instead of hardhat";
          const feedbackgiving = await testContract.ProvideFeedBack(f1);
          const responseStore = await testContract.givenFeedbackResponse();
          assert.equal(f1, responseStore.toString());
        });
        it("only owner can read the feedback of another user", async function () {
          const accounts = await ethers.getSigners();
          const user1connectedContract = await testContract.connect(
            accounts[1]
          );
          const f1 = "burst dapp";
          const feedbackgiving = await user1connectedContract.ProvideFeedBack(
            f1
          );
          const userAddress = accounts[1].address;
          const tryToCheckUserFeedback = await testContract.peopleResponses(
            userAddress
          );
          assert.equal(f1, tryToCheckUserFeedback.toString());
          console.log(
            "we are trying to check if another guy can also read or get error"
          );
          //here we are connecting another user
          const user2connectedContracts = await testContract.connect(
            accounts[2]
          );

          await expect(
            user1connectedContract.peopleResponses(userAddress)
          ).to.be.revertedWith("bankdpp__onlyOwner");
        });
      });
    });
