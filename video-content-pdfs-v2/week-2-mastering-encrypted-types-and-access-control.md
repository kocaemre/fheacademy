# Week 2: Mastering Encrypted Types and Access Control

## Introduction

Welcome to Week 2 of FHE Academy. This week takes you deep into the FHEVM type system, all available operations, encrypted inputs with zero-knowledge proofs, and the critical ACL system. You will master the fundamental building blocks needed to create any confidential smart contract. By the end, you will build a complete confidential ERC-20 token with encrypted balances. Estimated time: 10-12 hours.

---

## Lesson 2.1 - The Complete FHEVM Type System

### Core Encrypted Types

FHEVM provides encrypted equivalents for Solidity integer types plus special types:

ebool for encrypted booleans, 1 bit. Used for flags, conditions, yes or no states.
euint8 for 8-bit encrypted integers. Used for small counters, percentages, scores.
euint16 for 16-bit. Used for medium counters, small amounts.
euint32 for 32-bit. Used for timestamps, moderate amounts.
euint64 for 64-bit. Used for token balances, large amounts.
euint128 for 128-bit. Used for very large numbers.
euint256 for 256-bit. Used for maximum range, full EVM word.
eaddress for encrypted Ethereum addresses, 160 bits.

Each type has an external input variant for function parameters: externalEbool, externalEuint8 through externalEuint256, externalEaddress. External types are converted to internal types using FHE.fromExternal().

Note: ebytes types (ebytes64, ebytes128, ebytes256) were removed in FHEVM v0.7 and are no longer available.

### The Golden Rule: Use the Smallest Type That Fits

Gas costs scale roughly exponentially with type size. An operation on euint256 can cost 10 to 50 times more than the same operation on euint8. This is the single most impactful optimization you can make.

Practical guidance: Percentages (0-100) should use euint8. Small counters (0-1000) should use euint16. Token balances should use euint64. Only use euint256 when absolutely necessary, which is rare.

### Type Casting

Upcasting from smaller to larger types is always safe. An encrypted 42 as euint8 becomes an encrypted 42 as euint32. Use FHE.asEuint32(smallValue).

Downcasting from larger to smaller types silently truncates. An euint32 holding 300 cast to euint8 becomes 44, which is 300 mod 256. There is no error, no revert, no warning. Only downcast when you are certain the value fits.

You can also convert plaintext to encrypted: FHE.asEuint32(5) encrypts the plaintext value 5.

---

## Lesson 2.2 - Operations on Encrypted Data

### Arithmetic Operations

FHE.add(a, b) for addition. FHE.sub(a, b) for subtraction. FHE.mul(a, b) for multiplication. FHE.neg(a) for negation. FHE.min(a, b) and FHE.max(a, b) for minimum and maximum.

Operations with a plaintext operand are cheaper than two encrypted operands. FHE.add(count, 1) is cheaper than FHE.add(count, FHE.asEuint32(1)). Always use plaintext operands when one side is a known constant.

### Division Constraint

FHE.div(a, 5) and FHE.rem(a, 5) only support PLAINTEXT divisors. You CANNOT divide by an encrypted value. FHE.div(a, b) where b is encrypted will not compile. This is a fundamental limitation of the current FHE scheme. If your logic requires dividing by a variable, you must restructure the algorithm.

### Comparison Operations

All comparisons return ebool, which is an encrypted boolean, not a regular bool.

FHE.eq(a, b) for equality. FHE.ne(a, b) for not equal. FHE.lt(a, b) for less than. FHE.le(a, b) for less or equal. FHE.gt(a, b) for greater than. FHE.ge(a, b) for greater or equal.

Comparisons also work with plaintext: FHE.eq(a, 0) checks if a equals zero.

### Bitwise Operations

FHE.and, FHE.or, FHE.xor, FHE.not for bitwise logic. FHE.shl, FHE.shr for shifts. FHE.rotl, FHE.rotr for rotations.

### The Critical Paradigm Shift: FHE.select

This is the single most important concept in FHEVM. In standard Solidity you use if/else for conditional logic. This does NOT work with encrypted conditions.

Why? Because the condition FHE.gt(balance, amount) returns an ebool, an encrypted boolean. The EVM cannot branch on an encrypted value because it does not know whether it is true or false. The whole point of FHE is that data stays encrypted.

The solution is FHE.select:

```solidity
euint32 result = FHE.select(condition, valueIfTrue, valueIfFalse);
```

Both branches are ALWAYS computed. There is no short-circuit evaluation. The system computes both results and selects one based on the encrypted condition without ever knowing which was selected.

This means operations never revert based on encrypted conditions. They always succeed but may have no effect. A transfer with insufficient balance does not revert. It silently keeps balances unchanged. Reverting would leak information, telling observers the balance was too low.

Example safe transfer:
```solidity
ebool hasEnough = FHE.ge(balances[msg.sender], amount);
balances[msg.sender] = FHE.select(hasEnough, FHE.sub(balances[msg.sender], amount), balances[msg.sender]);
balances[to] = FHE.select(hasEnough, FHE.add(balances[to], amount), balances[to]);
```

For nested conditions, chain FHE.select calls:
```solidity
euint32 price = FHE.select(FHE.gt(qty, 100), FHE.asEuint32(5),
    FHE.select(FHE.gt(qty, 50), FHE.asEuint32(8), FHE.asEuint32(10)));
```

---

## Lesson 2.3 - Encrypted Inputs and Zero-Knowledge Proofs

### The 4-Stage Encrypted Input Lifecycle

**Stage 1: Client-Side Encryption.** The user's browser encrypts the value using the Relayer SDK before it touches the blockchain. The SDK takes the plaintext, encrypts it with the network's FHE public key, and generates a zero-knowledge proof.

**Stage 2: Zero-Knowledge Proof Generation.** The ZKPoK (Zero-Knowledge Proof of Knowledge) guarantees three things. First, the user actually knows the plaintext value. Second, the ciphertext is bound to a specific contract address and cannot be replayed against a different contract. Third, the ciphertext is bound to the sender's address and nobody else can submit it.

Without the proof, an attacker could copy your encrypted bid and submit it to an auction, take encrypted values from one contract to another, or submit random data that is not valid encryption.

**Stage 3: On-Chain Submission.** The user sends a regular Ethereum transaction with the encrypted value as externalEuintXX and the proof as bytes calldata. The transaction data is visible on-chain but the encrypted value is computationally indistinguishable from random data.

**Stage 4: On-Chain Validation.** FHE.fromExternal(encryptedValue, proof) validates the proof, checks binding to contract and sender, registers the ciphertext with the coprocessor, and returns a usable handle.

Multiple values can share a single proof. On the client side, you add multiple values to one createEncryptedInput call. Each value gets its own handle but they share encrypted.inputProof. This is more efficient than separate proofs.

---

## Lesson 2.4 - The Access Control List System

The ACL system is the most critical and unique aspect of FHEVM. Every ciphertext has an ACL controlling who can use or decrypt it. New ciphertexts start with EMPTY ACLs.

### FHE.allowThis(): Grant Contract Access

```solidity
FHE.allowThis(encryptedValue);
```

Adds the current contract's address to the value's ACL. This allows the contract to use the value in future transactions. Must be called after EVERY state variable update.

Why it is critical: each FHE operation creates a NEW ciphertext with a NEW handle and a NEW empty ACL. Without allowThis, the contract cannot read its own state in the next transaction. This loss is permanent and irrecoverable. There is no recovery mechanism.

### FHE.allow(): Grant Permanent Access

```solidity
FHE.allow(encryptedValue, targetAddress);
```

Permanently adds the target address to the value's ACL. The target can then request decryption. Commonly used to let users see their own balances. Once granted, it cannot be revoked.

### FHE.allowTransient(): Grant Temporary Access

```solidity
FHE.allowTransient(encryptedValue, targetAddress);
```

Grants temporary access lasting only the current transaction. Used for cross-contract calls within a single transaction. More secure than permanent access when sharing data briefly.

### Token Transfer ACL Pattern

This is the most important pattern. During a transfer, both sender and receiver balances change, creating new handles with empty ACLs:

```solidity
// Update balances
balances[msg.sender] = FHE.select(hasEnough, FHE.sub(balances[msg.sender], amount), balances[msg.sender]);
balances[to] = FHE.select(hasEnough, FHE.add(balances[to], amount), balances[to]);

// ACL for sender
FHE.allowThis(balances[msg.sender]);
FHE.allow(balances[msg.sender], msg.sender);

// ACL for receiver
FHE.allowThis(balances[to]);
FHE.allow(balances[to], to);
```

Both users get ACL on their OWN balance only. The sender cannot decrypt the receiver's balance.

### Common ACL Mistakes

Forgetting FHE.allowThis() is the most dangerous. It permanently locks the value. Setting ACL on intermediate values instead of the state variable after assignment. Forgetting receiver ACL in transfers so the receiver cannot see their new balance. Granting unnecessary permissions, violating the Principle of Least Privilege.

---

## Lesson 2.5 - Defensive Programming Patterns

### Overflow Protection with FHE.select

FHE arithmetic does not automatically revert on overflow like Solidity 0.8+. Use FHE.select to guard:

```solidity
// Safe subtraction
ebool isValid = FHE.ge(a, b);
result = FHE.select(isValid, FHE.sub(a, b), a);

// Safe addition with maximum
euint64 sum = FHE.add(a, b);
ebool withinLimit = FHE.le(sum, maxValue);
result = FHE.select(withinLimit, sum, a);
```

### FHE.isInitialized() Checks

Before the first operation on any encrypted state variable, check if it has been set:

```solidity
if (!FHE.isInitialized(counter)) {
    counter = FHE.asEuint32(0);
    FHE.allowThis(counter);
}
```

This is not an encrypted operation. It checks whether a handle exists, not its value. It is safe and does not leak information.

### The 5 Defensive Programming Rules

Rule 1: Check initialization before first operations.
Rule 2: Use FHE.select for all conditionals. Never branch on encrypted conditions.
Rule 3: Set ACL after every state change. No exceptions.
Rule 4: Use the smallest type that fits for gas efficiency.
Rule 5: Minimize FHE operations per transaction for cost savings.

### Anti-Patterns to Avoid

Never leak information through reverts. A revert on "insufficient balance" tells observers the balance was too low. Never include encrypted data or derived information in events. Never create gas usage differences between FHE.select branches that could reveal which path was taken.

---

## Week 2 Homework: Confidential ERC-20 Token

Build a complete ERC-20 token with encrypted balances.

Core functions: mint with encrypted amount, transfer with encrypted amount, approve with encrypted allowance, transferFrom using encrypted allowance, balanceOf returning encrypted handle.

Use euint64 for all balances and amounts. Implement overflow protection using FHE.select. Set proper ACL so only the token owner can decrypt their own balance. Both sender and receiver must have ACL on their balances after transfers. Handle uninitialized balances with FHE.isInitialized().

Test requirements: minting, transferring, balance verification via decryption, approval and transferFrom flow, insufficient balance handling that should not revert but should keep balances unchanged.

Grading: ERC-20 Interface 15%, Encrypted Balances 25%, ACL Permissions 25%, Overflow Protection 15%, Tests 20%. Passing score: 70%.

---

## Week 2 Key Takeaways

1. FHEVM provides 8 encrypted types. Gas costs scale exponentially with type size. Always use the smallest type that fits.
2. Division only supports plaintext divisors. This is a fundamental FHE limitation.
3. FHE.select replaces if/else. Both branches always execute. Operations never revert based on encrypted conditions.
4. Zero-knowledge proofs on encrypted inputs prevent replay attacks by binding to contract and sender.
5. Every new ciphertext starts with an empty ACL. FHE.allowThis() is mandatory after every state update.
6. FHE.allow() grants permanent access. FHE.allowTransient() grants temporary single-transaction access.
7. Forgetting FHE.allowThis() causes permanent, irrecoverable data loss.
8. Defensive patterns include overflow protection with FHE.select, initialization checks, and never leaking information through reverts or events.
