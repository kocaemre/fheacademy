# Week 2 - Lesson 2.2: Operations on Encrypted Data

## Learning Objective
Master all FHE operations available in FHEVM, understand the critical paradigm shift from if/else to FHE.select, and learn operation constraints.

---

## The Complete FHE Operations Reference

FHEVM provides a comprehensive set of operations that work directly on encrypted data. These operations are the building blocks of all confidential smart contract logic.

---

## Arithmetic Operations

### Addition and Subtraction

```solidity
euint32 result = FHE.add(a, b);  // a + b (encrypted + encrypted)
euint32 result = FHE.add(a, 5);  // a + 5 (encrypted + plaintext, cheaper!)
euint32 result = FHE.sub(a, b);  // a - b
euint32 result = FHE.sub(a, 3);  // a - 3
```

**Important:** Operations with a plaintext operand are cheaper than operations with two encrypted operands. When one operand is a known constant, always use the plaintext form.

### Multiplication

```solidity
euint32 result = FHE.mul(a, b);  // a * b
euint32 result = FHE.mul(a, 9);  // a * 9 (cheaper with plaintext)
```

**Warning:** Multiplication is one of the most expensive FHE operations. Use it sparingly and prefer plaintext operands when possible.

### Division and Remainder

```solidity
euint32 result = FHE.div(a, 5);  // a / 5 (PLAINTEXT divisor only!)
euint32 result = FHE.rem(a, 5);  // a % 5 (PLAINTEXT divisor only!)
```

**Critical constraint:** Division and remainder ONLY support plaintext divisors. You CANNOT divide by an encrypted value. This is a fundamental limitation of the current FHE scheme.

```solidity
// WRONG - will not compile!
euint32 result = FHE.div(a, b);  // ERROR: b must be plaintext

// CORRECT
euint32 result = FHE.div(a, 5);  // OK: 5 is plaintext
```

If your application logic requires dividing by a variable, you must restructure the algorithm. For example, instead of `a / b`, you might compute `a * (1/b)` if `b` is known beforehand, or redesign the logic entirely.

### Min and Max

```solidity
euint32 result = FHE.min(a, b);  // Returns the smaller of a and b
euint32 result = FHE.max(a, b);  // Returns the larger of a and b
euint32 result = FHE.min(a, 100); // Clamp: ensure a <= 100
euint32 result = FHE.max(a, 1);   // Ensure a >= 1
```

### Negation

```solidity
euint32 result = FHE.neg(a);  // Two's complement negation
```

---

## Comparison Operations

All comparison operations return `ebool` (encrypted boolean), not a regular `bool`. This is fundamental - you cannot know the result of a comparison without decrypting it.

```solidity
ebool isEqual = FHE.eq(a, b);      // a == b
ebool isNotEqual = FHE.ne(a, b);   // a != b
ebool isLess = FHE.lt(a, b);       // a < b
ebool isLessOrEq = FHE.le(a, b);   // a <= b
ebool isGreater = FHE.gt(a, b);    // a > b
ebool isGreaterOrEq = FHE.ge(a, b); // a >= b
```

Comparisons also work with plaintext:
```solidity
ebool isZero = FHE.eq(a, 0);     // Check if a equals 0
ebool isAdult = FHE.ge(age, 18); // Check if age >= 18
```

---

## Bitwise Operations

```solidity
euint32 result = FHE.and(a, b);    // Bitwise AND
euint32 result = FHE.or(a, b);     // Bitwise OR
euint32 result = FHE.xor(a, b);    // Bitwise XOR
euint32 result = FHE.not(a);       // Bitwise NOT

euint32 result = FHE.shl(a, 2);    // Shift left by 2
euint32 result = FHE.shr(a, 3);    // Shift right by 3
euint32 result = FHE.rotl(a, 4);   // Rotate left by 4
euint32 result = FHE.rotr(a, 1);   // Rotate right by 1
```

Bitwise operations are useful for:
- Efficient multiplication/division by powers of 2 (shift)
- Flag manipulation
- Custom hashing or mixing

---

## The Critical Paradigm Shift: FHE.select

This is the single most important concept in FHEVM development. In standard Solidity, you use if/else for conditional logic:

```solidity
// Standard Solidity - THIS DOES NOT WORK WITH ENCRYPTED CONDITIONS
if (balance >= amount) {
    balance -= amount;
} else {
    revert("Insufficient funds");
}
```

**Why this fails with FHE:** The condition `balance >= amount` returns an `ebool` - an encrypted boolean. The EVM cannot branch on an encrypted value because it does not know whether it is true or false. The whole point of FHE is that the data stays encrypted!

### The Solution: FHE.select

`FHE.select` is the encrypted equivalent of a ternary operator (condition ? a : b):

```solidity
euint32 result = FHE.select(condition, valueIfTrue, valueIfFalse);
```

**Critical insight:** Both branches are ALWAYS computed. There is no short-circuit evaluation. The system computes both results and then selects one based on the encrypted condition - without ever knowing which one was selected.

### Example: Safe Transfer

```solidity
// Standard Solidity
function transfer(address to, uint256 amount) public {
    require(balance[msg.sender] >= amount, "Insufficient");
    balance[msg.sender] -= amount;
    balance[to] += amount;
}

// FHEVM equivalent
function transfer(address to, externalEuint64 encAmount, bytes calldata proof) public {
    euint64 amount = FHE.fromExternal(encAmount, proof);
    ebool hasEnough = FHE.ge(balances[msg.sender], amount);

    // If has enough: new balance = old balance - amount
    // If not enough: new balance stays the same (transfer fails silently)
    balances[msg.sender] = FHE.select(
        hasEnough,
        FHE.sub(balances[msg.sender], amount),
        balances[msg.sender]  // unchanged if insufficient
    );

    balances[to] = FHE.select(
        hasEnough,
        FHE.add(balances[to], amount),
        balances[to]  // unchanged if insufficient
    );

    // Set ACL for both
    FHE.allowThis(balances[msg.sender]);
    FHE.allow(balances[msg.sender], msg.sender);
    FHE.allowThis(balances[to]);
    FHE.allow(balances[to], to);
}
```

### Why No Revert?

Notice that the FHEVM version does not revert on insufficient balance. It cannot! A revert would leak information - an observer could determine that the sender did not have enough balance. Instead, the transfer silently "fails" by keeping balances unchanged.

This is a fundamental design pattern in FHE: **operations always succeed, but may have no effect when conditions are not met.**

### Chaining FHE.select

For multiple conditions, chain FHE.select calls:

```solidity
// If a > 100: result = "high"
// Else if a > 50: result = "medium"
// Else: result = "low"

ebool isHigh = FHE.gt(a, 100);
ebool isMedium = FHE.gt(a, 50);

euint8 result = FHE.select(
    isHigh,
    FHE.asEuint8(3),  // high
    FHE.select(
        isMedium,
        FHE.asEuint8(2),  // medium
        FHE.asEuint8(1)   // low
    )
);
```

---

## Operations Summary Table

| Category | Operations | Notes |
|----------|-----------|-------|
| Arithmetic | add, sub, mul, neg | Both operands can be encrypted |
| Division | div, rem | Divisor MUST be plaintext |
| Comparison | eq, ne, lt, le, gt, ge | Returns ebool |
| Min/Max | min, max | Works with mixed types |
| Bitwise | and, or, xor, not | Standard bitwise ops |
| Shift/Rotate | shl, shr, rotl, rotr | Shift amount is plaintext |
| Conditional | select | Encrypted ternary (both branches computed) |

---

## Key Takeaways

1. FHEVM provides complete arithmetic, comparison, bitwise, and conditional operations
2. Division and remainder ONLY support plaintext divisors - a fundamental constraint
3. Comparisons return ebool (encrypted boolean), not regular bool
4. FHE.select replaces if/else for encrypted conditions - both branches always execute
5. Operations never revert based on encrypted conditions - this would leak information
6. Plaintext operands are cheaper than encrypted operands - use them when possible
7. Both branches of FHE.select are always computed - design accordingly

---

## Quiz Questions

**Q1:** Why can you not use if/else statements with encrypted conditions in FHEVM?
**A:** Because the condition is an encrypted boolean (ebool) - the EVM cannot evaluate it without decrypting. FHE's purpose is to keep data encrypted during computation. Instead, you use FHE.select(condition, valueIfTrue, valueIfFalse) which computes both branches and selects the result without revealing the condition.

**Q2:** Why does FHE.div only accept plaintext divisors?
**A:** This is a fundamental limitation of the current TFHE scheme. Division by an encrypted value is not efficiently computable in the current FHE cryptographic framework. If division by a variable is needed, developers must restructure their algorithm or find alternative approaches.

**Q3:** Why does a confidential transfer not revert when the sender has insufficient balance?
**A:** Reverting would leak information - an observer could determine that the sender did not have enough balance. In FHE, operations always succeed but may have no effect. FHE.select ensures the balance stays unchanged when funds are insufficient, preserving privacy about the sender's balance level.
