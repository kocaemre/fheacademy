# Week 2 - Lesson 2.3: Encrypted Inputs and Zero-Knowledge Proofs

## Learning Objective
Understand the complete encrypted input lifecycle, client-side encryption, and why Zero-Knowledge Proofs of Knowledge (ZKPoK) are essential for input security.

---

## The Encrypted Input Problem

When a user wants to interact with an FHEVM contract, they need to send encrypted values. But how? The blockchain is public - if you send a plaintext value in a transaction, everyone sees it. If you encrypt it, how does the contract know it is a valid encryption?

This is where the encrypted input system comes in, combining client-side encryption with zero-knowledge proofs.

---

## The 4-Stage Encrypted Input Lifecycle

### Stage 1: Client-Side Encryption

The user's browser encrypts the value before it ever touches the blockchain.

Using the Relayer SDK:
```javascript
// In the frontend (JavaScript/TypeScript)
const instance = await createInstance({
  chainId: 11155111,  // Sepolia
  publicKey: contractPublicKey,
});

const input = instance.createEncryptedInput(
  contractAddress,
  userAddress
);

input.addUint32(42);  // The secret value
const encrypted = await input.encrypt();
// encrypted.handles[0] = encrypted value reference
// encrypted.inputProof = zero-knowledge proof
```

**What happens:** The SDK takes the plaintext value (42), encrypts it using the network's FHE public key, and generates a zero-knowledge proof that the encryption is valid.

### Stage 2: Zero-Knowledge Proof Generation

Along with the encrypted value, the SDK generates a ZKPoK (Zero-Knowledge Proof of Knowledge). This proof guarantees three things:

1. **Knowledge:** The user actually knows the plaintext value they encrypted. They did not just copy someone else's ciphertext.

2. **Binding to contract:** The ciphertext is bound to a specific contract address. It cannot be replayed against a different contract.

3. **Binding to sender:** The ciphertext is bound to the sender's address. Nobody else can submit this encrypted value.

**Why this matters:** Without the proof, an attacker could:
- Copy your encrypted bid and submit it to an auction contract (replay attack)
- Take encrypted values from one contract and use them in another
- Submit random data that is not a valid encryption

### Stage 3: On-Chain Submission

The user sends a regular Ethereum transaction with:
- The encrypted value as `externalEuintXX` type
- The proof as `bytes calldata`

```solidity
function placeBid(
    externalEuint64 encryptedBid,
    bytes calldata inputProof
) public {
    // ...
}
```

The transaction data is visible on-chain, but the encrypted value is meaningless to observers - they see ciphertext, not the plaintext value.

### Stage 4: On-Chain Validation

Inside the smart contract, `FHE.fromExternal()` validates the proof and converts the external type to an internal encrypted handle:

```solidity
function placeBid(
    externalEuint64 encryptedBid,
    bytes calldata inputProof
) public {
    // Validate proof and get usable handle
    euint64 bid = FHE.fromExternal(encryptedBid, inputProof);

    // Now 'bid' can be used in FHE operations
    bids[msg.sender] = bid;
    FHE.allowThis(bids[msg.sender]);
    FHE.allow(bids[msg.sender], msg.sender);
}
```

**What FHE.fromExternal does:**
1. Verifies the ZKPoK proof is valid
2. Checks the proof is bound to this contract and this sender
3. Registers the ciphertext with the coprocessor
4. Returns a handle that can be used in FHE operations
5. If any validation fails, the transaction reverts

---

## Single vs Multiple Encrypted Inputs

### Single Encrypted Input

Most functions need just one encrypted value:

```solidity
function deposit(externalEuint64 amount, bytes calldata proof) public {
    euint64 depositAmount = FHE.fromExternal(amount, proof);
    balance[msg.sender] = FHE.add(balance[msg.sender], depositAmount);
    FHE.allowThis(balance[msg.sender]);
}
```

### Multiple Encrypted Inputs

Some functions need multiple encrypted values. You can send multiple values in a single input:

**Client side:**
```javascript
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.addUint64(100);    // First value: amount
input.addUint32(30);     // Second value: deadline
const encrypted = await input.encrypt();

// encrypted.handles[0] → amount
// encrypted.handles[1] → deadline
// encrypted.inputProof → shared proof for both
```

**Contract side:**
```solidity
function createOrder(
    externalEuint64 encAmount,
    externalEuint32 encDeadline,
    bytes calldata inputProof
) public {
    euint64 amount = FHE.fromExternal(encAmount, inputProof);
    euint32 deadline = FHE.fromExternal(encDeadline, inputProof);

    orders[msg.sender].amount = amount;
    orders[msg.sender].deadline = deadline;
    FHE.allowThis(orders[msg.sender].amount);
    FHE.allowThis(orders[msg.sender].deadline);
}
```

**Key point:** All values in a single `createEncryptedInput` share the same proof. This is more efficient than creating separate proofs for each value.

---

## Security Properties

### Replay Protection

The ZKPoK binds the ciphertext to:
- **Contract address:** Cannot use a ciphertext meant for Contract A in Contract B
- **Sender address:** Cannot use Alice's ciphertext in Bob's transaction
- **Transaction nonce:** Cannot replay the same ciphertext twice

### Input Privacy

- The plaintext value never appears on-chain
- The encrypted value (ciphertext) is visible but computationally indistinguishable from random data
- Even the contract itself does not see the plaintext - it works with encrypted handles

### Proof Soundness

The ZKPoK guarantees:
- The ciphertext is a valid encryption (not garbage data)
- The user knows the plaintext (they are not blindly forwarding someone else's data)
- The proof cannot be forged without knowing the plaintext

---

## Common Pitfalls

### Pitfall 1: Forgetting the Proof Parameter
```solidity
// WRONG - missing proof validation
function deposit(externalEuint64 amount) public {
    // Cannot use amount without proof!
}

// CORRECT
function deposit(externalEuint64 amount, bytes calldata proof) public {
    euint64 value = FHE.fromExternal(amount, proof);
}
```

### Pitfall 2: Sending Plaintext Instead of Encrypted Input
```solidity
// WRONG - value is visible in transaction data!
function deposit(uint64 amount) public {
    // amount is plaintext - no privacy
}

// CORRECT
function deposit(externalEuint64 amount, bytes calldata proof) public {
    euint64 value = FHE.fromExternal(amount, proof);
}
```

### Pitfall 3: Not Setting ACL After FromExternal
```solidity
// WRONG - forgetting ACL
euint64 value = FHE.fromExternal(amount, proof);
storedValue = value;
// Contract loses access!

// CORRECT
euint64 value = FHE.fromExternal(amount, proof);
storedValue = value;
FHE.allowThis(storedValue);
```

---

## Key Takeaways

1. Encrypted inputs go through 4 stages: client encryption, proof generation, on-chain submission, on-chain validation
2. ZKPoK proofs prevent replay attacks by binding ciphertext to contract address and sender
3. FHE.fromExternal() validates proofs and converts external types to usable handles
4. Multiple values can share a single proof for efficiency
5. The plaintext value never appears on-chain - only the encrypted ciphertext
6. Always set ACL permissions after FHE.fromExternal()

---

## Quiz Questions

**Q1:** What three things does the Zero-Knowledge Proof of Knowledge (ZKPoK) guarantee about an encrypted input?
**A:** The ZKPoK guarantees: (1) the user knows the plaintext value they encrypted (knowledge), (2) the ciphertext is bound to the specific contract address (preventing cross-contract replay), and (3) the ciphertext is bound to the sender's address (preventing cross-user replay). Without these guarantees, attackers could copy and reuse encrypted values.

**Q2:** Why is it important that encrypted inputs use externalEuint types instead of regular uint types?
**A:** Using externalEuint types ensures the value arrives encrypted - the plaintext never appears in the transaction data. If a regular uint type were used, the value would be visible to everyone on the blockchain, defeating the purpose of confidential computation. The externalEuint type, combined with the inputProof, provides both privacy and validity guarantees.
