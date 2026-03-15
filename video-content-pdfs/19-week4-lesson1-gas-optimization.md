# Week 4 - Lesson 4.1: Gas Optimization for FHE

## Learning Objective
Understand the gas cost structure of FHE operations and learn strategies to minimize gas consumption in confidential smart contracts.

---

## Why Gas Optimization Matters in FHEVM

FHE operations are significantly more expensive than standard EVM operations. A single FHE addition can cost as much as deploying a small contract in standard Solidity. This makes gas optimization not just a nice-to-have, but an absolute necessity for practical FHEVM applications.

---

## Gas Cost Hierarchy by Type

The cost of FHE operations scales with the bit width of the encrypted type:

```
ebool   → Cheapest
euint8  → Low
euint16 → Moderate
euint32 → Medium
euint64 → High
euint128 → Very High
euint256 → Most Expensive
```

The relationship is roughly exponential. An operation on `euint256` can cost 10-50 times more gas than the same operation on `euint8`.

### Concrete Example

Suppose an FHE addition on `euint8` costs X gas:
- `euint16` addition: approximately 2X
- `euint32` addition: approximately 4X
- `euint64` addition: approximately 8X
- `euint128` addition: approximately 20X
- `euint256` addition: approximately 50X

These are approximate ratios - actual costs depend on the network and operation type.

---

## Gas Cost Hierarchy by Operation

Not all FHE operations cost the same, even for the same type:

```
Cheapest:  NOT, AND, OR, XOR (bitwise)
Low:       ADD, SUB
Medium:    EQ, NE, LT, LE, GT, GE (comparisons)
High:      MUL
Highest:   DIV, REM
Very High: SELECT (computes both branches)
```

---

## 5 Optimization Strategies

### Strategy 1: Use Plaintext Operands Whenever Possible

When one operand is a known constant, use the plaintext form:

```solidity
// EXPENSIVE - encrypts the constant first
euint32 one = FHE.asEuint32(1);
count = FHE.add(count, one);

// CHEAPER - uses plaintext operand directly
count = FHE.add(count, 1);
```

The FHE library handles the mixed encrypted-plaintext operation internally, and it is cheaper because it avoids creating and managing an additional ciphertext.

**Apply everywhere:** addition, subtraction, multiplication, comparison, min, max all support plaintext operands.

### Strategy 2: Use the Smallest Type That Fits

This is the single most impactful optimization. Review every encrypted variable and ask: "What is the maximum value this will ever hold?"

```solidity
// WASTEFUL - using 256 bits for a percentage
euint256 percentage;  // Can only be 0-100

// OPTIMAL - using 8 bits (max 255)
euint8 percentage;  // Perfect for 0-100 range
```

**Checklist:**
- Percentages (0-100) → `euint8`
- Small counters (0-1000) → `euint16`
- Token balances → `euint64` (handles most DeFi scenarios)
- Only use `euint256` when absolutely necessary (rare!)

### Strategy 3: Minimize FHE Operations Per Transaction

Each FHE operation has significant cost. Reduce the number of operations by:

**Combining operations:**
```solidity
// BEFORE: 3 operations
euint32 step1 = FHE.mul(value, 9);
euint32 step2 = FHE.div(step1, 5);
euint32 step3 = FHE.add(step2, 32);

// This is already optimal - you cannot reduce these 3 operations further
// But think about whether you need all of them
```

**Avoiding redundant computation:**
```solidity
// WASTEFUL - computing the comparison twice
ebool check1 = FHE.gt(balance, amount);
// ... some code ...
ebool check2 = FHE.gt(balance, amount);  // Same comparison again!

// OPTIMAL - compute once, reuse
ebool hasEnough = FHE.gt(balance, amount);
// Use hasEnough everywhere
```

### Strategy 4: Batch Operations

If multiple state updates share the same condition, compute the condition once:

```solidity
// ONE comparison, used for multiple updates
ebool hasEnough = FHE.ge(balances[from], amount);

balances[from] = FHE.select(hasEnough, FHE.sub(balances[from], amount), balances[from]);
balances[to] = FHE.select(hasEnough, FHE.add(balances[to], amount), balances[to]);
```

Instead of:
```solidity
// WASTEFUL - computing the same comparison twice
ebool check1 = FHE.ge(balances[from], amount);
balances[from] = FHE.select(check1, ...);

ebool check2 = FHE.ge(balances[from], amount);  // Redundant!
balances[to] = FHE.select(check2, ...);
```

### Strategy 5: Avoid Unnecessary Re-encryption

Do not convert plaintext values to encrypted types unless needed:

```solidity
// WASTEFUL
euint32 zero = FHE.asEuint32(0);
euint32 result = FHE.add(balance, zero);  // Adding encrypted zero!

// OPTIMAL - don't add zero
// Just use balance directly
```

---

## Gas Optimization Checklist

Before deploying, review your contract with this checklist:

1. Are all encrypted types the smallest possible for their value range?
2. Are constant operands passed as plaintext (not encrypted)?
3. Are there any duplicate FHE operations that can be eliminated?
4. Can any FHE operations be replaced with standard operations?
5. Is FHE.select used efficiently (one condition, multiple updates)?
6. Are there unnecessary type conversions (FHE.asEuintXX)?
7. Are bitwise shifts used instead of multiply/divide by powers of 2?

---

## Key Takeaways

1. FHE operations cost 10-1000x more gas than standard EVM operations
2. Gas scales exponentially with type size - euint8 is dramatically cheaper than euint256
3. Plaintext operands are cheaper than encrypted operands
4. Minimize the number of FHE operations per transaction
5. Compute conditions once and reuse for multiple FHE.select calls
6. These optimizations compound - applying all five strategies can reduce gas by 90%+

---

## Quiz Questions

**Q1:** Why is FHE.add(balance, 1) cheaper than FHE.add(balance, FHE.asEuint32(1))?
**A:** The plaintext form avoids creating and managing an additional ciphertext. When using FHE.asEuint32(1), the system must first encrypt the value 1 into a full ciphertext, then perform encrypted-encrypted addition. With the plaintext form, the FHE library handles the mixed operation more efficiently internally.

**Q2:** If a token contract only needs to track balances up to 1 million tokens with 2 decimal places, what encrypted type should be used and why?
**A:** euint32 would be sufficient (max value ~4.29 billion, which accommodates 1,000,000.00 represented as 100,000,000). Using euint32 instead of euint64 or euint256 saves significant gas on every operation. However, if the contract might handle larger amounts in the future, euint64 provides a safety margin while still being much cheaper than euint256.
