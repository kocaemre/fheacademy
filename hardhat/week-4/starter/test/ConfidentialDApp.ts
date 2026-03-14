import { expect } from "chai";
import { ethers } from "hardhat";

describe("ConfidentialDApp (Voting)", function () {
  it("should deploy with zero proposals", async function () {
    const Factory = await ethers.getContractFactory("ConfidentialDApp");
    const voting = await Factory.deploy();
    await voting.waitForDeployment();

    expect(await voting.proposalCount()).to.equal(0);
  });

  describe("Proposal Creation", function () {
    it("should allow owner to create proposals", async function () {
      // TODO: Deploy contract
      // TODO: Create a proposal
      // TODO: Verify proposal count and name
    });

    it("should prevent non-owner from creating proposals", async function () {
      // TODO: Deploy contract
      // TODO: Try to create proposal as non-owner (should revert)
    });
  });

  describe("Voting", function () {
    it("should allow casting an encrypted vote", async function () {
      // TODO: Deploy contract and create a proposal
      // TODO: Create encrypted input for vote value
      // TODO: Call castVote() with encrypted vote
      // TODO: Verify hasVoted returns true
    });

    it("should prevent double voting", async function () {
      // TODO: Deploy contract and create a proposal
      // TODO: Cast first vote
      // TODO: Try to cast second vote (should revert)
    });

    it("should accumulate votes correctly", async function () {
      // TODO: Deploy contract and create a proposal
      // TODO: Cast votes from multiple accounts
      // TODO: Get results and decrypt
      // TODO: Verify tally matches sum of votes
    });
  });

  describe("Results", function () {
    it("should return encrypted results for authorized caller", async function () {
      // TODO: Deploy contract and create a proposal
      // TODO: Cast some votes
      // TODO: Call getResults() as owner
      // TODO: Decrypt and verify the tally
    });
  });
});
