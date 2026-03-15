# Week 4 - Lesson 4.2: Security Best Practices

## Learning Objective
Identify FHEVM-specific vulnerabilities and apply a comprehensive security audit checklist to confidential smart contracts.

---

## FHEVM-Specific Security Landscape

Standard Solidity security (reentrancy, integer overflow, access control) still applies to FHEVM contracts. But FHE introduces an entirely new category of vulnerabilities related to encrypted data handling, information leakage, and access control.

---

## The 6-Point Security Audit Checklist

### 1. ACL on EVERY State Change

The most common and most dangerous vulnerability: forgetting `FHE.allowThis()`.

**Vulnerability:** If a state variable is updated without setting ACL, the contract permanently loses access to that value. There is no recovery.

**Audit rule:** For every line that assigns to an encrypted state variable (`stateVar = ...`), verify that `FHE.allowThis(stateVar)` follows immediately.

```solidity
// AUDIT: Every assignment to encrypted state must be followed by allowThis
balance = FHE.add(balance, amount);
FHE.allowThis(balance);        // ✓ Present
FHE.allow(balance, msg.sender); // ✓ User can decrypt
```

### 2. Overflow Protection with FHE.select

**Vulnerability:** FHE arithmetic does not automatically revert on overflow/underflow like Solidity 0.8+. Values silently wrap around.

**Audit rule:** Every subtraction should check that the minuend is greater than or equal to the subtrahend. Every addition should check the result does not exceed maximum values.

```solidity
// SECURE: Overflow protection
ebool hasEnough = FHE.ge(balance, amount);
balance = FHE.select(hasEnough, FHE.sub(balance, amount), balance);
```

### 3. FHE.isInitialized() Checks

**Vulnerability:** Operating on uninitialized encrypted variables can produce undefined behavior.

**Audit rule:** Before the first operation on any encrypted state variable, check `FHE.isInitialized()`.

```solidity
if (!FHE.isInitialized(counter)) {
    counter = FHE.asEuint32(0);
    FHE.allowThis(counter);
}
```

### 4. Proper Encrypted Input Validation

**Vulnerability:** Accepting encrypted inputs without proof validation allows replay attacks and forged data.

**Audit rule:** Every function accepting encrypted inputs must use `FHE.fromExternal()` with a valid proof.

```solidity
// SECURE
function deposit(externalEuint64 amount, bytes calldata proof) public {
    euint64 value = FHE.fromExternal(amount, proof); // Validates proof
}
```

### 5. Secure Decryption with FHE.checkSignatures()

**Vulnerability:** Accepting decrypted values without verification allows users to submit fake cleartext values.

**Audit rule:** When processing self-relayed decryption results, always verify with `FHE.checkSignatures()`.

```solidity
function processDecryption(uint64 clearValue, bytes calldata sig) public {
    FHE.checkSignatures(encryptedHandle, clearValue, sig); // Verify!
    // Now clearValue is trustworthy
}
```

### 6. No Sensitive Data in Events or Revert Strings

**Vulnerability:** Events and revert messages are publicly visible. Including encrypted handles or information derived from encrypted values leaks data.

**Audit rule:** Events should only contain addresses and timestamps, never encrypted values or data derived from encrypted computation.

```solidity
// VULNERABLE - leaks information
event TransferFailed(address from, string reason); // "Insufficient balance" reveals info

// SECURE - no information about the encrypted state
event TransferAttempted(address indexed from, address indexed to);
```

---

## Side-Channel Attacks

Even with FHE, information can leak through side channels:

### Transaction Pattern Analysis

**Attack:** An observer watches when a user transacts, how often, and with whom. Even though amounts are encrypted, the pattern of transactions reveals behavior.

**Mitigation:** Consider adding dummy transactions or batching multiple operations into single transactions.

### Gas Usage Analysis

**Attack:** Different branches of FHE.select might have different gas costs. While both branches always execute, the types and number of operations might differ.

**Mitigation:** Ensure both branches of FHE.select have similar computational complexity.

### Timing Analysis

**Attack:** The time it takes for FHE operations to complete might vary based on the encrypted values (though TFHE is designed to be constant-time).

**Mitigation:** TFHE operations are designed to be constant-time, but be aware of this concern in custom implementations.

### State Change Observation

**Attack:** Even without seeing values, observing which storage slots change can reveal information about contract logic flow.

**Mitigation:** Consider updating all relevant state variables in every transaction, even if some values do not actually change (using FHE.select to keep them the same).

---

## Re-encryption Attack Vectors

**Scenario:** A user obtains the encrypted handle of someone else's balance, then tries to use it in their own transaction.

**Protection:** The ACL system prevents this. Even if an attacker has the handle, they cannot:
- Decrypt it (no ACL permission)
- Use it in computations (no ACL permission)
- Submit it as their own input (ZKPoK binds to contract and sender)

**Remaining risk:** If a contract accidentally grants too-broad ACL permissions (e.g., allowing any address), the protection breaks down. Follow the Principle of Least Privilege.

---

## Complete Security Audit Procedure

For every FHEVM contract, walk through this procedure:

1. **Map all encrypted state variables** - list every `euintXX` and `ebool` in the contract
2. **Trace every assignment** - for each state variable, find every line that assigns to it
3. **Verify ACL** - after each assignment, confirm `FHE.allowThis()` is called
4. **Check overflow protection** - every `FHE.sub()` should have a `FHE.ge()` guard
5. **Verify input validation** - every external input uses `FHE.fromExternal()`
6. **Review events** - no encrypted data or derived information in events
7. **Review revert strings** - no information about encrypted state in error messages
8. **Check initialization** - `FHE.isInitialized()` before first operations
9. **Review ACL scope** - no over-permissive `FHE.allow()` calls
10. **Assess side channels** - transaction patterns, gas differences, state changes

---

## Key Takeaways

1. FHEVM introduces unique vulnerabilities beyond standard Solidity security concerns
2. The 6-point checklist covers: ACL, overflow, initialization, inputs, decryption, events
3. Side channels (timing, gas, patterns) can leak information even with perfect encryption
4. The ACL system is the primary defense - follow Principle of Least Privilege
5. Every encrypted state assignment needs FHE.allowThis() - audit this exhaustively
6. Never include encrypted data or derived information in events or revert strings

---

## Quiz Questions

**Q1:** Why is it a security vulnerability to include information about encrypted conditions in revert messages?
**A:** Revert messages are publicly visible on-chain. If a revert says "Insufficient balance," an observer learns that the sender's encrypted balance was below the encrypted amount. This leaks information about the encrypted state, violating the privacy guarantees that FHE provides. Instead, operations should silently succeed with no effect using FHE.select.

**Q2:** How can transaction patterns leak information even when all values are encrypted?
**A:** An observer can analyze who transacts with whom, how frequently, and at what times. Even without seeing amounts, patterns reveal relationships, activity levels, and behavioral information. For example, if a user always transacts after a price oracle update, an observer might infer trading strategies. Mitigations include dummy transactions and batching.
