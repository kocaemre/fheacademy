# Week 1 - Lesson 1.4: Your First FHEVM Contract - Counter Migration

## Learning Objective
Write your first FHEVM contract by migrating a familiar Solidity counter to use encrypted operations. Master the Migration Mindset.

---

## The Migration Mindset

The Migration Mindset is the core teaching approach of this bootcamp. Instead of learning FHEVM from scratch, you transform familiar Solidity patterns into their encrypted equivalents. This makes the transition intuitive and systematic.

**The 4-step migration process:**
1. Start with working Solidity code you understand
2. Replace plaintext types with encrypted types
3. Replace standard operations with FHE operations
4. Add ACL permissions and encrypted input handling

Let us apply this to a simple counter contract.

---

## Step 1: The Familiar Solidity Counter

Here is a basic counter contract that every Solidity developer has seen:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint32 public count;

    function increment() public {
        count += 1;
    }

    function add(uint32 value) public {
        count += value;
    }

    function getCount() public view returns (uint32) {
        return count;
    }
}
```

Simple and straightforward: a `uint32` state variable, functions to increment and add, and a getter. Everyone can see the count. Everyone can read it. No privacy.

---

## Step 2: Replace Types with Encrypted Types

The first migration step is replacing plaintext types with their encrypted equivalents:

| Plaintext Type | Encrypted Type | Description |
|---------------|----------------|-------------|
| `uint8` | `euint8` | 8-bit encrypted unsigned integer |
| `uint16` | `euint16` | 16-bit encrypted unsigned integer |
| `uint32` | `euint32` | 32-bit encrypted unsigned integer |
| `uint64` | `euint64` | 64-bit encrypted unsigned integer |
| `uint128` | `euint128` | 128-bit encrypted unsigned integer |
| `uint256` | `euint256` | 256-bit encrypted unsigned integer |
| `bool` | `ebool` | Encrypted boolean |
| `address` | `eaddress` | Encrypted address |

For our counter, `uint32 public count` becomes `euint32 private count`.

**Important:** Encrypted state variables must be `private`, not `public`. If they were `public`, Solidity would auto-generate a getter returning the encrypted handle, which is meaningless to users. We will write our own getter with proper access control.

---

## Step 3: Replace Operations with FHE Operations

Standard Solidity arithmetic operators do not work on encrypted types. You must use FHE library functions:

| Solidity Operation | FHE Equivalent | Description |
|-------------------|----------------|-------------|
| `a + b` | `FHE.add(a, b)` | Encrypted addition |
| `a - b` | `FHE.sub(a, b)` | Encrypted subtraction |
| `a * b` | `FHE.mul(a, b)` | Encrypted multiplication |
| `a / b` | `FHE.div(a, plainB)` | Division (plaintext divisor only!) |
| `a == b` | `FHE.eq(a, b)` | Equality check (returns ebool) |
| `a > b` | `FHE.gt(a, b)` | Greater than (returns ebool) |
| `if (cond) a else b` | `FHE.select(cond, a, b)` | Encrypted conditional |

For our counter:
- `count += 1` becomes `count = FHE.add(count, 1)`
- `count += value` becomes `count = FHE.add(count, value)`

**Notice:** `FHE.add(count, 1)` uses a plaintext `1` as the second operand. FHEVM is smart enough to handle mixed encrypted-plaintext operations, and this is cheaper in gas than encrypting the `1` first.

---

## Step 4: Add ACL Permissions

This is the step that is completely new - it has no equivalent in standard Solidity. Every time you create or modify an encrypted value, you must set its ACL (Access Control List).

### FHE.allowThis()

After every state variable update, call `FHE.allowThis()` to grant the contract itself permission to use the value in future transactions:

```solidity
count = FHE.add(count, 1);
FHE.allowThis(count);  // Contract can use count in future transactions
```

**Why is this needed?** Each FHE operation creates a NEW ciphertext with a NEW handle. The new handle has an empty ACL by default. If you do not call `FHE.allowThis()`, the contract will not be able to read its own state variable in the next transaction.

**Critical rule:** Forgetting `FHE.allowThis()` means the contract permanently loses access to that value. There is no recovery mechanism.

### FHE.allow()

To let a specific user decrypt a value:

```solidity
FHE.allow(count, msg.sender);  // msg.sender can request decryption
```

---

## Step 5: Handle Encrypted Inputs

When users send values to the contract, those values must arrive encrypted. FHEVM uses a special type called `externalEuint32` (and similar for other sizes) along with a zero-knowledge proof:

```solidity
function add(externalEuint32 encryptedValue, bytes calldata inputProof) public {
    euint32 value = FHE.fromExternal(encryptedValue, inputProof);
    count = FHE.add(count, value);
    FHE.allowThis(count);
    FHE.allow(count, msg.sender);
}
```

**What happens here:**
1. The user encrypts their value client-side using the Relayer SDK
2. They send the encrypted value (`externalEuint32`) and a proof (`inputProof`)
3. `FHE.fromExternal()` validates the proof and returns a usable `euint32` handle
4. The contract uses this handle in FHE operations

**Why the proof?** The zero-knowledge proof (ZKPoK - Zero-Knowledge Proof of Knowledge) ensures:
- The user actually knows the plaintext value they encrypted
- The ciphertext is bound to this specific contract and sender
- The ciphertext cannot be replayed in other transactions or contracts

---

## The Complete Migrated Contract

Here is the full encrypted counter:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

contract EncryptedCounter is SepoliaZamaFHEVMConfig {
    euint32 private count;

    function increment() public {
        count = FHE.add(count, 1);
        FHE.allowThis(count);
        FHE.allow(count, msg.sender);
    }

    function add(externalEuint32 encryptedValue, bytes calldata inputProof) public {
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);
        count = FHE.add(count, value);
        FHE.allowThis(count);
        FHE.allow(count, msg.sender);
    }

    function getCount() public view returns (euint32) {
        return count;
    }
}
```

### Side-by-Side Comparison

| Aspect | Solidity Counter | FHEVM Counter |
|--------|-----------------|---------------|
| State type | `uint32 public` | `euint32 private` |
| Increment | `count += 1` | `FHE.add(count, 1)` + ACL |
| Add value | `add(uint32 value)` | `add(externalEuint32, bytes proof)` |
| Read value | Anyone can read | Only permitted addresses can decrypt |
| Visibility | Fully public | Fully encrypted |

---

## Common Mistakes to Avoid

### Mistake 1: Forgetting FHE.allowThis()
```solidity
// WRONG - contract loses access to count!
count = FHE.add(count, 1);

// CORRECT
count = FHE.add(count, 1);
FHE.allowThis(count);
```

### Mistake 2: Using public visibility for encrypted state
```solidity
// WRONG - auto-generated getter returns meaningless handle
euint32 public count;

// CORRECT - use private and write custom getter
euint32 private count;
```

### Mistake 3: Using regular operators on encrypted types
```solidity
// WRONG - will not compile
count = count + 1;

// CORRECT
count = FHE.add(count, 1);
```

### Mistake 4: Accepting plaintext inputs
```solidity
// WRONG - value is visible in the transaction
function add(uint32 value) public { ... }

// CORRECT - value is encrypted
function add(externalEuint32 value, bytes calldata proof) public { ... }
```

---

## Key Takeaways

1. The Migration Mindset: replace types, replace operations, add ACL, handle encrypted inputs
2. Encrypted types (`euint32`) replace plaintext types (`uint32`)
3. FHE operations (`FHE.add`) replace standard operators (`+`)
4. `FHE.allowThis()` must be called after EVERY state variable update
5. `FHE.allow(value, address)` grants decryption permission to specific addresses
6. Encrypted inputs use `externalEuint32` + `inputProof` validated by `FHE.fromExternal()`
7. The zero-knowledge proof prevents replay attacks and ensures input authenticity

---

## Quiz Questions

**Q1:** Why must you call FHE.allowThis() after every state variable update?
**A:** Each FHE operation creates a new ciphertext with a new handle that has an empty ACL. Without FHE.allowThis(), the contract itself cannot access the value in subsequent transactions. This permission loss is permanent and irrecoverable.

**Q2:** What is the purpose of the inputProof parameter in encrypted input functions?
**A:** The inputProof is a Zero-Knowledge Proof of Knowledge (ZKPoK) that validates the encrypted input. It proves that the sender knows the plaintext value, binds the ciphertext to the specific contract and sender address, and prevents replay attacks where someone could reuse another user's encrypted value.
