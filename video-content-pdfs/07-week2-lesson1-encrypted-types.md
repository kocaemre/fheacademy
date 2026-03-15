# Week 2 - Lesson 2.1: Encrypted Types Deep Dive

## Learning Objective
Master the complete FHEVM type system, understand gas implications of type choices, and learn safe type casting.

---

## The Complete FHEVM Type Catalog

FHEVM provides encrypted equivalents for Solidity's integer types, plus some special types. Understanding when to use each type is critical for both correctness and gas efficiency.

### Core Encrypted Types

| Type | Plaintext Equivalent | Bit Width | Use Cases |
|------|---------------------|-----------|-----------|
| `ebool` | `bool` | 1 bit | Flags, conditions, yes/no states |
| `euint8` | `uint8` | 8 bits | Small counters, percentages, scores |
| `euint16` | `uint16` | 16 bits | Medium counters, small amounts |
| `euint32` | `uint32` | 32 bits | Timestamps, moderate amounts |
| `euint64` | `uint64` | 64 bits | Token balances, large amounts |
| `euint128` | `uint128` | 128 bits | Very large numbers |
| `euint256` | `uint256` | 256 bits | Full EVM word, maximum range |
| `eaddress` | `address` | 160 bits | Encrypted Ethereum addresses |

### External Input Types

For function parameters that receive encrypted values from users:

| External Type | Corresponds To | Usage |
|--------------|----------------|-------|
| `externalEbool` | `ebool` | Encrypted boolean input |
| `externalEuint8` | `euint8` | Encrypted 8-bit input |
| `externalEuint16` | `euint16` | Encrypted 16-bit input |
| `externalEuint32` | `euint32` | Encrypted 32-bit input |
| `externalEuint64` | `euint64` | Encrypted 64-bit input |
| `externalEuint128` | `euint128` | Encrypted 128-bit input |
| `externalEuint256` | `euint256` | Encrypted 256-bit input |
| `externalEaddress` | `eaddress` | Encrypted address input |

These types are used in function signatures and converted to their internal equivalents using `FHE.fromExternal()`.

---

## Gas Cost Hierarchy

This is one of the most important practical considerations in FHEVM development. FHE operations are significantly more expensive than regular EVM operations, and the cost scales with type size.

### The Golden Rule: Use the SMALLEST Type That Fits

```
ebool < euint8 < euint16 < euint32 < euint64 < euint128 < euint256
 cheapest                                              most expensive
```

The gas cost difference between types is not linear - it is roughly exponential. An operation on `euint256` can cost 10-50 times more than the same operation on `euint8`.

### Practical Examples

| Scenario | Bad Choice | Good Choice | Why |
|----------|-----------|-------------|-----|
| Age (0-150) | `euint256` | `euint8` | Max value 255, euint8 is sufficient |
| Token balance | `euint256` | `euint64` | Most tokens fit in 64 bits |
| Percentage (0-100) | `euint32` | `euint8` | Max value 255, euint8 works |
| Vote count (0-1000) | `euint64` | `euint16` | Max value 65535, euint16 is enough |
| ETH amount (18 decimals) | `euint256` | `euint64` | Handles up to ~18.4 ETH at 18 decimals |

### Real-World Gas Savings

If your contract processes 100 transactions per day and each uses encrypted addition:
- Using `euint256`: approximately 100x higher gas cost per operation
- Using `euint32`: reasonable gas cost
- Using `euint8`: lowest possible gas cost

Over time, this difference adds up to significant cost savings for users.

---

## Type Casting

Sometimes you need to convert between encrypted types. FHEVM supports this through the `FHE.asEuintXX()` family of functions.

### Upcasting (Safe - No Data Loss)

Converting from a smaller type to a larger type is always safe:

```solidity
euint8 smallValue = ...; // some 8-bit encrypted value
euint32 largerValue = FHE.asEuint32(smallValue);  // Safe: 8 bits → 32 bits
euint64 evenLarger = FHE.asEuint64(smallValue);   // Safe: 8 bits → 64 bits
```

Upcasting preserves the value exactly. An encrypted 42 as `euint8` becomes an encrypted 42 as `euint32`.

### Downcasting (Dangerous - Data Loss via Truncation)

Converting from a larger type to a smaller type truncates the value:

```solidity
euint32 largeValue = ...; // suppose this holds 300
euint8 truncated = FHE.asEuint8(largeValue);  // TRUNCATED: 300 → 44 (300 mod 256)
```

**Warning:** Downcasting silently truncates. There is no error, no revert, no warning. The value is simply reduced modulo 2^(target bits). This can introduce subtle bugs.

**Best practice:** Only downcast when you are absolutely certain the value fits in the smaller type. If in doubt, use the larger type.

### Casting Functions

| Function | Description |
|----------|-------------|
| `FHE.asEbool(value)` | Cast to encrypted boolean |
| `FHE.asEuint8(value)` | Cast to 8-bit encrypted integer |
| `FHE.asEuint16(value)` | Cast to 16-bit encrypted integer |
| `FHE.asEuint32(value)` | Cast to 32-bit encrypted integer |
| `FHE.asEuint64(value)` | Cast to 64-bit encrypted integer |
| `FHE.asEuint128(value)` | Cast to 128-bit encrypted integer |
| `FHE.asEuint256(value)` | Cast to 256-bit encrypted integer |

### Converting Plaintext to Encrypted

You can also use these functions to convert plaintext values to encrypted types:

```solidity
euint32 encryptedFive = FHE.asEuint32(5);  // Encrypts the plaintext value 5
```

This is useful for initializing encrypted state variables or creating encrypted constants.

---

## Important Notes

### ebytes Types Are Removed

Earlier versions of FHEVM had `ebytes64`, `ebytes128`, and `ebytes256` types for encrypted byte arrays. These have been removed as of FHEVM v0.7. If you see them in older documentation or tutorials, they are no longer available.

### eaddress Type

The `eaddress` type encrypts Ethereum addresses. It is useful for:
- Hiding the recipient of a transfer
- Encrypting voting addresses
- Storing confidential access lists

```solidity
eaddress private secretRecipient;

function setRecipient(externalEaddress encrypted, bytes calldata proof) public {
    secretRecipient = FHE.fromExternal(encrypted, proof);
    FHE.allowThis(secretRecipient);
}
```

---

## Key Takeaways

1. FHEVM provides 8 encrypted types: ebool, euint8/16/32/64/128/256, eaddress
2. Each type has an external input variant (externalEuintXX) for function parameters
3. Gas costs scale roughly exponentially with type size - always use the smallest type that fits
4. Upcasting (small → large) is safe; downcasting (large → small) truncates silently
5. ebytes types have been removed in FHEVM v0.7+
6. Use FHE.asEuintXX() for type casting and plaintext-to-encrypted conversion

---

## Quiz Questions

**Q1:** Why should you use euint8 instead of euint256 for a percentage value (0-100)?
**A:** Gas costs scale roughly exponentially with type size. Since a percentage fits within 8 bits (max 255), using euint8 is dramatically cheaper than euint256. An operation on euint256 can cost 10-50x more gas than the same operation on euint8, resulting in significant cost savings over time.

**Q2:** What happens when you downcast an euint32 holding the value 500 to euint8?
**A:** The value is silently truncated to 500 mod 256 = 244. There is no error, no revert, and no warning. The operation succeeds but produces an incorrect value. This is why developers should only downcast when absolutely certain the value fits in the smaller type.

**Q3:** What is the difference between euint32 and externalEuint32?
**A:** euint32 is the internal encrypted type used within smart contracts for state variables and local computation. externalEuint32 is the external input type used in function parameters when receiving encrypted values from users. External types must be converted to internal types using FHE.fromExternal(encryptedValue, inputProof) which validates the zero-knowledge proof.
