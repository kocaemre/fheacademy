# Week 3: Building Real-World Confidential dApps

## Introduction

Welcome to Week 3 of FHE Academy. This week moves from smart contracts to full applications. You will learn how decryption works in FHEVM v0.9, master advanced FHE.select patterns, discover encrypted randomness, build frontends that encrypt and decrypt, and implement two flagship design patterns: sealed-bid auctions and private voting. By the end, you will build a complete sealed-bid auction dApp with a React frontend. Estimated time: 12-14 hours.

---

## Lesson 3.1 - Decryption Mechanism (v0.9 Self-Relaying)

### Data Stays Encrypted By Default

In FHEVM, encrypted data is never automatically decrypted. A value will remain encrypted on-chain forever unless the contract explicitly marks it for decryption. Token balances stay encrypted until the owner requests to see them. Auction results stay encrypted until the auction ends. Vote counts stay encrypted until the voting period closes.

The contract decides what can be decrypted. Not the user, not the validator, not the coprocessor. The smart contract's logic controls when and what is revealed.

### The Three Stages of v0.9 Self-Relaying Decryption

FHEVM v0.9 replaced the old oracle-based Gateway pattern with a user-driven self-relaying model. The user themselves relays the decrypted value back on-chain.

**Stage 1: Contract Marks Value as Decryptable.**

```solidity
function revealWinner() public {
    require(block.timestamp > auctionEndTime, "Auction still active");
    FHE.makePubliclyDecryptable(winningBid);
}
```

Only the contract can mark values. The value is not immediately decrypted on-chain. This is the contract's decision, not the user's. It is a one-way operation.

**Stage 2: User Decrypts Off-Chain via KMS.**

The user's frontend requests decryption through the Relayer SDK. The SDK contacts the KMS. Multiple KMS nodes each partially decrypt with their key share using threshold decryption. The partial decryptions are combined to produce the final plaintext and a cryptographic signature proving correct decryption.

**Stage 3: User Submits Cleartext On-Chain.**

```solidity
function processDecryption(uint64 clearValue, bytes calldata sig) public {
    FHE.checkSignatures(encryptedHandle, clearValue, sig);
    // clearValue is now verified and trustworthy
}
```

FHE.checkSignatures verifies the cleartext matches the actual decryption of the ciphertext, the KMS signature is valid, and the decryption was not tampered with.

### What to Decrypt vs. Keep Encrypted

Decrypt: user's own balance, auction winner, vote totals, game outcomes. Users need these to interact with the application.

Keep encrypted forever: losing bids, individual votes, intermediate computation values, other users' data. There is no reason to expose these.

The principle: decrypt the absolute minimum necessary for the application to function.

### Deprecated Patterns

Gateway.requestDecryption() and GatewayCaller from v0.7 are deprecated. The v0.9 self-relaying model reduces trust assumptions by putting users in control.

---

## Lesson 3.2 - Advanced FHE.select Patterns

### Tiered Pricing

Implement different prices based on encrypted quantity:

```solidity
ebool isTier1 = FHE.gt(quantity, 100);
ebool isTier2 = FHE.gt(quantity, 50);
euint32 price = FHE.select(isTier1, FHE.asEuint32(5),
    FHE.select(isTier2, FHE.asEuint32(8), FHE.asEuint32(10)));
euint32 total = FHE.mul(quantity, price);
```

The outer select checks tier 1. If false, the inner select checks tier 2. All prices are computed, but only the correct one is selected. Nobody knows which tier was applied.

### Min/Max Clamping

Ensure values stay within bounds:

```solidity
euint32 clamped = FHE.max(FHE.min(value, maxVal), minVal);
```

### Multi-Condition Logic

Combine boolean operations with select:

```solidity
ebool highSales = FHE.gt(sales, 1000);
ebool highExp = FHE.gt(experience, 5);
ebool bothHigh = FHE.and(highSales, highExp);
ebool eitherHigh = FHE.or(highSales, highExp);
euint32 bonus = FHE.select(bothHigh, FHE.asEuint32(20),
    FHE.select(eitherHigh, FHE.asEuint32(10), FHE.asEuint32(5)));
```

### Performance Consideration

Both branches always execute. Keep computational costs balanced between branches. If one branch is very expensive and rarely needed, consider restructuring.

---

## Lesson 3.3 - On-Chain Randomness with FHE

### The Problem with Current Randomness

Block-based randomness like block.timestamp or block.prevrandao can be influenced by miners and validators. Commit-reveal schemes require multiple transactions and can be gamed. Chainlink VRF provides verifiable randomness, but the random number is eventually revealed on-chain. Everyone can see it.

### FHE Randomness: Encrypted and Unpredictable

FHEVM generates random numbers that stay encrypted:

```solidity
euint8 randomByte = FHE.randEuint8();     // Random 0-255
euint16 randomShort = FHE.randEuint16();  // Random 0-65535
euint32 randomWord = FHE.randEuint32();   // Random 0-4294967295
euint64 randomLong = FHE.randEuint64();   // Random 0-18446744073709551615
```

The random value is encrypted. Nobody, not the contract, not the user, not the validator, can see it. It exists only as an encrypted value usable in FHE operations.

The randomness comes from the coprocessor's random number generator, not blockchain state. It cannot be predicted or influenced. It stays secret unless the contract explicitly decrypts it. And it is composable with all FHE operations.

### Constraining Ranges

```solidity
// Dice roll: 1-6
euint8 random = FHE.randEuint8();
euint8 dice = FHE.add(FHE.rem(random, 6), 1);
FHE.allowThis(dice);
```

### Use Cases

Card dealing where nobody can see dealt cards, not even the dealer. Lottery numbers that exist but are hidden until draw time. Game treasures at secret positions on a map. Any application needing secret randomness.

### Comparison with Chainlink VRF

Chainlink VRF is verifiable and unpredictable but the random number becomes public on-chain and requires two transactions (request plus callback). FHE randomness is verifiable, unpredictable, AND secret. It works in a single transaction with no external dependency. If you need randomness nobody can see, FHE is the only option.

---

## Lesson 3.4 - Frontend Integration

### The Full-Stack Flow

Connect wallet, encrypt input, send transaction, decrypt result, display to user. The frontend code is 90% identical to standard Web3 development.

### Creating the FHEVM Instance

```javascript
import { createInstance } from "@zama-fhe/relayer-sdk";
const fhevmInstance = await createInstance({ chainId: 11155111 });
```

Create this once per session. The instance manages the FHE public key internally.

### Encrypting Inputs

```javascript
const input = fhevmInstance.createEncryptedInput(contractAddress, userAddress);
input.addUint32(42);
const encrypted = await input.encrypt();
// encrypted.handles[0] is the encrypted value
// encrypted.inputProof is the zero-knowledge proof
```

createEncryptedInput binds encryption to the specific contract and user, preventing replay attacks.

### Sending Transactions

```javascript
const contract = new ethers.Contract(contractAddress, abi, signer);
const tx = await contract.add(encrypted.handles[0], encrypted.inputProof);
await tx.wait();
```

Standard ethers.js transaction, just with encrypted parameters.

### Decrypting Results

```javascript
const handle = await contract.getCount();
const cleartext = await fhevmInstance.decrypt(contractAddress, handle);
```

The user must have ACL permission. Without it, the KMS refuses decryption.

### Error Handling

Handle ACL permission failures gracefully. When a user tries to decrypt a value they do not have access to, show "Access denied" rather than crashing. Handle encryption failures by checking contract address and chain ID.

---

## Lesson 3.5 - Design Patterns: Auction and Voting

### Sealed-Bid Auction

This is the classic FHE application. Competitive bidding where nobody can see other bids.

**Bidding phase.** Users submit encrypted bids using externalEuint64 with proof. Nobody can see any bid amount. The contract compares each new bid against the current highest using FHE.gt and FHE.select to update the winner without revealing any amounts.

```solidity
function placeBid(externalEuint64 encBid, bytes calldata proof) public {
    euint64 bid = FHE.fromExternal(encBid, proof);
    bids[msg.sender] = bid;

    ebool isHigher = FHE.gt(bid, highestBid);
    highestBid = FHE.select(isHigher, bid, highestBid);
    highestBidder = FHE.select(isHigher, FHE.asEaddress(msg.sender), highestBidder);

    FHE.allowThis(highestBid);
    FHE.allowThis(highestBidder);
    FHE.allowThis(bids[msg.sender]);
    FHE.allow(bids[msg.sender], msg.sender);
}
```

**Evaluation.** The running comparison during bidding means the winner is already determined. endAuction marks winning bid and bidder for decryption using FHE.makePubliclyDecryptable.

**Revelation.** Only the winning bid amount and winner are decrypted. All losing bids remain encrypted FOREVER. The contract never calls makePubliclyDecryptable on losing bids.

### Private Voting

Demonstrates a different pattern: aggregating encrypted inputs and revealing only totals.

**Voting.** Each voter submits an encrypted boolean (yes/no). The contract converts it to an integer and adds to running totals.

```solidity
function vote(externalEbool encVote, bytes calldata proof) public {
    require(!hasVoted[msg.sender], "Already voted");
    hasVoted[msg.sender] = true;

    ebool voteValue = FHE.fromExternal(encVote, proof);
    euint32 voteAsInt = FHE.select(voteValue, FHE.asEuint32(1), FHE.asEuint32(0));
    yesVotes = FHE.add(yesVotes, voteAsInt);
    totalVotes = FHE.add(totalVotes, 1);

    FHE.allowThis(yesVotes);
    FHE.allowThis(totalVotes);
}
```

**Revelation.** Only yesVotes and totalVotes are decrypted. Individual votes remain encrypted forever. The public learns the outcome but never learns how any individual voted.

### Common Principle: Minimal Revelation

Both patterns follow the same principle. Decrypt only the minimum information needed for the application to function. In auctions, users need the winner and winning bid. In voting, users need the totals. Everything else stays encrypted permanently. These patterns demonstrate capabilities impossible with any other privacy technology because only FHE computes across multiple parties' encrypted data.

---

## Week 3 Homework: Sealed-Bid Auction dApp

Build a complete sealed-bid auction with smart contract and React frontend.

Contract: placeBid with encrypted amounts, endAuction to determine winner via FHE comparisons, revealWinner to mark for decryption via makePubliclyDecryptable. Losing bids never exposed. One bid per address. Time-based auction end.

Frontend: wallet connection, encrypt bid with Relayer SDK, submit encrypted bid, view auction status, reveal winner after auction ends.

Tests: at least 3 scenarios covering multiple bidders, correct winner, and losing bid privacy.

Grading: Contract Logic 25%, Bid Privacy 20%, Decryption Flow 20%, Frontend 20%, Documentation 15%. Passing score: 70%.

---

## Week 3 Key Takeaways

1. Data stays encrypted by default. Decryption requires explicit contract action via FHE.makePubliclyDecryptable().
2. v0.9 self-relaying: contract marks, user decrypts via KMS, user submits proof on-chain with FHE.checkSignatures().
3. Chain FHE.select for tiered pricing, clamping, and multi-condition business logic. Both branches always execute.
4. FHE randomness is both unpredictable AND secret. Unlike Chainlink VRF, the value stays encrypted.
5. Frontend integration adds encryption before sending and decryption after reading to standard Web3 code.
6. Sealed-bid auctions use FHE.gt plus FHE.select to compare bids without revealing. Losing bids stay encrypted forever.
7. Private voting accumulates encrypted votes with FHE.add and reveals only totals.
8. The principle: decrypt the absolute minimum necessary. Everything else stays encrypted permanently.
