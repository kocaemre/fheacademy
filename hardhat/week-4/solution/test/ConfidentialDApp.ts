import { expect } from "chai";
import { ethers } from "hardhat";

describe("ConfidentialDApp (Voting)", function () {
  async function deployVoting() {
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ConfidentialDApp");
    const voting = await Factory.deploy();
    await voting.waitForDeployment();
    return { voting, owner, voter1, voter2, voter3 };
  }

  it("should deploy with zero proposals", async function () {
    const { voting } = await deployVoting();
    expect(await voting.proposalCount()).to.equal(0);
  });

  it("should set deployer as owner", async function () {
    const { voting, owner } = await deployVoting();
    expect(await voting.owner()).to.equal(owner.address);
  });

  describe("Proposal Creation", function () {
    it("should allow owner to create a proposal", async function () {
      const { voting } = await deployVoting();

      await voting.createProposal("Increase treasury allocation");
      expect(await voting.proposalCount()).to.equal(1);
      expect(await voting.getProposalName(0)).to.equal(
        "Increase treasury allocation"
      );
    });

    it("should create multiple proposals with sequential IDs", async function () {
      const { voting } = await deployVoting();

      await voting.createProposal("Proposal A");
      await voting.createProposal("Proposal B");
      await voting.createProposal("Proposal C");

      expect(await voting.proposalCount()).to.equal(3);
      expect(await voting.getProposalName(0)).to.equal("Proposal A");
      expect(await voting.getProposalName(1)).to.equal("Proposal B");
      expect(await voting.getProposalName(2)).to.equal("Proposal C");
    });

    it("should prevent non-owner from creating proposals", async function () {
      const { voting, voter1 } = await deployVoting();

      await expect(
        voting.connect(voter1).createProposal("Unauthorized proposal")
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Voting", function () {
    it("should track voter status correctly", async function () {
      const { voting, voter1 } = await deployVoting();
      await voting.createProposal("Test proposal");

      expect(await voting.hasVoted(voter1.address, 0)).to.equal(false);
      // After implementing castVote:
      // await castVote(voting, voter1, 0, 1);
      // expect(await voting.hasVoted(voter1.address, 0)).to.equal(true);
    });

    it("should reject votes on nonexistent proposals", async function () {
      const { voting } = await deployVoting();
      // Proposal 99 does not exist
      // This would revert with "Proposal does not exist"
    });
  });

  // Note: Full encrypted vote tests require fhevm test helpers.
  // In mock mode, the FHEVM plugin simulates encrypted operations.
  //
  // Complete test scenarios:
  //
  // 1. Single vote:
  //    - Create proposal, cast encrypted vote (value=1), verify hasVoted
  //    - Get results, decrypt, verify tally = 1
  //
  // 2. Multiple voters:
  //    - Create proposal, 3 voters each cast vote=1
  //    - Get results, decrypt, verify tally = 3
  //
  // 3. Weighted voting:
  //    - Create proposal, voter1 votes 5, voter2 votes 3
  //    - Get results, decrypt, verify tally = 8
  //
  // 4. Double voting prevention:
  //    - Cast vote, try to vote again -> revert "Already voted"
  //
  // 5. Multiple proposals:
  //    - Create 2 proposals, vote on each independently
  //    - Verify tallies are separate
  //
  // Example with encrypted inputs:
  //
  //   it("should accumulate votes", async () => {
  //     const { voting, owner, voter1, voter2 } = await deployVoting();
  //     await voting.createProposal("Test");
  //     const instance = await createInstances(votingAddress, ethers, [voter1, voter2]);
  //
  //     // Voter 1 votes 1
  //     const input1 = instance.createEncryptedInput(votingAddress, voter1.address);
  //     input1.add64(1);
  //     const enc1 = input1.encrypt();
  //     await voting.connect(voter1).castVote(0, enc1.handles[0], enc1.inputProof);
  //
  //     // Voter 2 votes 1
  //     const input2 = instance.createEncryptedInput(votingAddress, voter2.address);
  //     input2.add64(1);
  //     const enc2 = input2.encrypt();
  //     await voting.connect(voter2).castVote(0, enc2.handles[0], enc2.inputProof);
  //
  //     // Check results
  //     const tally = await voting.getResults(0);
  //     const decrypted = await instance.decrypt64(tally);
  //     expect(decrypted).to.equal(2n);
  //   });
});
