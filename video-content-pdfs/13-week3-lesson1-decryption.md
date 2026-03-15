# Week 3 - Lesson 3.1: Decryption Mechanism (v0.9 Self-Relaying)

## Learning Objective
Understand how encrypted values are decrypted in FHEVM v0.9 using the self-relaying model with KMS threshold decryption.

---

## The Decryption Challenge

In FHEVM, data stays encrypted by default. This is the whole point - confidential computation. But at some point, someone needs to see a result. How do you reveal an encrypted value without compromising the system?

The answer is controlled decryption with threshold cryptography.

---

## Data Stays Encrypted By Default

This is a critical design principle: **encrypted data is never automatically decrypted.** A value will remain encrypted on-chain forever unless the contract explicitly marks it for decryption.

This means:
- Token balances stay encrypted until the owner requests to see them
- Auction results stay encrypted until the auction ends and the contract reveals the winner
- Vote counts stay encrypted until the voting period ends

**The contract decides** what can be decrypted. Not the user, not the validator, not the coprocessor. The smart contract's logic controls when and what is revealed.

---

## FHEVM v0.9: Self-Relaying Model

FHEVM v0.9 introduced a major architectural change in how decryption works. The previous model (Gateway/Oracle-based) has been deprecated. The new model is called "self-relaying" because the user themselves relays the decrypted value back on-chain.

### The Three Stages of Decryption

#### Stage 1: Contract Marks Value as Decryptable

The smart contract must explicitly call `FHE.makePubliclyDecryptable()` to mark a value for decryption:

```solidity
function revealWinner() public {
    // Only callable after auction ends
    require(block.timestamp > auctionEndTime, "Auction still active");

    // Mark the winning bid as decryptable
    FHE.makePubliclyDecryptable(winningBid);

    // Note: winningBid is still encrypted on-chain at this point
    // but it is now marked as eligible for decryption
}
```

**Key points:**
- Only the contract can mark values as decryptable (users cannot request arbitrary decryptions)
- The value is NOT immediately decrypted on-chain
- This is a one-way operation - once marked, it stays marked
- Only values with proper ACL can be marked

#### Stage 2: User Decrypts Off-Chain via KMS

After a value is marked as decryptable, a user can request decryption:

```javascript
// In the frontend (JavaScript/TypeScript)
const relayerSDK = createRelayerInstance({ chainId: 11155111 });

// Request decryption from KMS
const decryptionResult = await relayerSDK.decrypt(
    contractAddress,
    encryptedHandle   // The handle of the marked value
);

// decryptionResult contains:
// - cleartext: the decrypted value
// - signature: cryptographic proof of correct decryption
```

**What happens behind the scenes:**
1. The Relayer SDK contacts the KMS (Key Management Service)
2. Multiple KMS nodes each partially decrypt with their key share
3. A threshold of partial decryptions are combined
4. The final plaintext and a signature (proof of correct decryption) are returned

This is threshold decryption - no single KMS node can decrypt alone.

#### Stage 3: User Submits Cleartext On-Chain

The user submits the decrypted value and proof back to the contract:

```solidity
function processDecryptedWinner(
    uint64 clearWinningBid,
    bytes calldata decryptionSignature
) public {
    // Verify the decryption is authentic
    FHE.checkSignatures(winningBidHandle, clearWinningBid, decryptionSignature);

    // Now we can use the cleartext value
    winner.transfer(clearWinningBid);
}
```

`FHE.checkSignatures()` verifies that:
- The cleartext matches the actual decryption of the ciphertext
- The signature is valid (came from the KMS)
- The decryption was not tampered with

---

## Design Decision Framework

Not everything should be decrypted. Deciding what to decrypt is a critical design choice.

### When to Decrypt

| Scenario | Decrypt? | Reason |
|----------|----------|--------|
| User's own balance | Yes | User needs to see their funds |
| Auction winner | Yes | Result needs to be public |
| Vote totals | Yes | Final results should be transparent |
| Game outcome | Yes | Players need to know who won |

### When to Keep Encrypted

| Scenario | Decrypt? | Reason |
|----------|----------|--------|
| Losing bids | No | Losers' bids should stay private |
| Individual votes | No | Vote secrecy must be maintained |
| Intermediate values | No | No reason to expose internal state |
| Other users' data | No | Privacy is the whole point |

### Design Principle

**Decrypt the minimum necessary.** Only reveal what is absolutely required for the application to function. Everything else stays encrypted.

---

## Deprecated Patterns (Do Not Use)

If you encounter these in older documentation or tutorials, know that they are deprecated in v0.9:

- `Gateway.requestDecryption()` - Old oracle-based decryption model
- `GatewayCaller` contract - Base contract for oracle callbacks
- `addRelayer()` - Old relayer management

These were part of the v0.7 architecture where an oracle would push decrypted values to contracts. The v0.9 self-relaying model puts users in control and reduces trust assumptions.

---

## Complete Decryption Flow Diagram

```
┌──────────┐     ┌────────────┐     ┌──────────┐     ┌────────────┐
│ Contract │     │   User     │     │   KMS    │     │  Contract  │
│ marks    │────▶│ requests   │────▶│ threshold│────▶│  verifies  │
│ value    │     │ decryption │     │ decrypt  │     │  & uses    │
│ public   │     │ via SDK    │     │ returns  │     │  cleartext │
│ decrypt  │     │            │     │ proof    │     │            │
└──────────┘     └────────────┘     └──────────┘     └────────────┘

Stage 1           Stage 2           Stage 2           Stage 3
On-chain          Off-chain         Off-chain         On-chain
```

---

## Key Takeaways

1. Data stays encrypted by default - decryption requires explicit contract action
2. v0.9 uses self-relaying: user decrypts off-chain and submits cleartext back on-chain
3. Three stages: contract marks → user decrypts via KMS → user submits with proof
4. FHE.makePubliclyDecryptable() marks values eligible for decryption
5. FHE.checkSignatures() verifies decrypted values are authentic
6. Decrypt only what is absolutely necessary - keep everything else encrypted
7. The Gateway/Oracle pattern from v0.7 is deprecated

---

## Quiz Questions

**Q1:** Why does FHEVM v0.9 use a self-relaying model instead of oracle-based decryption?
**A:** The self-relaying model puts users in control of decryption rather than relying on a trusted oracle. Users decrypt off-chain via the KMS and submit the result themselves, reducing trust assumptions. The contract verifies authenticity using FHE.checkSignatures(), ensuring the decrypted value is genuine without depending on a centralized oracle.

**Q2:** What is the role of FHE.checkSignatures() in the decryption flow?
**A:** FHE.checkSignatures() verifies that a submitted cleartext value is the authentic decryption of a specific ciphertext. It validates the KMS signature to ensure the decryption was not tampered with and that the cleartext genuinely corresponds to the encrypted handle. Without this verification, a malicious user could submit arbitrary values.
