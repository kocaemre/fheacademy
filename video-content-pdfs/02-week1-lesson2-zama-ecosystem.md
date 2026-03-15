# Week 1 - Lesson 1.2: Zama Ecosystem Overview

## Learning Objective
Understand the Zama technology stack, the FHEVM architecture, and how encrypted computations flow through the system.

---

## Introducing Zama

Zama is the company building the open-source tools that make FHE practical for developers. Founded in 2020, Zama's mission is to make FHE accessible. Their technology stack provides everything needed to build confidential smart contracts.

## The Zama Technology Stack

### Layer 1: TFHE-rs (The Foundation)

TFHE-rs is Zama's core FHE library, written in Rust. TFHE stands for "Torus Fully Homomorphic Encryption" - a specific FHE scheme optimized for fast boolean and integer operations.

**What it does:** Provides the raw cryptographic primitives - encryption, decryption, and homomorphic operations. This is the engine that makes everything else possible.

**Key feature:** TFHE-rs uses a technique called "programmable bootstrapping" which allows refreshing the noise in ciphertexts during computation. In FHE, every operation adds "noise" to the ciphertext. If noise grows too large, decryption fails. Bootstrapping resets the noise level, enabling unlimited computation depth.

You do not interact with TFHE-rs directly. It runs behind the scenes, powering the higher-level tools.

### Layer 2: FHEVM (The Smart Contract Library)

FHEVM is the Solidity library you will use directly. It provides:

- **Encrypted types:** `ebool`, `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `euint256`, `eaddress`
- **FHE operations:** `FHE.add()`, `FHE.sub()`, `FHE.mul()`, `FHE.select()`, and more
- **Access control:** `FHE.allowThis()`, `FHE.allow()`, `FHE.allowTransient()`
- **Input validation:** `FHE.fromExternal()` for processing encrypted inputs with zero-knowledge proofs
- **Decryption:** `FHE.makePubliclyDecryptable()` for marking values for decryption

**Current version:** FHEVM v0.9 (which this course uses)

### Layer 3: The Coprocessor (The Computation Engine)

Here is the critical architectural insight: FHE operations do not run inside the EVM. They are far too computationally expensive for that. Instead, FHEVM uses a coprocessor model.

**How it works:**

1. Your smart contract calls `FHE.add(a, b)` on-chain
2. The EVM does not actually perform the encrypted addition
3. Instead, it records the operation and sends it to the coprocessor
4. The coprocessor performs the actual FHE computation off-chain
5. The result (an encrypted handle) is returned to the contract

**Why this matters:** This architecture means you write normal-looking Solidity code, but the heavy cryptographic work happens on specialized hardware off-chain. The blockchain stores encrypted handles (references to ciphertexts), not the full ciphertexts themselves.

**Analogy:** Think of it like a GPU in a computer. The CPU (EVM) sends instructions to the GPU (coprocessor), the GPU does the heavy math, and sends results back. The CPU coordinates, the GPU computes.

### Layer 4: KMS (Key Management Service)

The KMS handles the most sensitive part of the system: the encryption keys.

**The challenge:** If a single entity holds the decryption key, they could decrypt everything. That defeats the purpose of FHE.

**The solution:** Threshold decryption. The decryption key is split into shares distributed among multiple independent parties. No single party can decrypt anything alone. A threshold (for example, 3 out of 5) of parties must cooperate to decrypt.

**How decryption works in v0.9:**
1. A smart contract marks a value as publicly decryptable using `FHE.makePubliclyDecryptable()`
2. The user requests decryption through the relayer SDK
3. The KMS nodes each partially decrypt with their key share
4. The partial decryptions are combined to produce the final plaintext
5. The user submits the plaintext and proof back on-chain

### Layer 5: Relayer SDK (The Client Bridge)

The Relayer SDK is the JavaScript/TypeScript library that your frontend uses to:

- **Encrypt inputs:** Convert plaintext values into encrypted ciphertexts with zero-knowledge proofs
- **Decrypt outputs:** Request decryption from the KMS and submit results on-chain
- **Manage instances:** Create and configure FHEVM instances for your dApp

---

## The Symbolic Execution Model

This is one of the most important concepts to understand about FHEVM.

### Handles, Not Ciphertexts

When your smart contract stores an encrypted value, it does not store the actual ciphertext (which is very large). Instead, it stores a **handle** - a 256-bit identifier that references the ciphertext stored in the coprocessor.

Think of handles like pointers in programming. The handle says "the encrypted value is over there in the coprocessor." The contract manipulates handles, and the coprocessor manipulates the actual ciphertexts.

### Why Handles Matter

1. **Gas efficiency:** Storing a full FHE ciphertext on-chain would cost enormous gas. Handles are just 32 bytes.
2. **Composability:** Handles can be passed between contracts, enabling cross-contract encrypted computation.
3. **Non-deterministic:** Handles are NOT deterministic. The same plaintext encrypted twice produces different handles. You cannot compare handles to check equality - you must use `FHE.eq()`.

### The ACL (Access Control List)

Every ciphertext in the coprocessor has an Access Control List that determines who can use it. This is a security mechanism unique to FHEVM.

When a new encrypted value is created (through computation or input), the contract must explicitly grant permissions:
- `FHE.allowThis()` - allows the current contract to use the value
- `FHE.allow(address)` - allows a specific address to use or decrypt the value

**Critical rule:** If you forget to call `FHE.allowThis()` after creating a new encrypted value, your contract loses access to that value forever. There is no recovery.

---

## How Everything Fits Together

Here is the complete flow of a confidential transaction:

### Step 1: User Encrypts Input
```
User's browser → Relayer SDK → Encrypts value + generates ZK proof
```

### Step 2: User Sends Transaction
```
Encrypted ciphertext + ZK proof → Smart contract function call
```

### Step 3: Contract Validates Input
```
FHE.fromExternal(encryptedInput, proof) → Returns handle → ACL set
```

### Step 4: Contract Computes
```
FHE.add(handle_a, handle_b) → Coprocessor performs computation → New handle returned
```

### Step 5: Contract Stores Result
```
result.allowThis() → result stored in contract state
```

### Step 6: User Requests Decryption (when needed)
```
FHE.makePubliclyDecryptable(handle) → KMS threshold decryption → User gets plaintext
```

---

## The Coprocessor Architecture Diagram

```
┌─────────────────────────────────────────────┐
│                  Frontend                     │
│          (Relayer SDK + Web3 Wallet)          │
└──────────────┬──────────────────┬────────────┘
               │                  │
         Encrypted Input    Decryption Request
               │                  │
               ▼                  ▼
┌──────────────────────┐  ┌──────────────────┐
│    Smart Contract     │  │       KMS        │
│    (Handles + ACL)    │  │ (Threshold Keys) │
└──────────┬───────────┘  └──────────────────┘
           │
     FHE Operations
           │
           ▼
┌──────────────────────┐
│    Coprocessor       │
│ (TFHE-rs Engine)     │
│ Stores ciphertexts   │
│ Performs FHE ops      │
└──────────────────────┘
```

---

## Key Takeaways

1. Zama's stack has 5 layers: TFHE-rs (crypto), FHEVM (Solidity), Coprocessor (compute), KMS (keys), Relayer SDK (client)
2. FHE operations happen off-chain in the coprocessor, not inside the EVM
3. Smart contracts store handles (32-byte references), not full ciphertexts
4. The KMS uses threshold decryption - no single party can decrypt
5. Every encrypted value has an ACL controlling who can access it
6. The coprocessor model means you write normal Solidity but get FHE security

---

## Quiz Questions

**Q1:** Why does FHEVM use a coprocessor instead of running FHE operations directly in the EVM?
**A:** FHE operations are computationally too expensive to run inside the EVM. The coprocessor model allows heavy cryptographic computation to happen off-chain on specialized hardware, while the blockchain stores lightweight handles (32-byte references) and coordinates the operations. This keeps gas costs manageable.

**Q2:** What is a "handle" in FHEVM and why are handles non-deterministic?
**A:** A handle is a 256-bit identifier that references an encrypted ciphertext stored in the coprocessor. Handles are non-deterministic because FHE encryption includes randomness - encrypting the same plaintext value twice produces different ciphertexts and therefore different handles. This means you cannot compare handles directly to check equality; you must use FHE.eq() instead.
