import { expect } from "chai";
import { ethers } from "hardhat";

describe("FHETemperatureConverter", function () {
  it("should deploy successfully", async function () {
    const Factory = await ethers.getContractFactory("FHETemperatureConverter");
    const converter = await Factory.deploy();
    await converter.waitForDeployment();

    const address = await converter.getAddress();
    expect(address).to.be.properAddress;
  });

  // Note: Full encrypted input tests require fhevm test helpers.
  // In mock mode, the FHEVM plugin simulates encrypted operations.
  //
  // To run a complete test with encrypted inputs:
  //
  // 1. Import test helpers:
  //    import { createInstances } from "fhevm/test";
  //
  // 2. Create encrypted input:
  //    const instance = await createInstances(contractAddress, ethers, signers);
  //    const input = instance.createEncryptedInput(contractAddress, signerAddress);
  //    input.add32(100); // 100°C
  //    const encryptedInput = input.encrypt();
  //
  // 3. Call the contract:
  //    await converter.convert(encryptedInput.handles[0], encryptedInput.inputProof);
  //
  // 4. Verify via reencryption:
  //    const celsiusHandle = await converter.getLastCelsius();
  //    const decrypted = await instance.decrypt32(celsiusHandle);
  //    expect(decrypted).to.equal(100);
});
