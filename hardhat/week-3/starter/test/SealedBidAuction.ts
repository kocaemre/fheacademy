import { expect } from "chai";
import { ethers } from "hardhat";

describe("SealedBidAuction", function () {
  it("should deploy with Open state", async function () {
    const Factory = await ethers.getContractFactory("SealedBidAuction");
    const auction = await Factory.deploy(3600); // 1 hour duration
    await auction.waitForDeployment();

    expect(await auction.state()).to.equal(0); // AuctionState.Open
  });

  it("should set deployer as owner", async function () {
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SealedBidAuction");
    const auction = await Factory.deploy(3600);
    await auction.waitForDeployment();

    expect(await auction.owner()).to.equal(owner.address);
  });

  describe("Bidding", function () {
    it("should allow placing an encrypted bid", async function () {
      // TODO: Deploy auction
      // TODO: Create encrypted input for bid amount
      // TODO: Call placeBid() with encrypted amount
      // TODO: Verify hasBid[msg.sender] is true
    });

    it("should prevent double bidding", async function () {
      // TODO: Deploy auction
      // TODO: Place first bid
      // TODO: Try to place second bid (should revert)
    });
  });

  describe("Auction Lifecycle", function () {
    it("should allow owner to close auction", async function () {
      // TODO: Deploy auction
      // TODO: Close auction
      // TODO: Verify state is Closed (1)
    });

    it("should prevent non-owner from closing", async function () {
      // TODO: Deploy auction
      // TODO: Try to close as non-owner (should revert)
    });
  });

  describe("Winner Reveal", function () {
    it("should reveal winner after auction closes", async function () {
      // TODO: Deploy auction
      // TODO: Place bids from multiple accounts
      // TODO: Close auction
      // TODO: Call revealWinner()
      // TODO: Decrypt and verify the highest bid
    });
  });
});
