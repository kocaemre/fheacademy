import { expect } from "chai";
import { ethers } from "hardhat";

describe("SealedBidAuction", function () {
  it("should deploy with Open state and correct duration", async function () {
    const Factory = await ethers.getContractFactory("SealedBidAuction");
    const auction = await Factory.deploy(3600); // 1 hour
    await auction.waitForDeployment();

    expect(await auction.state()).to.equal(0); // Open
    expect(await auction.bidCount()).to.equal(0);
  });

  it("should set deployer as owner", async function () {
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SealedBidAuction");
    const auction = await Factory.deploy(3600);
    await auction.waitForDeployment();

    expect(await auction.owner()).to.equal(owner.address);
  });

  it("should allow owner to close the auction", async function () {
    const Factory = await ethers.getContractFactory("SealedBidAuction");
    const auction = await Factory.deploy(3600);
    await auction.waitForDeployment();

    await auction.closeAuction();
    expect(await auction.state()).to.equal(1); // Closed
  });

  it("should prevent non-owner from closing", async function () {
    const [, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SealedBidAuction");
    const auction = await Factory.deploy(3600);
    await auction.waitForDeployment();

    await expect(auction.connect(other).closeAuction()).to.be.revertedWith(
      "Not owner"
    );
  });

  // Note: Full encrypted bid tests require fhevm test helpers.
  // In mock mode, the FHEVM plugin simulates encrypted operations.
  //
  // Complete test scenarios to verify:
  //
  // 1. Bid placement:
  //    - User can place an encrypted bid
  //    - Double bidding is prevented
  //    - Bid count increases
  //
  // 2. Bid comparison:
  //    - Higher bid updates highestBid
  //    - Lower bid does not update highestBid
  //
  // 3. Auction lifecycle:
  //    - Open -> placeBid works, closeAuction works
  //    - Closed -> placeBid fails, revealWinner works
  //    - Revealed -> markRevealed transitions state
  //
  // Example test with encrypted inputs:
  //
  //   it("should accept encrypted bids", async () => {
  //     const [owner, bidder1, bidder2] = await ethers.getSigners();
  //     const auction = await deploy(3600);
  //     const instance = await createInstances(auctionAddress, ethers, [bidder1, bidder2]);
  //
  //     // Bidder 1 bids 100
  //     const input1 = instance.createEncryptedInput(auctionAddress, bidder1.address);
  //     input1.add64(100);
  //     const enc1 = input1.encrypt();
  //     await auction.connect(bidder1).placeBid(enc1.handles[0], enc1.inputProof);
  //
  //     // Bidder 2 bids 200
  //     const input2 = instance.createEncryptedInput(auctionAddress, bidder2.address);
  //     input2.add64(200);
  //     const enc2 = input2.encrypt();
  //     await auction.connect(bidder2).placeBid(enc2.handles[0], enc2.inputProof);
  //
  //     // Close and reveal
  //     await auction.closeAuction();
  //     const highestBid = await auction.revealWinner();
  //     const decrypted = await instance.decrypt64(highestBid);
  //     expect(decrypted).to.equal(200n);
  //   });
});
