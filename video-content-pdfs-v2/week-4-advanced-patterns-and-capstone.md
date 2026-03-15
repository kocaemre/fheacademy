# Week 4: Advanced Patterns and Capstone Project

## Introduction

Welcome to Week 4 of FHE Academy, the final week. This week focuses on production readiness. You will learn gas optimization strategies, security best practices, how FHE enables revolutionary DeFi applications, comprehensive testing strategies, and testnet deployment. You will then design and build your own capstone confidential dApp. Estimated time: 14-16 hours.

---

## Lesson 4.1 - Gas Optimization for FHE

### Why Gas Optimization Is Essential

FHE operations are 10 to 1000 times more expensive than standard EVM operations. A single FHE addition can cost as much as deploying a small contract. Gas optimization is not a nice-to-have. It is an absolute necessity.

### Gas Cost by Type: Exponential Scaling

Gas scales roughly exponentially with type size. Starting from the cheapest: ebool, then euint8, euint16, euint32, euint64, euint128, and finally euint256 as the most expensive. An operation on euint256 can cost 10 to 50 times more than the same operation on euint8.

### Gas Cost by Operation

From cheapest to most expensive: bitwise operations (NOT, AND, OR, XOR) are cheapest. Then addition and subtraction. Then comparisons (EQ, NE, LT, GT). Multiplication is high cost. Division and remainder are highest. SELECT is expensive because it computes both branches.

### 5 Optimization Strategies

**Strategy 1: Use plaintext operands.** FHE.add(count, 1) is cheaper than FHE.add(count, FHE.asEuint32(1)). The plaintext form avoids creating an additional ciphertext. Apply everywhere: add, sub, mul, comparisons, min, max.

**Strategy 2: Use the smallest type that fits.** This is the most impactful optimization. Percentages (0-100) should use euint8. Token balances should use euint64. Only use euint256 when absolutely necessary. Review every encrypted variable and ask what is the maximum value it will ever hold.

**Strategy 3: Minimize FHE operations per transaction.** Each operation has significant cost. Avoid redundant computations. Compute a comparison once and reuse it. Do not compute the same FHE.gt twice.

**Strategy 4: Batch operations.** If multiple state updates share the same condition, compute the condition once and reuse.

```solidity
ebool hasEnough = FHE.ge(balances[from], amount);
balances[from] = FHE.select(hasEnough, FHE.sub(balances[from], amount), balances[from]);
balances[to] = FHE.select(hasEnough, FHE.add(balances[to], amount), balances[to]);
```

One comparison, two updates. Not two comparisons.

**Strategy 5: Avoid unnecessary re-encryption.** Do not convert plaintext to encrypted unless needed. Do not add encrypted zero. Do not re-encrypt unchanged values.

Applying all five strategies together can reduce gas consumption by over 90%.

---

## Lesson 4.2 - Security Best Practices

### The 6-Point Security Audit Checklist

**1. ACL on every state change.** For every line assigning to an encrypted state variable, verify FHE.allowThis() follows immediately. Missing it causes permanent data loss.

**2. Overflow protection with FHE.select.** FHE arithmetic does not auto-revert on overflow. Every subtraction needs FHE.ge guard. Every addition needs limit check where applicable.

**3. FHE.isInitialized() checks.** Before the first operation on encrypted state, check initialization to prevent undefined behavior.

**4. Proper encrypted input validation.** Every function accepting encrypted inputs must use FHE.fromExternal() with a valid proof. Never skip proof validation.

**5. Secure decryption with FHE.checkSignatures().** When processing self-relayed decryption results, always verify. Without verification, users could submit fake cleartext.

**6. No sensitive data in events or revert strings.** Events and reverts are publicly visible. An event with an encrypted handle or a revert saying "Insufficient balance" leaks information about encrypted state.

### Side-Channel Attacks

Even with perfect encryption, information can leak through metadata.

**Transaction pattern analysis.** Observers watch when you transact, how often, and with whom. Patterns reveal behavior even without seeing amounts.

**Gas usage analysis.** Different branches of FHE.select might have different internal costs. Keep both branches balanced.

**State change observation.** Observing which storage slots change reveals information about contract logic flow. Consider updating all relevant variables in every transaction using FHE.select to keep unchanged values the same.

### Re-encryption Protection

The ACL system prevents attackers from using handles they obtain. Even with a handle, without ACL permission they cannot decrypt or use it. The ZKPoK on inputs prevents replaying someone else's encrypted value. The key risk: contracts that accidentally grant too-broad ACL permissions.

### Complete Audit Procedure

Map all encrypted state variables. Trace every assignment. Verify ACL after each. Check overflow protection on every subtraction. Verify all inputs use FHE.fromExternal. Review events for leaked information. Review reverts for leaked information. Check initialization. Review ACL scope. Assess side channels.

---

## Lesson 4.3 - Confidential DeFi Concepts

FHE does not just add privacy to existing DeFi. It enables fundamentally new financial primitives impossible with any other technology.

### Confidential AMMs (Automated Market Makers)

Current AMMs like Uniswap expose all reserves revealing the exact exchange rate, and all swap amounts enabling sandwich attacks. MEV bots extract billions annually.

With encrypted reserves and swap amounts, front-running becomes impossible. Bots cannot see the size of pending swaps, the current exchange rate, or the resulting price impact. The constant product formula runs entirely on encrypted data.

### Confidential Lending

Current lending protocols expose exact collateral amounts and liquidation thresholds. This enables liquidation sniping where bots compete to liquidate positions.

With encrypted collateral and hidden health factors, nobody can predict when positions become liquidatable. The protocol computes health factors internally using FHE, but external observers cannot predict or front-run liquidations.

### Encrypted Order Books

On-chain order books expose all pending orders, strategies, and market depth. Traders exploit this through front-running and manipulation.

With encrypted orders, both price and quantity are hidden. The matching engine compares encrypted prices using FHE.gt and FHE.lt. When prices cross, trades execute automatically. True price discovery without information leakage.

### Private Stablecoins

Every USDC and DAI transaction reveals sender, receiver, and amount. With FHE, balances are encrypted, transfers are hidden, and programmable decryption rules control who sees what. Users always see their own balance. Regulators can be granted access if required. Nobody else sees anything.

### Why Only FHE

The unique capability is cross-party computation on encrypted data. TEEs decrypt inside enclaves, losing privacy if hardware is compromised. ZKPs prove facts about data but cannot compute across multiple parties' secrets. Only FHE can match encrypted orders from different users, compare encrypted bids from different bidders, and add encrypted votes from different voters, all without revealing any individual data.

---

## Lesson 4.4 - Testing Strategies

### Four Test Categories

**Functional tests.** Verify core logic works with encrypted data. Test both success paths and silent failure paths. In FHEVM, failed operations do not revert. They silently keep values unchanged. You must explicitly verify this.

```typescript
// Verify failed transfer leaves balances unchanged
const senderBefore = await decrypt(balances[sender]);
await transferEncrypted(sender, receiver, senderBefore + 100); // More than balance
const senderAfter = await decrypt(balances[sender]);
expect(senderAfter).to.equal(senderBefore); // Unchanged
```

**Permission tests.** Verify authorized users can decrypt AND unauthorized users are blocked. Test both positive and negative cases.

```typescript
// Owner can decrypt their balance
const balance = await decrypt(balances[user1], user1.address);
expect(balance).to.be.greaterThan(0);

// Other user CANNOT decrypt
await expect(decrypt(balances[user1], user2.address)).to.be.rejected;
```

**Edge case tests.** Cover zero-value operations, maximum values for the type, uninitialized state before any writes, double initialization, and operations on fresh contracts.

**Integration tests.** Multi-user scenarios, sequential transactions, complete workflows. Test a full auction lifecycle: multiple bids, end auction, verify correct winner, verify losing bids stay encrypted.

### FHEVM-Specific Patterns

Verify unchanged state on failed operations. This is unique to FHEVM because failures are silent.

Verify ACL isolation between users. Each user should only decrypt their own data, never another user's.

### CI/CD Integration

Hardhat tests with mock mode run in GitHub Actions with no special configuration. Mock mode activates automatically. No FHE infrastructure needed in CI.

---

## Lesson 4.5 - Deployment to Testnet

### From Mock Mode to Real Network

Moving to Sepolia means real FHE computation with real costs. The deployment script is nearly identical to standard Hardhat.

Configure hardhat.config.ts with a Sepolia network entry using your RPC URL and private key from environment variables. Never commit private keys.

Your contract inherits SepoliaZamaFHEVMConfig which auto-configures the coprocessor, ACL, and KMS addresses based on the chain ID. No manual configuration needed.

Deploy with: npx hardhat run scripts/deploy.ts --network sepolia

### Key Differences from Mock Mode

Transactions are significantly slower because real FHE computation happens in the coprocessor. Gas costs are much higher because FHE operations are computationally expensive. Encryption is real. Values cannot be read from blockchain state. Decryption requires the KMS threshold process with multiple nodes cooperating.

### Deployment Checklist

All tests pass in mock mode. Security audit checklist completed. Gas optimization applied. Environment variables configured with .env in gitignore. Contract inherits SepoliaZamaFHEVMConfig. Sufficient Sepolia ETH for deployment and testing.

After deployment, verify your contract on Etherscan for transparency.

---

## Capstone Project: Build Your Own Confidential dApp

Design and build an original confidential dApp demonstrating mastery of all course concepts.

### Project Options

**Option 1: Confidential Voting System.** Encrypted vote submission, private accumulation, time-locked result revelation, voter eligibility checks, React frontend.

**Option 2: Private Token Swap.** Encrypted order submission with price and quantity, encrypted matching, automatic execution when prices cross, no front-running possible.

**Option 3: Encrypted Credentials and DID.** Encrypted credential storage, selective disclosure using FHE.select and ACL, verifiable claims without revealing data, multi-party verification.

**Option 4: Privacy-Preserving Game.** Encrypted game state, FHE randomness for secret events, fair play enforcement, multi-player with individual encrypted views.

Or propose your own original idea.

### Requirements

Smart contract deployed on Sepolia or working in mock mode. Minimum 3 different FHE operations. Proper ACL management. Overflow protection. Test suite with minimum 5 cases covering all four categories. React frontend with wallet connection, encrypted input, and decryption display. README with architecture overview, setup instructions, FHEVM features used.

### Grading

Originality 20%, Technical Correctness 25%, FHEVM Feature Depth using 5 or more features 20%, Documentation 15%, Presentation 20%. Passing score: 70%.

Use at least 5 of: encrypted types, FHE arithmetic, comparisons, FHE.select, ACL management, encrypted inputs with proofs, decryption with makePubliclyDecryptable, FHE randomness, type casting, isInitialized checks.

Projects are manually reviewed by the FHE Academy team. Feedback via email. Passing earns an NFT completion certificate.

---

## Week 4 Key Takeaways

1. FHE operations cost 10-1000x more gas than standard EVM. Applying all 5 optimization strategies can reduce gas by 90%+.
2. The 6-point security checklist: ACL, overflow, initialization, inputs, decryption verification, no leaky events/reverts.
3. Side channels can leak information even with perfect encryption. Watch transaction patterns, gas usage, and state changes.
4. FHE enables new DeFi primitives impossible with other tech: confidential AMMs, lending, order books, stablecoins.
5. Only FHE can compute across multiple parties' encrypted data. This is its unique advantage over TEE and ZKP.
6. FHEVM testing needs 4 categories: functional, permission, edge case, integration. Failed operations are silent.
7. Testnet deployment is nearly identical to standard Hardhat. ZamaEthereumConfig auto-configures by chain ID.
8. The capstone project demonstrates mastery of the complete FHEVM stack from contract to frontend to deployment.
