# Week 2 - Lesson 2.4: Access Control List (ACL) System

## Learning Objective
Master the FHEVM ACL system - the most critical and unique aspect of confidential smart contract development.

---

## Why ACL Exists

In standard Solidity, any state variable marked `public` can be read by anyone. In FHEVM, data is encrypted, so reading a value is meaningless without decryption permission. The ACL system controls who can:

1. **Use** an encrypted value in computations (contracts)
2. **Decrypt** an encrypted value (users)

Every ciphertext in the FHEVM coprocessor has its own ACL - a list of addresses allowed to interact with it. When a new ciphertext is created (through encryption, computation, or input), its ACL starts **empty**.

---

## The Three ACL Functions

### 1. FHE.allowThis() - Grant Contract Access

```solidity
FHE.allowThis(encryptedValue);
```

**What it does:** Adds the current contract's address to the value's ACL. This allows the contract to use the value in future transactions.

**When to use:** After EVERY state variable update. Every time you assign a new value to an encrypted state variable.

**Why it is critical:** Each FHE operation creates a NEW ciphertext with a NEW handle and a NEW (empty) ACL. If you do not call `FHE.allowThis()`, the contract cannot read its own state in the next transaction.

```solidity
// CORRECT pattern
balance = FHE.add(balance, amount);
FHE.allowThis(balance);  // Contract can use balance in next tx

// WRONG - contract loses access permanently
balance = FHE.add(balance, amount);
// Missing FHE.allowThis() → balance is permanently inaccessible
```

**There is no recovery.** If you forget `FHE.allowThis()`, the value is lost forever. The contract cannot re-grant itself permission because it cannot access the value to do so.

### 2. FHE.allow() - Grant Permanent Access

```solidity
FHE.allow(encryptedValue, targetAddress);
```

**What it does:** Permanently adds the target address to the value's ACL. The target can then request decryption of this value.

**When to use:** When you want a specific user to be able to decrypt a value. Commonly used to let users see their own balances.

```solidity
function getMyBalance() public view returns (euint64) {
    return balances[msg.sender];
}

// When updating a balance:
balances[msg.sender] = FHE.add(balances[msg.sender], amount);
FHE.allowThis(balances[msg.sender]);
FHE.allow(balances[msg.sender], msg.sender);  // User can decrypt their own balance
```

**Permission scope:** `FHE.allow()` grants permanent access. Once granted, it cannot be revoked. The address will always be able to decrypt this specific ciphertext handle.

### 3. FHE.allowTransient() - Grant Temporary Access

```solidity
FHE.allowTransient(encryptedValue, targetAddress);
```

**What it does:** Grants temporary access that lasts only for the current transaction. After the transaction completes, the permission is automatically removed.

**When to use:** When you need to share a value with another contract temporarily, such as during a cross-contract call within a single transaction.

```solidity
// Contract A calls Contract B, sharing a value temporarily
function interactWithContractB(address contractB) public {
    euint64 sharedValue = computeSomething();
    FHE.allowTransient(sharedValue, contractB);  // B can use it during this tx only
    IContractB(contractB).processValue(sharedValue);
}
```

**Key difference from FHE.allow():** Transient permissions expire after the transaction. This is more secure when you only need to share data briefly.

---

## ACL Flow Patterns

### Pattern 1: Simple State Update

Every time you modify an encrypted state variable:

```solidity
function increment() public {
    counter = FHE.add(counter, 1);
    FHE.allowThis(counter);        // Contract keeps access
    FHE.allow(counter, msg.sender); // Caller can decrypt
}
```

### Pattern 2: Token Transfer

The most important pattern - transferring encrypted tokens between users:

```solidity
function transfer(address to, externalEuint64 encAmount, bytes calldata proof) public {
    euint64 amount = FHE.fromExternal(encAmount, proof);

    // Check sufficient balance
    ebool hasEnough = FHE.ge(balances[msg.sender], amount);

    // Update sender balance (or keep unchanged if insufficient)
    balances[msg.sender] = FHE.select(
        hasEnough,
        FHE.sub(balances[msg.sender], amount),
        balances[msg.sender]
    );

    // Update receiver balance (or keep unchanged if insufficient)
    balances[to] = FHE.select(
        hasEnough,
        FHE.add(balances[to], amount),
        balances[to]
    );

    // ACL for sender's new balance
    FHE.allowThis(balances[msg.sender]);
    FHE.allow(balances[msg.sender], msg.sender);

    // ACL for receiver's new balance
    FHE.allowThis(balances[to]);
    FHE.allow(balances[to], to);
}
```

**Notice:** Both sender AND receiver get ACL permissions on their own balances. The sender can decrypt their balance but NOT the receiver's balance.

### Pattern 3: Multi-Party Access

Sometimes multiple parties need access to the same value:

```solidity
function createSharedValue(address partner) public {
    euint64 value = FHE.asEuint64(100);
    sharedData = value;

    FHE.allowThis(sharedData);           // Contract access
    FHE.allow(sharedData, msg.sender);   // Creator access
    FHE.allow(sharedData, partner);      // Partner access
}
```

### Pattern 4: Method Chaining (v0.9)

FHEVM v0.9 supports method chaining for cleaner code:

```solidity
// Instead of:
balance = FHE.add(balance, amount);
FHE.allowThis(balance);
FHE.allow(balance, msg.sender);

// You can write:
balance = FHE.add(balance, amount);
balance.allowThis().allow(msg.sender);
```

---

## Common ACL Mistakes

### Mistake 1: Forgetting FHE.allowThis() (Most Dangerous)

```solidity
// FATAL ERROR - contract permanently loses access
balance = FHE.sub(balance, amount);
// Missing FHE.allowThis(balance);
// Next transaction: contract cannot read 'balance'
```

**Prevention:** Make it a habit - every time you see `=` with an encrypted type, add `FHE.allowThis()` on the next line.

### Mistake 2: Setting ACL on Intermediate Values

```solidity
// WRONG - ACL on temporary value, not the state variable
euint64 newBalance = FHE.add(balance, amount);
FHE.allowThis(newBalance);  // This ACL is on newBalance, not balance
// But balance still points to old handle with old ACL!

// CORRECT - ACL on the state variable after assignment
balance = FHE.add(balance, amount);
FHE.allowThis(balance);  // ACL on the stored state variable
```

### Mistake 3: Forgetting Receiver ACL in Transfers

```solidity
// WRONG - receiver cannot decrypt their new balance
balances[to] = FHE.add(balances[to], amount);
FHE.allowThis(balances[to]);
// Missing: FHE.allow(balances[to], to);

// CORRECT
balances[to] = FHE.add(balances[to], amount);
FHE.allowThis(balances[to]);
FHE.allow(balances[to], to);  // Receiver can decrypt
```

### Mistake 4: Granting Unnecessary Permissions

```solidity
// BAD PRACTICE - giving everyone access to all balances
FHE.allow(balances[user], someOtherUser);  // Why does someOtherUser need this?

// GOOD PRACTICE - only grant to the balance owner
FHE.allow(balances[user], user);  // Only user sees their own balance
```

---

## ACL Security Principles

1. **Principle of Least Privilege:** Only grant ACL permissions to addresses that genuinely need them.

2. **Always allowThis:** After every state mutation, call `FHE.allowThis()`. No exceptions.

3. **User-Only Decryption:** Users should only decrypt their own data. Do not grant cross-user decryption permissions unless explicitly required.

4. **Transient for Cross-Contract:** When sharing values between contracts within a transaction, use `FHE.allowTransient()` instead of `FHE.allow()` to minimize permission exposure.

5. **Immutable Permissions:** Once `FHE.allow()` is called, the permission cannot be revoked. Be thoughtful about who receives permanent access.

---

## Key Takeaways

1. Every new ciphertext starts with an empty ACL - you must explicitly grant permissions
2. FHE.allowThis() grants the contract access to its own state - MANDATORY after every update
3. FHE.allow() grants permanent decryption access to a specific address
4. FHE.allowTransient() grants temporary access lasting only the current transaction
5. Forgetting FHE.allowThis() permanently loses the value - there is no recovery
6. In transfers, both sender and receiver need ACL on their respective balances
7. Follow the Principle of Least Privilege - only grant necessary permissions

---

## Quiz Questions

**Q1:** What happens if you forget to call FHE.allowThis() after updating an encrypted state variable?
**A:** The contract permanently loses access to that value. Since each FHE operation creates a new ciphertext with an empty ACL, without FHE.allowThis() the contract cannot read or use the value in any future transaction. This loss is irrecoverable because the contract cannot re-grant itself permission to a value it cannot access.

**Q2:** What is the difference between FHE.allow() and FHE.allowTransient()?
**A:** FHE.allow() grants permanent, irrevocable access to an address for a specific ciphertext. FHE.allowTransient() grants temporary access that automatically expires after the current transaction ends. Use allowTransient for cross-contract calls within a single transaction, and allow for granting users long-term decryption access to their own data.

**Q3:** In a token transfer, why must you set ACL for both the sender and receiver?
**A:** Both the sender's and receiver's balances are updated during a transfer, creating new ciphertext handles with empty ACLs. The sender needs FHE.allow() on their new balance to decrypt it. The receiver needs FHE.allow() on their new balance to decrypt theirs. FHE.allowThis() is needed for both so the contract can use both balances in future transactions.
