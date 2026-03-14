import { expect } from "chai";
import { ethers } from "hardhat";

describe("TemperatureConverter", function () {
  it("should convert 100°C to 212°F", async function () {
    const Factory = await ethers.getContractFactory("TemperatureConverter");
    const converter = await Factory.deploy();
    await converter.waitForDeployment();

    await converter.convert(100);

    const [celsius, fahrenheit] = await converter.getLastConversion();
    expect(celsius).to.equal(100);
    expect(fahrenheit).to.equal(212);
  });

  it("should convert 0°C to 32°F", async function () {
    const Factory = await ethers.getContractFactory("TemperatureConverter");
    const converter = await Factory.deploy();
    await converter.waitForDeployment();

    await converter.convert(0);

    const [celsius, fahrenheit] = await converter.getLastConversion();
    expect(celsius).to.equal(0);
    expect(fahrenheit).to.equal(32);
  });

  // TODO: After migrating to FHEVM, update these tests:
  // 1. Use createInstances() from fhevm/test helpers
  // 2. Create encrypted inputs with instance.createEncryptedInput()
  // 3. Verify results via reencryption instead of direct reads
  // Example:
  //   const instance = await createInstances(contractAddress, ethers, signers);
  //   const input = instance.createEncryptedInput(contractAddress, signerAddress);
  //   input.add32(100);
  //   const encryptedInput = input.encrypt();
  //   await converter.convert(encryptedInput.handles[0], encryptedInput.inputProof);
});
