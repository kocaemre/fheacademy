# Week 1 - Lesson 1.5: Testing Your FHEVM Contract

## Learning Objective
Write comprehensive tests for FHEVM contracts using Hardhat test helpers, encrypted inputs, and decryption utilities.

---

## Testing in FHEVM vs Standard Solidity

Testing FHEVM contracts is different from testing standard Solidity because:

1. **You cannot read encrypted state directly** - you need decryption helpers
2. **You must create encrypted inputs** - you cannot just pass plain numbers
3. **Mock mode handles the encryption** - tests run fast without real FHE

The good news: the `hardhat-fhevm` plugin provides all the helpers you need.

---

## Test Setup

### Importing Test Helpers

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

describe("EncryptedCounter", function () {
  let counter: any;
  let owner: any;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const CounterFactory = await ethers.getContractFactory("EncryptedCounter");
    counter = await CounterFactory.deploy();
    await counter.waitForDeployment();
  });
});
```

This is standard Hardhat test setup. The `hardhat-fhevm` plugin automatically activates mock mode when you run tests.

---

## Creating Encrypted Inputs

In real usage, users encrypt values client-side with the Relayer SDK. In tests, the `hardhat-fhevm` plugin provides `createEncryptedInput()`:

```typescript
it("should add an encrypted value", async function () {
  // Create an encrypted input for the contract
  const input = await hre.fhevm.createEncryptedInput(
    await counter.getAddress(), // contract address
    owner.address               // sender address
  );

  // Add a uint32 value to encrypt
  input.addUint32(42);

  // Encrypt and get the result
  const encrypted = await input.encrypt();

  // Call the contract with encrypted value and proof
  await counter.add(encrypted.handles[0], encrypted.inputProof);
});
```

**Step by step:**
1. `createEncryptedInput(contractAddress, senderAddress)` - creates an input builder bound to a specific contract and sender
2. `input.addUint32(42)` - adds a plaintext value to be encrypted (use addUint8, addUint64, etc. for other types)
3. `input.encrypt()` - encrypts all added values and generates the proof
4. `encrypted.handles[0]` - the encrypted value handle (first added value)
5. `encrypted.inputProof` - the zero-knowledge proof

### Multiple Encrypted Inputs

You can encrypt multiple values in a single input:

```typescript
const input = await hre.fhevm.createEncryptedInput(contractAddress, sender);
input.addUint32(100);  // First value
input.addUint32(200);  // Second value
const encrypted = await input.encrypt();

// Use encrypted.handles[0] for first value (100)
// Use encrypted.handles[1] for second value (200)
// Both share the same encrypted.inputProof
```

---

## Decrypting Results in Tests

Since encrypted values cannot be read directly, tests need a way to verify results. The plugin provides `userDecryptEuint32()` and similar functions:

```typescript
it("should increment the counter", async function () {
  // Increment the counter
  await counter.increment();

  // Get the encrypted count handle
  const countHandle = await counter.getCount();

  // Decrypt it for verification
  const decryptedCount = await hre.fhevm.userDecryptEuint32(
    countHandle,
    owner.address  // must have ACL permission
  );

  // Verify the value
  expect(decryptedCount).to.equal(1);
});
```

**Important:** The address passed to `userDecryptEuint32()` must have been granted ACL permission via `FHE.allow()` in the contract. If the address does not have permission, decryption will fail.

### Decryption Functions by Type

| Type | Decryption Function |
|------|-------------------|
| `euint8` | `hre.fhevm.userDecryptEuint8(handle, address)` |
| `euint16` | `hre.fhevm.userDecryptEuint16(handle, address)` |
| `euint32` | `hre.fhevm.userDecryptEuint32(handle, address)` |
| `euint64` | `hre.fhevm.userDecryptEuint64(handle, address)` |
| `ebool` | `hre.fhevm.userDecryptEbool(handle, address)` |
| `eaddress` | `hre.fhevm.userDecryptEaddress(handle, address)` |

---

## Understanding Handles in Tests

A crucial concept: handles are NOT deterministic. This means:

```typescript
// WRONG - handles are not deterministic
const count1 = await counter.getCount();
await counter.increment();
const count2 = await counter.getCount();
expect(count2).to.not.equal(count1);  // This is NOT a meaningful comparison
```

Handles are opaque references. You cannot compare them directly. The only way to verify values is to decrypt them:

```typescript
// CORRECT - decrypt to compare values
const count1Handle = await counter.getCount();
const count1 = await hre.fhevm.userDecryptEuint32(count1Handle, owner.address);
expect(count1).to.equal(0);

await counter.increment();

const count2Handle = await counter.getCount();
const count2 = await hre.fhevm.userDecryptEuint32(count2Handle, owner.address);
expect(count2).to.equal(1);
```

---

## Complete Test Example

Here is a comprehensive test suite for the EncryptedCounter:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

describe("EncryptedCounter", function () {
  let counter: any;
  let owner: any;
  let otherUser: any;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();
    const CounterFactory = await ethers.getContractFactory("EncryptedCounter");
    counter = await CounterFactory.deploy();
    await counter.waitForDeployment();
  });

  describe("increment", function () {
    it("should start at zero", async function () {
      await counter.increment(); // Need at least one call to set ACL
      const handle = await counter.getCount();
      // After first increment, count should be 1
      const value = await hre.fhevm.userDecryptEuint32(handle, owner.address);
      expect(value).to.equal(1);
    });

    it("should increment by one each time", async function () {
      await counter.increment();
      await counter.increment();
      await counter.increment();

      const handle = await counter.getCount();
      const value = await hre.fhevm.userDecryptEuint32(handle, owner.address);
      expect(value).to.equal(3);
    });
  });

  describe("add", function () {
    it("should add an encrypted value", async function () {
      const input = await hre.fhevm.createEncryptedInput(
        await counter.getAddress(),
        owner.address
      );
      input.addUint32(42);
      const encrypted = await input.encrypt();

      await counter.add(encrypted.handles[0], encrypted.inputProof);

      const handle = await counter.getCount();
      const value = await hre.fhevm.userDecryptEuint32(handle, owner.address);
      expect(value).to.equal(42);
    });

    it("should accumulate multiple additions", async function () {
      // Add 10
      let input = await hre.fhevm.createEncryptedInput(
        await counter.getAddress(),
        owner.address
      );
      input.addUint32(10);
      let encrypted = await input.encrypt();
      await counter.add(encrypted.handles[0], encrypted.inputProof);

      // Add 20
      input = await hre.fhevm.createEncryptedInput(
        await counter.getAddress(),
        owner.address
      );
      input.addUint32(20);
      encrypted = await input.encrypt();
      await counter.add(encrypted.handles[0], encrypted.inputProof);

      const handle = await counter.getCount();
      const value = await hre.fhevm.userDecryptEuint32(handle, owner.address);
      expect(value).to.equal(30);
    });
  });

  describe("access control", function () {
    it("should allow the caller to decrypt", async function () {
      await counter.connect(owner).increment();
      const handle = await counter.getCount();

      // Owner should be able to decrypt
      const value = await hre.fhevm.userDecryptEuint32(handle, owner.address);
      expect(value).to.equal(1);
    });
  });
});
```

---

## Test Categories for FHEVM

When testing FHEVM contracts, cover these categories:

1. **Functional tests** - Does the core logic work correctly?
2. **ACL tests** - Can authorized users decrypt? Are unauthorized users blocked?
3. **Input validation tests** - Do encrypted inputs process correctly?
4. **Edge cases** - What happens with zero values, maximum values, uninitialized state?

---

## Key Takeaways

1. FHEVM tests use `createEncryptedInput()` to create encrypted values for contract calls
2. Use `userDecryptEuint32()` (and similar) to verify encrypted results in tests
3. Handles are non-deterministic - always decrypt to compare values
4. The decrypting address must have ACL permission granted by the contract
5. Mock mode runs automatically - tests execute instantly without real FHE
6. Test functional correctness, ACL permissions, input handling, and edge cases

---

## Quiz Questions

**Q1:** Why can you not compare handles directly in tests to check if a value changed?
**A:** Handles are non-deterministic - the same plaintext value encrypted at different times produces different handles. Comparing handles tells you nothing about the underlying values. You must decrypt handles using userDecryptEuint32() (or equivalent) to compare the actual plaintext values.

**Q2:** What must be true for userDecryptEuint32() to succeed in a test?
**A:** The address passed to the decryption function must have been granted ACL permission by the contract, typically via FHE.allow(value, address). Without this permission, the decryption will fail because the ACL system prevents unauthorized access to encrypted values.
