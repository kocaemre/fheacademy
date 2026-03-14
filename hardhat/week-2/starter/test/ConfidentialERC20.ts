import { expect } from "chai";
import { ethers } from "hardhat";

describe("ConfidentialERC20", function () {
  it("should deploy with name and symbol", async function () {
    const Factory = await ethers.getContractFactory("ConfidentialERC20");
    const token = await Factory.deploy("Confidential Token", "CFHE");
    await token.waitForDeployment();

    expect(await token.name()).to.equal("Confidential Token");
    expect(await token.symbol()).to.equal("CFHE");
  });

  // TODO: After implementing the contract, add these tests:

  describe("Minting", function () {
    it("should allow owner to mint encrypted tokens", async function () {
      // TODO: Deploy contract
      // TODO: Create encrypted input for mint amount
      // TODO: Call mint() with encrypted amount
      // TODO: Verify balance via reencryption
    });
  });

  describe("Transfer", function () {
    it("should transfer encrypted tokens between accounts", async function () {
      // TODO: Deploy and mint tokens to sender
      // TODO: Create encrypted input for transfer amount
      // TODO: Call transfer()
      // TODO: Verify sender balance decreased
      // TODO: Verify recipient balance increased
    });

    it("should handle insufficient balance gracefully", async function () {
      // TODO: Deploy and mint small amount
      // TODO: Try to transfer more than balance
      // TODO: Verify transfer amount is 0 (overflow protection)
    });
  });

  describe("Approve and TransferFrom", function () {
    it("should approve and transferFrom encrypted tokens", async function () {
      // TODO: Deploy and mint tokens
      // TODO: Approve spender with encrypted amount
      // TODO: Call transferFrom as spender
      // TODO: Verify balances updated correctly
    });
  });
});
