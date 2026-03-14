import { expect } from "chai";
import { ethers } from "hardhat";

describe("ConfidentialERC20", function () {
  it("should deploy with name and symbol", async function () {
    const Factory = await ethers.getContractFactory("ConfidentialERC20");
    const token = await Factory.deploy("Confidential Token", "CFHE");
    await token.waitForDeployment();

    expect(await token.name()).to.equal("Confidential Token");
    expect(await token.symbol()).to.equal("CFHE");
    expect(await token.decimals()).to.equal(18);
  });

  it("should set deployer as owner", async function () {
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ConfidentialERC20");
    const token = await Factory.deploy("Confidential Token", "CFHE");
    await token.waitForDeployment();

    expect(await token.owner()).to.equal(owner.address);
  });

  // Note: Full encrypted operation tests require fhevm test helpers.
  // In mock mode, the FHEVM plugin simulates encrypted operations.
  //
  // Complete test scenarios to verify:
  //
  // 1. Minting:
  //    - Owner can mint encrypted tokens to any address
  //    - Non-owner cannot mint (reverts)
  //    - Multiple mints accumulate correctly
  //
  // 2. Transfer:
  //    - Transfer with sufficient balance succeeds
  //    - Transfer exceeding balance results in 0 transfer (overflow protection)
  //    - Sender balance decreases, recipient balance increases
  //
  // 3. Approve + TransferFrom:
  //    - Owner approves spender with encrypted amount
  //    - Spender can transferFrom within allowance
  //    - TransferFrom exceeding allowance results in 0 transfer
  //    - Allowance decreases after transferFrom
  //
  // 4. Edge cases:
  //    - Transfer to self
  //    - Zero amount transfer
  //    - Multiple approvals (last one wins)
  //
  // Example test with encrypted inputs:
  //
  //   it("should mint tokens", async () => {
  //     const [owner, recipient] = await ethers.getSigners();
  //     const token = await deploy();
  //     const instance = await createInstances(tokenAddress, ethers, [owner]);
  //
  //     const input = instance.createEncryptedInput(tokenAddress, owner.address);
  //     input.add64(1000);
  //     const enc = input.encrypt();
  //
  //     await token.mint(recipient.address, enc.handles[0], enc.inputProof);
  //
  //     const balance = await token.balanceOf(recipient.address);
  //     const decrypted = await instance.decrypt64(balance);
  //     expect(decrypted).to.equal(1000n);
  //   });
});
