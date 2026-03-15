# Week 2 - Lesson 2.5: Patterns and Best Practices

## Learning Objective
Learn defensive programming patterns for FHEVM, including overflow protection, initialization checks, and safe transfer templates.

---

## Defensive Programming in FHEVM

FHEVM smart contracts require extra defensive patterns compared to standard Solidity. You cannot rely on reverts to handle errors (they leak information), and encrypted values have unique pitfalls.

---

## Pattern 1: Overflow and Underflow Protection

In standard Solidity 0.8+, arithmetic automatically reverts on overflow. In FHEVM, you CANNOT use reverts based on encrypted conditions (it leaks information). Instead, use FHE.select to create safe operations.

### Safe Subtraction (Prevent Underflow)

```solidity
function safeSubtract(euint64 a, euint64 b) internal returns (euint64) {
    ebool isValid = FHE.ge(a, b);  // a >= b?
    return FHE.select(isValid, FHE.sub(a, b), a);  // If valid: a-b, else: keep a
}
```

If `a < b`, the subtraction would underflow. Instead, we keep `a` unchanged. The caller has no way to know whether the subtraction happened or not, preserving privacy.

### Safe Addition (Prevent Overflow)

```solidity
function safeAdd(euint64 a, euint64 b, uint64 maxValue) internal returns (euint64) {
    euint64 sum = FHE.add(a, b);
    ebool isValid = FHE.le(sum, maxValue);  // sum <= maxValue?
    return FHE.select(isValid, sum, a);  // If valid: sum, else: keep a
}
```

### Safe Transfer Pattern

Combining overflow protection with transfer logic:

```solidity
function transfer(address to, externalEuint64 encAmount, bytes calldata proof) public {
    euint64 amount = FHE.fromExternal(encAmount, proof);

    // Check sender has enough
    ebool hasEnough = FHE.ge(balances[msg.sender], amount);

    // Conditional update: only if sender has enough
    balances[msg.sender] = FHE.select(
        hasEnough,
        FHE.sub(balances[msg.sender], amount),
        balances[msg.sender]
    );

    balances[to] = FHE.select(
        hasEnough,
        FHE.add(balances[to], amount),
        balances[to]
    );

    // Always set ACL regardless of whether transfer succeeded
    FHE.allowThis(balances[msg.sender]);
    FHE.allow(balances[msg.sender], msg.sender);
    FHE.allowThis(balances[to]);
    FHE.allow(balances[to], to);
}
```

---

## Pattern 2: FHE.isInitialized() Checks

Encrypted state variables start as uninitialized (zero handles). Performing operations on uninitialized values can cause unexpected behavior.

```solidity
function increment() public {
    if (!FHE.isInitialized(counter)) {
        counter = FHE.asEuint32(0);  // Initialize to encrypted zero
    }
    counter = FHE.add(counter, 1);
    FHE.allowThis(counter);
}
```

**When to check:** Before the FIRST operation on any encrypted state variable that might not have been set yet.

**Important:** `FHE.isInitialized()` is NOT an encrypted operation - it checks whether a handle exists, not whether it contains a specific value. This check is safe and does not leak information because it only reveals whether the variable has ever been assigned, not its value.

---

## Pattern 3: Safe Comparison with Clamping

Clamping ensures values stay within acceptable ranges:

```solidity
// Ensure value is between min and max
function clamp(euint32 value, uint32 minVal, uint32 maxVal) internal returns (euint32) {
    euint32 clamped = FHE.max(value, minVal);  // Ensure >= min
    clamped = FHE.min(clamped, maxVal);          // Ensure <= max
    return clamped;
}
```

---

## The 5 Defensive Programming Rules

### Rule 1: Check Initialization
Before operating on encrypted state, check if it has been initialized.

```solidity
if (!FHE.isInitialized(myValue)) {
    myValue = FHE.asEuint32(defaultValue);
    FHE.allowThis(myValue);
}
```

### Rule 2: Use FHE.select for All Conditionals
Never branch on encrypted conditions. Always use FHE.select.

```solidity
// NEVER: if (FHE.gt(a, b)) { ... }
// ALWAYS: result = FHE.select(FHE.gt(a, b), trueValue, falseValue);
```

### Rule 3: Set ACL After Every Change
After every encrypted state variable mutation, call FHE.allowThis() and FHE.allow() for relevant addresses.

```solidity
stateVar = FHE.add(stateVar, value);
FHE.allowThis(stateVar);
FHE.allow(stateVar, msg.sender);
```

### Rule 4: Use the Smallest Type That Fits
Smaller types mean cheaper operations. Use euint8 for small values, euint64 for token balances.

### Rule 5: Minimize FHE Operations Per Transaction
Each FHE operation has significant gas cost. Optimize by:
- Using plaintext operands when possible
- Avoiding redundant computations
- Batching operations efficiently
- Pre-computing values that do not change

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Leaking Information Through Reverts

```solidity
// WRONG - revert leaks balance information
ebool hasEnough = FHE.ge(balance, amount);
// Cannot use: require(hasEnough, "Not enough")
// Because hasEnough is encrypted!
```

### Anti-Pattern 2: Leaking Through Events

```solidity
// WRONG - event reveals encrypted value
event Transfer(address from, address to, euint64 amount);
// The handle in the event is useless and the existence of the event
// combined with other information might leak data

// BETTER - emit without the encrypted amount
event Transfer(address indexed from, address indexed to);
```

### Anti-Pattern 3: Leaking Through Gas Usage

```solidity
// POTENTIALLY LEAKY - different gas usage reveals which branch
if (somePublicCondition) {
    // expensive FHE operation
} else {
    // cheap operation
}
// Gas difference reveals which branch executed
```

### Anti-Pattern 4: Unnecessary Re-encryption

```solidity
// WASTEFUL - re-encrypting unchanged value
euint32 a = FHE.asEuint32(5);
euint32 b = FHE.asEuint32(5);  // Same value, different handle, wasted gas
```

---

## Key Takeaways

1. Use FHE.select for overflow/underflow protection instead of reverts
2. Check FHE.isInitialized() before first operations on state variables
3. Follow the 5 rules: initialize, use select, set ACL, use small types, minimize ops
4. Never leak information through reverts, events, or gas usage patterns
5. The safe transfer pattern is the foundation for all encrypted token operations
6. Both branches of FHE.select always execute - design logic accordingly

---

## Quiz Questions

**Q1:** Why can you not use require() or revert() for validating encrypted conditions?
**A:** Because reverting based on an encrypted condition leaks information. If an observer sees a transaction revert, they learn something about the encrypted values (e.g., that the balance was insufficient). In FHE, operations must always succeed but may have no effect, preserving privacy. Use FHE.select to conditionally apply or skip operations.

**Q2:** What is the purpose of FHE.isInitialized() and is it safe to use?
**A:** FHE.isInitialized() checks whether an encrypted state variable has been assigned a handle (i.e., has ever been set). It is safe because it only reveals whether the variable has been initialized, not its value. It should be used before the first operation on state variables to prevent unexpected behavior from operating on uninitialized zero handles.
