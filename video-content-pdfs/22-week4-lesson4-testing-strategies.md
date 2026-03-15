# Week 4 - Lesson 4.4: Testing Strategies for FHEVM

## Learning Objective
Implement comprehensive testing strategies covering functional, permission, edge case, and integration tests for confidential smart contracts.

---

## The Four Test Categories

FHEVM contracts require more thorough testing than standard Solidity because encrypted computation introduces unique failure modes that are harder to detect.

---

## Category 1: Functional Tests

Verify that core business logic works correctly with encrypted data.

```typescript
describe("Functional Tests", () => {
    it("should correctly add encrypted values", async () => {
        // Setup: encrypt value 42
        const input = await hre.fhevm.createEncryptedInput(contractAddr, user.address);
        input.addUint32(42);
        const encrypted = await input.encrypt();

        // Act: call the add function
        await contract.add(encrypted.handles[0], encrypted.inputProof);

        // Verify: decrypt and check result
        const handle = await contract.getCount();
        const result = await hre.fhevm.userDecryptEuint32(handle, user.address);
        expect(result).to.equal(42);
    });

    it("should correctly handle transfer with sufficient balance", async () => {
        // Mint 1000 tokens to sender
        // Transfer 300 to receiver
        // Verify sender has 700, receiver has 300
    });

    it("should handle transfer with insufficient balance", async () => {
        // Mint 100 tokens to sender
        // Attempt to transfer 500
        // Verify sender still has 100 (transfer silently failed)
        // Verify receiver still has 0
    });
});
```

**Key principle:** Test both the "happy path" and the "failed path." In FHEVM, failed operations do not revert - they silently keep values unchanged. You must verify this behavior.

---

## Category 2: Permission (ACL) Tests

Verify that access control works correctly - authorized users can decrypt, unauthorized users cannot.

```typescript
describe("Permission Tests", () => {
    it("should allow owner to decrypt their balance", async () => {
        // Mint tokens to user
        const handle = await contract.balanceOf(user.address);
        const balance = await hre.fhevm.userDecryptEuint64(handle, user.address);
        expect(balance).to.be.greaterThan(0);
    });

    it("should block unauthorized decryption", async () => {
        // Mint tokens to user1
        const handle = await contract.balanceOf(user1.address);

        // user2 should NOT be able to decrypt user1's balance
        await expect(
            hre.fhevm.userDecryptEuint64(handle, user2.address)
        ).to.be.rejected;
    });

    it("should update ACL after transfer", async () => {
        // Transfer from user1 to user2
        // Verify user1 can decrypt their NEW balance
        // Verify user2 can decrypt their NEW balance
        // Verify user1 CANNOT decrypt user2's balance
    });
});
```

**Key principle:** Test both positive (authorized access works) and negative (unauthorized access fails) cases.

---

## Category 3: Edge Case Tests

Test boundary conditions and unusual scenarios unique to FHEVM.

```typescript
describe("Edge Case Tests", () => {
    it("should handle zero-value operations", async () => {
        // Add encrypted 0 to counter
        // Verify counter did not change
    });

    it("should handle maximum value", async () => {
        // For euint8: add 255
        // Try adding 1 more - should handle overflow gracefully
    });

    it("should handle uninitialized state", async () => {
        // Call a function that reads state before any writes
        // Verify it handles uninitialized handles correctly
    });

    it("should handle double-initialization", async () => {
        // Call initialize-like function twice
        // Verify it handles gracefully
    });

    it("should handle operations on fresh contract", async () => {
        // Deploy contract
        // Immediately try to read encrypted state
        // Verify behavior is correct
    });
});
```

**Key principle:** FHEVM edge cases include uninitialized handles, overflow on smaller types, zero-value operations, and repeated operations.

---

## Category 4: Integration Tests

Test multi-user, multi-transaction, and cross-function scenarios.

```typescript
describe("Integration Tests", () => {
    it("should handle multiple users interacting", async () => {
        // User1 mints tokens
        // User2 mints tokens
        // User1 transfers to User2
        // User2 transfers back to User1
        // Verify both balances are correct
    });

    it("should handle rapid sequential transactions", async () => {
        // Increment counter 10 times in sequence
        // Verify final count is 10
    });

    it("should handle approval and transferFrom flow", async () => {
        // User1 approves User2 for 500 tokens
        // User2 calls transferFrom to move 300 of User1's tokens
        // Verify all three balances/allowances are correct
    });

    it("should handle auction lifecycle", async () => {
        // User1 places bid of 100
        // User2 places bid of 200
        // User3 places bid of 150
        // End auction
        // Verify User2 wins
        // Verify losing bids are still encrypted
    });
});
```

**Key principle:** Integration tests verify that multiple operations compose correctly and that state is maintained properly across transactions.

---

## FHEVM-Specific Testing Patterns

### Pattern: Verify Unchanged State on Failed Operations

```typescript
it("should not change balance on failed transfer", async () => {
    // Get initial balances
    const senderBefore = await decrypt(contract.balanceOf(sender.address), sender);
    const receiverBefore = await decrypt(contract.balanceOf(receiver.address), receiver);

    // Attempt transfer larger than balance
    await transferEncrypted(sender, receiver, senderBefore + 100);

    // Verify nothing changed
    const senderAfter = await decrypt(contract.balanceOf(sender.address), sender);
    const receiverAfter = await decrypt(contract.balanceOf(receiver.address), receiver);

    expect(senderAfter).to.equal(senderBefore);
    expect(receiverAfter).to.equal(receiverBefore);
});
```

### Pattern: Verify ACL Isolation Between Users

```typescript
it("should maintain ACL isolation", async () => {
    // Setup: 3 users with different balances
    // Verify: each user can ONLY decrypt their own balance
    // Verify: no user can decrypt any other user's balance
});
```

---

## CI/CD Integration

Set up automated testing with GitHub Actions:

```yaml
name: FHEVM Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx hardhat compile
      - run: npx hardhat test
```

Mock mode runs automatically in CI - no special configuration needed.

---

## Key Takeaways

1. Four test categories: functional, permission, edge case, integration
2. FHEVM tests must verify both successful and "silently failed" operations
3. ACL tests should cover both authorized access and unauthorized rejection
4. Edge cases include uninitialized handles, overflow, and zero values
5. Integration tests verify multi-user, multi-transaction correctness
6. CI/CD works seamlessly with mock mode - no FHE infrastructure needed

---

## Quiz Questions

**Q1:** Why is it important to test that failed operations leave state unchanged in FHEVM?
**A:** Because FHEVM operations never revert based on encrypted conditions - they silently succeed with no effect. If a transfer fails due to insufficient balance, both balances should remain unchanged. Without testing this, a bug could silently corrupt state (e.g., deducting from sender without adding to receiver), and the lack of reverts means you would not notice until much later.

**Q2:** What makes ACL testing uniquely important in FHEVM compared to standard Solidity?
**A:** In standard Solidity, access control failures typically result in reverts that are easy to detect. In FHEVM, improper ACL can cause permanent data loss (forgetting FHE.allowThis()) or unauthorized data exposure (over-permissive FHE.allow()). ACL tests must verify both that authorized users can decrypt AND that unauthorized users are blocked, since these failures are silent and potentially irreversible.
