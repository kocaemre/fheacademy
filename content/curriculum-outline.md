# FHE Academy -- Complete Curriculum Outline

> **4-Week FHEVM Developer Bootcamp**
> 20 Lessons | 4 Homework Assignments | 1 Capstone Project

**Total Duration:** ~50 hours of learning content
**Target Audience:** Web3 developers with basic Ethereum/Solidity knowledge, no prior FHE experience required
**Teaching Philosophy:** "Migration Mindset" -- every lesson shows the transformation from familiar Solidity patterns to their FHEVM encrypted equivalents

---

## Week 1: From Solidity to Confidential Solidity

**Week Goal:** Bridge from familiar Solidity to FHEVM. Set up the development environment and write the first encrypted contract.

**Estimated Time:** 8-10 hours

---

### Lesson 1.1 -- Why Privacy Matters On-Chain

**Duration:** 45 minutes | **Type:** Conceptual

**Learning Objectives:**
- Understand why public blockchains have a privacy problem
- Identify real-world consequences of transparent state (MEV, front-running, competitive intelligence leaks)
- Understand the GDPR vs public ledger tension
- Compare privacy solutions: TEE vs ZKP vs FHE

**Key Code Concepts:**
- No code in this lesson -- purely conceptual foundation
- Public blockchain transparency (Etherscan as demonstration)
- FHE advantage: compute on encrypted data without decrypting

**Quiz Topic Ideas:**
- Difference between ZKP (proves statements) and FHE (computes on encrypted data)
- Why traditional encryption cannot solve blockchain privacy (requires decryption before computation)
- Real-world impact of MEV on DeFi users

---

### Lesson 1.2 -- Zama Ecosystem Overview

**Duration:** 45 minutes | **Type:** Conceptual

**Learning Objectives:**
- Map out Zama's technology stack (TFHE-rs, FHEVM, Concrete ML, Zama Protocol)
- Understand the FHEVM architecture (symbolic execution + coprocessor model)
- Know the role of each component: coprocessor, KMS, relayer
- Understand that FHE computation happens off-chain on coprocessor nodes, not on the EVM

**Key Code Concepts:**
- Symbolic execution: `FHE.add(a, b)` produces a handle (pointer), coprocessor performs actual FHE
- Threshold decryption via MPC (Multi-Party Computation) using KMS nodes
- Handle-based architecture: EVM works with `bytes32` handles, not ciphertexts

**Quiz Topic Ideas:**
- Where does actual FHE computation happen when a contract calls `FHE.add(a, b)`? (Coprocessor nodes)
- Why does KMS use multiple nodes for decryption? (Threshold MPC -- no single point of trust)

---

### Lesson 1.3 -- Development Environment Setup

**Duration:** 60 minutes | **Type:** Hands-on

**Learning Objectives:**
- Set up a Hardhat project with the FHEVM plugin
- Understand fhevm-mocks and why development uses mock mode
- Successfully compile an FHEVM contract
- Configure `hardhat.config.ts` for FHEVM development

**Key Code Concepts:**
- `npm install @fhevm/solidity` -- Solidity library
- Hardhat FHEVM plugin configuration
- Mock mode: simulates all FHE operations locally with the same API
- Import verification: `import { FHE } from "@fhevm/solidity/lib/FHE.sol";`

**Quiz Topic Ideas:**
- Why develop in mock mode instead of directly on testnet? (Faster, no gas costs, same API)
- What does fhevm-mocks simulate? (All FHE operations using plaintext under the hood)

---

### Lesson 1.4 -- Your First FHEVM Contract: Counter Migration

**Duration:** 90 minutes | **Type:** Hands-on (Core Lesson)

**Learning Objectives:**
- Migrate a standard Solidity counter contract to FHEVM step-by-step
- Understand encrypted types (`euint32`) and encrypted operations (`FHE.add`, `FHE.sub`)
- Implement ACL permissions (`FHE.allow`, `FHE.allowThis`)
- Handle encrypted inputs (`externalEuint32` + `inputProof`)

**Key Code Concepts:**
- `import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";`
- `contract FHECounter is ZamaEthereumConfig { ... }`
- `FHE.fromExternal(inputEuint32, inputProof)` -- validate ZKPoK
- `FHE.add(_count, evalue)` -- encrypted addition
- `FHE.allowThis(_count)` + `FHE.allow(_count, msg.sender)` -- ACL pattern
- CodeDiff: vanilla Counter.sol vs FHECounter.sol side-by-side

**Quiz Topic Ideas:**
- Why call `FHE.allowThis(_count)` after modifying `_count`? (Contract needs permission to use new handle)
- What does `FHE.fromExternal()` do? (Verifies ZKPoK + converts external input to on-chain type)
- Why can't `require(_count >= value)` work in FHEVM? (Both values encrypted -- cannot evaluate as plaintext)

---

### Lesson 1.5 -- Testing Your FHEVM Contract

**Duration:** 60 minutes | **Type:** Hands-on

**Learning Objectives:**
- Write Hardhat tests for FHEVM contracts using fhevm test helpers
- Use `createEncryptedInput()` and `userDecryptEuint()` in tests
- Understand the handle concept (`bytes32` vs plaintext values)

**Key Code Concepts:**
- `fhevm.createEncryptedInput(contractAddress, signerAddress)` -- create test encrypted input
- `fhevm.userDecryptEuint(FhevmType.euint32, handle, contractAddress, signer)` -- decrypt in tests
- Handle comparison: two handles pointing to the same plaintext are NOT equal
- `ethers.ZeroHash` indicates an uninitialized encrypted variable

**Quiz Topic Ideas:**
- Can you compare two encrypted handles directly to check if they hold the same value? (No -- handles are opaque pointers)
- What is the role of `userDecryptEuint` in testing? (Mock-mode only helper that decrypts for assertions)

---

### Homework 1: Temperature Converter Migration

**Objective:** Migrate a classical TemperatureConverter contract to FHEVM.

**Key Requirements:**
- Replace `uint32` with `euint32` for all state variables
- Accept encrypted Celsius input via `externalEuint32` + `inputProof`
- Perform conversion using `FHE.mul`, `FHE.div` (plaintext divisor), and `FHE.add`
- Set proper ACL permissions (`FHE.allowThis` + `FHE.allow`)
- Write comprehensive tests using fhevm helpers

**Rubric Criteria and Weights:**

| Criteria | Weight |
|----------|--------|
| Compilation (compiles with zero warnings) | 20% |
| Encrypted Types (all types correctly migrated) | 30% |
| ACL Permissions (allowThis + allow correctly placed) | 20% |
| Tests (conversion tests + edge cases + permissions) | 30% |

**Passing Score:** 70% overall

---

## Week 2: Mastering Encrypted Types and Access Control

**Week Goal:** Deep dive into FHEVM's type system, all operations, and the ACL mechanism. Build a real confidential token.

**Estimated Time:** 10-12 hours

---

### Lesson 2.1 -- Encrypted Types Deep Dive

**Duration:** 60 minutes | **Type:** Conceptual + Hands-on

**Learning Objectives:**
- Know all FHEVM encrypted types and when to use each
- Understand gas cost implications of type size (smaller = cheaper)
- Perform casting between encrypted types (upcasting vs downcasting)

**Key Code Concepts:**
- Complete type catalog: `ebool`, `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `euint256`, `eaddress`
- External input types: `externalEbool`, `externalEuint8` ... `externalEuint256`, `externalEaddress`
- `FHE.asEuint32(plaintext)` -- trivial encryption
- `FHE.asEuint64(euint32Value)` -- upcast (safe)
- `FHE.asEuint8(euint32Value)` -- downcast (truncates upper bits)
- NOTE: `ebytesXXX` types do NOT exist -- removed in v0.7

**Quiz Topic Ideas:**
- Which encrypted type should you use for token balances? (`euint64`)
- What happens when you downcast `euint32` to `euint8`? (Upper bits are truncated/lost)
- Why is `euint256` discouraged for most use cases? (Exponentially more expensive FHE operations)

---

### Lesson 2.2 -- Operations on Encrypted Data

**Duration:** 75 minutes | **Type:** Conceptual + Hands-on

**Learning Objectives:**
- Use all arithmetic, comparison, and bitwise FHE operations
- Understand the critical paradigm shift: no `if/else` with encrypted conditions
- Master `FHE.select` for encrypted branching

**Key Code Concepts:**
- Arithmetic: `FHE.add`, `FHE.sub`, `FHE.mul`, `FHE.min`, `FHE.max`, `FHE.neg`
- Division/remainder: `FHE.div(a, plaintextB)`, `FHE.rem(a, plaintextB)` -- PLAINTEXT divisor only
- Comparison: `FHE.eq`, `FHE.ne`, `FHE.lt`, `FHE.le`, `FHE.gt`, `FHE.ge` -- all return `ebool`
- Bitwise: `FHE.and`, `FHE.or`, `FHE.xor`, `FHE.not`, `FHE.shl`, `FHE.shr`, `FHE.rotl`, `FHE.rotr`
- `FHE.select(condition, ifTrue, ifFalse)` -- both branches always execute

**Quiz Topic Ideas:**
- Why can't you use `if (FHE.ge(balance, amount))` in FHEVM? (`ebool` cannot be evaluated in `if`)
- What is the FHEVM equivalent of `condition ? a : b`? (`FHE.select(condition, a, b)`)
- Can you divide an encrypted value by another encrypted value? (No -- plaintext divisor only)

---

### Lesson 2.3 -- Encrypted Inputs and ZKPoK

**Duration:** 60 minutes | **Type:** Conceptual + Hands-on

**Learning Objectives:**
- Understand the full encrypted input lifecycle (client encrypt -> ZKPoK -> on-chain validate)
- Implement functions that accept `externalEuintX` + `inputProof`
- Know what ZKPoK proves and why it is necessary

**Key Code Concepts:**
- Off-chain: SDK encrypts plaintext, generates ZKPoK proof
- On-chain: `FHE.fromExternal(externalEuint32, inputProof)` validates proof and converts
- `externalEuint32` type for function parameters
- `bytes calldata inputProof` -- the ZKPoK
- Proof prevents replay attacks (ciphertext bound to contract + sender)

**Quiz Topic Ideas:**
- What would happen without ZKPoK verification? (Replay attacks -- reuse someone else's ciphertext)
- What is the purpose of `bytes calldata inputProof`? (ZKPoK proving the caller encrypted this value)
- At what stage does encryption happen? (Off-chain, in the user's browser via SDK)

---

### Lesson 2.4 -- Access Control List (ACL) System

**Duration:** 75 minutes | **Type:** Conceptual + Hands-on

**Learning Objectives:**
- Master the ACL system -- the most critical FHEVM security concept
- Know when to use `FHE.allow` vs `FHE.allowThis` vs `FHE.allowTransient`
- Design proper permission flows for multi-party scenarios (token transfers, auctions)

**Key Code Concepts:**
- `FHE.allowThis(handle)` -- contract grants itself access (after every state mutation)
- `FHE.allow(handle, address)` -- grant specific address permanent access
- `FHE.allowTransient(handle, address)` -- temporary access (within transaction only)
- Permission patterns: token balance (contract + owner), auction bid (contract + bidder), multi-sig
- Method chaining: `using FHE for *; ciphertext.allowThis().allow(msg.sender);`

**Quiz Topic Ideas:**
- What happens if you forget `FHE.allowThis()` after `FHE.add()`? (Contract cannot use the result next time)
- What is the difference between `FHE.allow` and `FHE.allowTransient`? (Permanent vs single-transaction access)
- Do ACL permissions transfer when a ciphertext is updated? (No -- new handle needs new permissions)

---

### Lesson 2.5 -- Patterns and Best Practices

**Duration:** 45 minutes | **Type:** Conceptual

**Learning Objectives:**
- Implement overflow/underflow protection with `FHE.select`
- Use `FHE.isInitialized()` to check handle state before operations
- Apply defensive programming patterns for FHEVM contracts

**Key Code Concepts:**
- Safe transfer pattern: `FHE.select(FHE.ge(balance, amount), FHE.sub(balance, amount), balance)`
- Initialization check: `require(FHE.isInitialized(_count), "Not initialized")`
- Defensive rules: (1) check init, (2) use FHE.select for conditionals, (3) set ACL after every change, (4) use smallest type, (5) minimize FHE operations per tx

**Quiz Topic Ideas:**
- How do you protect against underflow in FHEVM? (`FHE.select` with `FHE.ge` check)
- What does `FHE.isInitialized(handle)` return for a freshly declared `euint32`? (false)

---

### Homework 2: Confidential ERC-20 Token

**Objective:** Build a full confidential ERC-20 token with encrypted balances.

**Key Requirements:**
- `mapping(address => euint64)` for balances
- `mint()`: accept encrypted amount, add to sender's balance
- `transfer()`: encrypted amount transfer with overflow protection via `FHE.select`
- `balanceOf()`: returns encrypted handle (only token owner can decrypt)
- `approve()` + `transferFrom()`: encrypted allowance system
- Proper ACL: only token owner can decrypt their own balance
- Comprehensive test suite

**Rubric Criteria and Weights:**

| Criteria | Weight |
|----------|--------|
| ERC-20 Interface (all standard functions adapted for FHE) | 15% |
| Encrypted Balance (proper euint64 usage) | 25% |
| ACL Permissions (perfect permission flow) | 25% |
| Overflow Protection (FHE.select guard on arithmetic) | 15% |
| Test Coverage (mint, transfer, approve, edge cases, ACL) | 20% |

**Passing Score:** 70% overall

---

## Week 3: Building Real-World Confidential dApps

**Week Goal:** Move from contracts to full dApps. Decryption, frontend integration, and real design patterns.

**Estimated Time:** 12-14 hours

---

### Lesson 3.1 -- Decryption Mechanism (v0.9 Self-Relaying)

**Duration:** 75 minutes | **Type:** Conceptual + Hands-on

**Learning Objectives:**
- Understand the v0.9 self-relaying decryption model (user-driven, not Oracle-driven)
- Know when to decrypt vs keep encrypted
- Implement the full decryption flow: mark publicly decryptable, off-chain decrypt, submit proof

**Key Code Concepts:**
- On-chain: `FHE.makePubliclyDecryptable(handle)` -- marks ciphertext for public decryption
- Off-chain: `@zama-fhe/relayer-sdk` `createInstance()` + `publicDecrypt([handles])`
- On-chain callback: `FHE.checkSignatures(requestId, cleartexts, decryptionProof)` -- verify KMS proof
- Design decision framework: decrypt for (user balance, auction winner, vote totals), keep encrypted for (intermediate values, other users' data)
- NOTE: The old Oracle-based pattern (`Gateway.requestDecryption`, `GatewayCaller`) is eliminated in v0.9

**Quiz Topic Ideas:**
- In v0.9, who performs the actual decryption? (The user, via relayer SDK off-chain, not an Oracle)
- What does `FHE.makePubliclyDecryptable()` do? (Marks ciphertext so anyone can request decryption via relayer SDK)
- Why does the user submit a proof with the decrypted value? (Proves KMS performed the decryption correctly)

---

### Lesson 3.2 -- Conditional Logic with FHE.select

**Duration:** 60 minutes | **Type:** Hands-on

**Learning Objectives:**
- Implement complex business logic using encrypted branching
- Chain multiple `FHE.select` calls for nested conditions
- Understand performance implications (both branches always computed)

**Key Code Concepts:**
- `FHE.select(condition, ifTrue, ifFalse)` deep dive
- Min/max clamping: `FHE.select(FHE.gt(value, max), max, value)`
- Conditional transfer: only if sufficient balance
- Tiered pricing: different rates based on encrypted amount ranges
- Chaining: `result = FHE.select(cond1, FHE.select(cond2, a, b), c)`

**Quiz Topic Ideas:**
- In `FHE.select(cond, a, b)`, if `cond` is true, is `b` still computed? (Yes -- both branches always execute)
- How would you implement encrypted min(x, y)? (`FHE.select(FHE.lt(x, y), x, y)`)

---

### Lesson 3.3 -- On-Chain Randomness

**Duration:** 45 minutes | **Type:** Hands-on

**Learning Objectives:**
- Generate encrypted random numbers on-chain using `FHE.randEuintX()`
- Understand why FHE randomness is superior to existing solutions (the value stays encrypted)
- Build basic random-based game logic

**Key Code Concepts:**
- `FHE.randEuint8()`, `FHE.randEuint16()`, `FHE.randEuint32()`, `FHE.randEuint64()`
- Random value is encrypted -- nobody (not even validators) can see or predict it
- Use cases: encrypted card dealing, private lottery, hidden game state
- Comparison with Chainlink VRF: VRF reveals the number; FHE keeps it secret until explicit decrypt

**Quiz Topic Ideas:**
- Who can see the value of `FHE.randEuint32()`? (Nobody until it is explicitly decrypted)
- How does FHE randomness differ from Chainlink VRF? (VRF reveals the random number; FHE keeps it encrypted)

---

### Lesson 3.4 -- Frontend Integration

**Duration:** 90 minutes | **Type:** Hands-on

**Learning Objectives:**
- Build a React frontend that interacts with FHEVM contracts
- Create encrypted inputs client-side using the relayer SDK
- Decrypt and display results in the UI

**Key Code Concepts:**
- `@zama-fhe/relayer-sdk` for encrypted input creation and decryption
- Flow: Connect wallet -> Create encrypted input -> Send transaction -> Read handle -> Decrypt -> Display
- Building a UI for the FHECounter contract
- Error handling: "no permission" errors when ACL is not set

**Quiz Topic Ideas:**
- What SDK do you use to encrypt values client-side? (`@zama-fhe/relayer-sdk`)
- What happens if you try to decrypt a handle you do not have ACL access to? (Decryption fails / no permission error)

---

### Lesson 3.5 -- Design Patterns: Auction and Voting

**Duration:** 75 minutes | **Type:** Conceptual + Hands-on

**Learning Objectives:**
- Implement the sealed-bid auction pattern
- Implement the private voting pattern
- Understand the difference between "hiding data" and "hiding computation"

**Key Code Concepts:**
- **Sealed-Bid Auction:** encrypted bids, `FHE.gt` + `FHE.select` to determine winner, only winning bid decrypted, losing bids remain encrypted forever
- **Private Voting:** encrypted votes (`externalEbool`), accumulate with `FHE.add`, reveal only totals via `FHE.makePubliclyDecryptable`, individual votes stay private
- `FHE.select` for winner determination without revealing individual bids
- ACL patterns for multi-party confidential interactions

**Quiz Topic Ideas:**
- In a sealed-bid auction, can losing bidders prove their bid amount? (No -- bids remain encrypted)
- How does the voting contract prevent vote buying? (Individual votes are never decrypted -- only the total)
- What function is used to tally encrypted votes? (`FHE.add` to accumulate, `FHE.select` for conditional counting)

---

### Homework 3: Sealed-Bid Auction dApp

**Objective:** Build a complete sealed-bid auction with smart contract + React frontend.

**Key Requirements:**
- Smart contract: `placeBid()` (encrypted bid), `endAuction()` (compare bids, determine winner), `revealWinner()` (decrypt winning bid via self-relaying pattern)
- Losing bids remain encrypted forever
- React frontend: connect wallet, encrypt bid, submit, view auction status, reveal winner
- At least 3 test scenarios

**Rubric Criteria and Weights:**

| Criteria | Weight |
|----------|--------|
| Contract Logic (all functions work, edge cases handled) | 25% |
| Bid Privacy (losing bids never exposed, ACL correct) | 20% |
| Decryption Flow (self-relaying pattern, proper proof verification) | 20% |
| Frontend (full flow works, good UX) | 20% |
| Documentation (README, inline comments, architecture notes) | 15% |

**Passing Score:** 70% overall

---

## Week 4: Advanced Patterns and Capstone Project

**Week Goal:** Production readiness. Gas optimization, security hardening, and a capstone project.

**Estimated Time:** 14-16 hours

---

### Lesson 4.1 -- Gas Optimization for FHE

**Duration:** 60 minutes | **Type:** Conceptual

**Learning Objectives:**
- Understand FHE operation costs relative to standard EVM operations
- Apply optimization strategies for FHEVM contracts
- Choose optimal encrypted type sizes for gas efficiency

**Key Code Concepts:**
- Cost hierarchy: `euint8` cheapest -> `euint256` most expensive; multiplication > addition
- Optimization strategies: minimize FHE ops per tx, use plaintext where possible (`FHE.add(encrypted, 1)` cheaper than adding two encrypted values), batch operations, use smallest type that fits
- Avoid unnecessary re-encryption
- Mixed plaintext/ciphertext arithmetic for efficiency

**Quiz Topic Ideas:**
- Which is cheaper: `FHE.add(a, b)` where b is encrypted, or `FHE.add(a, 1)` where 1 is plaintext? (Plaintext operand is cheaper)
- Why should you prefer `euint32` over `euint256` when 32 bits is sufficient? (Exponentially lower gas costs)

---

### Lesson 4.2 -- Security Best Practices

**Duration:** 75 minutes | **Type:** Conceptual

**Learning Objectives:**
- Conduct a security review of FHEVM contracts
- Identify common FHEVM-specific vulnerability patterns
- Build an audit checklist for encrypted smart contracts

**Key Code Concepts:**
- FHEVM security checklist: (1) ACL permissions on every state change, (2) overflow protection with `FHE.select`, (3) `FHE.isInitialized()` checks, (4) proper `externalEuint` + `inputProof` validation, (5) decryption proof verification with `FHE.checkSignatures`, (6) no sensitive data in event logs or revert messages
- Side-channel considerations: transaction patterns can leak information
- Re-encryption attack vectors

**Quiz Topic Ideas:**
- Why should revert messages not include encrypted values? (Revert messages are public -- would leak data)
- What side-channel information might transaction patterns reveal? (Timing, gas usage, and call patterns can hint at encrypted operations)

---

### Lesson 4.3 -- Confidential DeFi Concepts

**Duration:** 60 minutes | **Type:** Conceptual

**Learning Objectives:**
- Understand how FHEVM enables new DeFi paradigms
- Design confidential AMM and lending protocols (conceptual level)
- Explore encrypted order books and private stablecoins

**Key Code Concepts:**
- Confidential AMM: encrypted reserves, front-running immune swap execution
- Confidential Lending: hidden collateral amounts, private liquidation thresholds
- Encrypted Order Books: orders encrypted, matching on encrypted data without revealing prices
- Private Stablecoins: hidden balances, compliance via programmable decrypt rules

**Quiz Topic Ideas:**
- How does encrypted reserves prevent front-running in an AMM? (Swap amounts invisible to validators/bots)
- What advantage does FHE give lending protocols? (Hidden collateral amounts prevent liquidation hunting)

---

### Lesson 4.4 -- Testing Strategies

**Duration:** 60 minutes | **Type:** Hands-on

**Learning Objectives:**
- Write comprehensive test suites for FHEVM contracts
- Test edge cases specific to FHE (uninitialized handles, ACL violations, overflow)
- Set up CI/CD for FHEVM projects

**Key Code Concepts:**
- Test categories: functional, permission (ACL), edge cases (uninitialized, overflow), integration
- Mock mode vs testnet testing strategies
- CI/CD with GitHub Actions + Hardhat FHEVM plugin
- Testing ACL: verify unauthorized addresses cannot decrypt

**Quiz Topic Ideas:**
- What happens if you test operations on an uninitialized `euint32`? (Undefined behavior -- always check `FHE.isInitialized`)
- How do you test that an unauthorized address cannot decrypt? (Call decrypt as non-permitted address, expect revert/failure)

---

### Lesson 4.5 -- Deployment to Testnet

**Duration:** 60 minutes | **Type:** Hands-on

**Learning Objectives:**
- Deploy an FHEVM contract to Ethereum Sepolia testnet
- Configure `ZamaEthereumConfig` for testnet deployment
- Interact with a deployed FHEVM contract using the relayer SDK

**Key Code Concepts:**
- `ZamaEthereumConfig` auto-resolves coprocessor by `chainId` (works for all Zama-supported networks)
- Hardhat deployment script with FHEVM configuration
- Interacting with deployed contracts via `@zama-fhe/relayer-sdk`
- Verifying contracts on block explorer

**Quiz Topic Ideas:**
- Why does `ZamaEthereumConfig` work on both testnet and mainnet? (Auto-resolves configuration by `chainId`)
- What is the difference between mock mode and testnet execution? (Mock is instant/local; testnet uses real coprocessor and KMS)

---

### Homework 4 / Capstone: Student-Chosen Confidential dApp

**Objective:** Design, build, and deploy your own confidential dApp using FHEVM.

**Key Requirements:**
- Choose one category: Confidential Voting System, Private Token Swap, Encrypted Credentials/DID, or Privacy-Preserving Game
- Smart contract (deployed to testnet or working in mock mode)
- Test suite (minimum 5 test cases)
- Simple React frontend
- README with project description, architecture, setup instructions, FHEVM features used

**Rubric Criteria and Weights:**

| Criteria | Weight |
|----------|--------|
| Originality (novel use case, creative problem solving) | 20% |
| Technical Correctness (all functions work, no bugs, edge cases) | 25% |
| FHEVM Feature Depth (uses 5+ features: types, select, ACL, decrypt, rand) | 20% |
| Documentation (README, inline comments, architecture notes) | 15% |
| Presentation (polished demo, clear explanation) | 20% |

**Passing Score:** 70% overall

---

## FHEVM API Accuracy Notes

The following corrections have been applied to the curriculum compared to the original project plan document. These ensure all lessons reference current FHEVM v0.9 APIs:

### 1. Lesson 3.1 -- Decryption Mechanism

**Original (project plan):** References `Gateway.requestDecryption(handle, callbackFunction, ...)` and Oracle-based async decryption flow.

**Corrected (v0.9):** Replaced with self-relaying decryption pattern:
- On-chain: `FHE.makePubliclyDecryptable(handle)`
- Off-chain: `@zama-fhe/relayer-sdk` `publicDecrypt()`
- On-chain callback: `FHE.checkSignatures(requestId, cleartexts, proof)`

### 2. Lesson 1.2 -- Zama Ecosystem Architecture

**Original:** References "KMS + Gateway" architecture.

**Corrected (v0.9):** Gateway terminology updated. The v0.9 architecture uses coprocessor + KMS + relayer SDK. The Gateway component has been replaced by the self-relaying model where the dApp client handles decryption relay.

### 3. Lesson 2.1 -- Encrypted Types

**Original (project plan):** Lists `ebytes64`, `ebytes128`, `ebytes256` as available types.

**Corrected (v0.7+):** `ebytesXXX` types were removed in FHEVM v0.7 (July 2025). These types do not exist in current FHEVM and must not be referenced in any lesson.

### 4. All Lessons -- Configuration Import

**Original:** Some references use `EthereumConfig` or `SepoliaConfig`.

**Corrected (v0.9):** All lessons use `ZamaEthereumConfig` imported from `@fhevm/solidity/config/ZamaConfig.sol`. This config auto-resolves by `chainId` and works on all Zama-supported networks.

### 5. All Lessons -- External Input Types

**Original:** Some older references use `einput` as the generic encrypted input type.

**Corrected (v0.7+):** All lessons use typed external inputs: `externalEuint8`, `externalEuint32`, `externalEuint64`, `externalEbool`, `externalEaddress`, etc. The generic `einput` type was replaced in v0.7.

---

*Curriculum outline generated from the FHE Academy Complete Project Plan, with all FHEVM API references verified against Zama docs (docs.zama.org) and FHEVM v0.9 migration guide.*
