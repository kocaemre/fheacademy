# NotebookLM Video Prompts for FHE Academy

## How to Use These Prompts

1. Upload the corresponding PDF section to NotebookLM as a source
2. Click "Generate Audio Overview" or "Generate Video"
3. Use the prompt below to guide the AI-generated content
4. Each prompt is designed to produce a 5-15 minute engaging educational video

---

## Video 0: Course Overview & Introduction

**Upload:** `00-course-overview.pdf`

**Prompt:**
```
Create an engaging and energetic podcast-style overview video introducing the FHE Academy bootcamp. Start by explaining the massive privacy problem on public blockchains - how every transaction, every balance, every piece of data is visible to the entire world. Use dramatic examples like MEV bots stealing $600M+ per year from regular users through front-running and sandwich attacks. Then introduce Fully Homomorphic Encryption as the revolutionary solution - explain it simply as "doing math on locked boxes without ever opening them." Walk through the 4-week course structure, highlighting what students will build each week (encrypted counter, confidential token, sealed-bid auction, capstone project). Make it exciting and motivating - this is cutting-edge technology that will shape the future of Web3. End with the Migration Mindset concept - you already know Solidity, now you'll learn to add encryption to it. Keep the tone enthusiastic but accessible to developers who have never heard of FHE before.
```

---

## Video 1.1: Why Privacy Matters On-Chain

**Upload:** `01-week1-lesson1-why-privacy-matters.pdf`

**Prompt:**
```
Create an educational podcast discussing why privacy matters on public blockchains. Have the hosts debate and explore the tension between blockchain transparency and user privacy. Cover three main problems: financial privacy (imagine your bank balance on a billboard), MEV attacks (explain front-running and sandwich attacks with concrete examples of how bots steal money from regular users), and competitive disadvantage (why auctions and voting are broken on transparent chains). Then compare three privacy solutions - TEEs (like a locked room that could be broken into), ZKPs (proving facts without revealing data, but limited), and FHE (doing math on encrypted data without decrypting). Use simple analogies throughout. Make the comparison fair but show why FHE is the most powerful solution for smart contracts. The conversation should feel natural, with hosts asking each other clarifying questions.
```

---

## Video 1.2: Zama Ecosystem Overview

**Upload:** `02-week1-lesson2-zama-ecosystem.pdf`

**Prompt:**
```
Create a technical but accessible podcast explaining the Zama FHEVM architecture. Walk through the 5-layer technology stack: TFHE-rs (the cryptographic engine), FHEVM (the Solidity library developers use), the Coprocessor (the off-chain computation engine), KMS (threshold key management), and the Relayer SDK (client-side tools). The most important concept to explain clearly is the coprocessor model - smart contracts don't actually do FHE math themselves, they send instructions to the coprocessor which does the heavy computation. Use the GPU analogy - the EVM is the CPU coordinating, the coprocessor is the GPU doing the math. Also explain handles vs ciphertexts (handles are like pointers - small references stored on-chain that point to large encrypted data in the coprocessor). Cover the ACL concept briefly. Make sure listeners understand the complete flow: user encrypts → contract receives → coprocessor computes → result stored as handle → user decrypts when needed.
```

---

## Video 1.3: Development Environment Setup

**Upload:** `03-week1-lesson3-dev-environment.pdf`

**Prompt:**
```
Create a practical, hands-on podcast about setting up a development environment for FHEVM smart contracts. Focus heavily on the concept of mock mode - explain that when developing locally, there's no coprocessor or KMS available, so the hardhat-fhevm plugin simulates FHE operations using regular arithmetic. This is the key insight: mock mode makes development fast (tests run in seconds instead of hours) while faithfully simulating FHE behavior. Explain what mock mode can test (logic, ACL simulation, correctness) and what it cannot test (real encryption, gas costs, network behavior). Walk through the setup: Hardhat project, installing fhevm and hardhat-fhevm packages, configuring hardhat.config.ts with Solidity 0.8.24 and cancun EVM version. Make it practical and reassuring - the setup is almost identical to a normal Hardhat project. Developers should feel confident they can get started quickly.
```

---

## Video 1.4: Your First FHEVM Contract

**Upload:** `04-week1-lesson4-first-fhevm-contract.pdf`

**Prompt:**
```
Create the most important video of the entire course - building your first FHEVM contract by migrating a simple Solidity counter. Walk through the Migration Mindset step by step: (1) Start with a familiar uint32 counter, (2) Replace uint32 with euint32, (3) Replace += with FHE.add(), (4) Add ACL permissions with FHE.allowThis() and FHE.allow(). Spend significant time on ACL - explain that FHE.allowThis() is CRITICAL because every FHE operation creates a NEW ciphertext with an EMPTY access list. If you forget allowThis, the contract PERMANENTLY loses access to its own data. There is NO recovery. Also explain encrypted inputs - externalEuint32 and inputProof - and why zero-knowledge proofs prevent replay attacks. Show the complete side-by-side comparison of the plain counter vs encrypted counter. Cover the 4 common mistakes: forgetting allowThis, using public visibility, using regular operators, accepting plaintext inputs. Make this thorough and clear - everything else in the course builds on these fundamentals.
```

---

## Video 1.5: Testing FHEVM Contracts

**Upload:** `05-week1-lesson5-testing.pdf`

**Prompt:**
```
Create a practical podcast about testing FHEVM smart contracts with Hardhat. Cover the two key testing tools: createEncryptedInput() for creating encrypted test values, and userDecryptEuint32() for verifying results. Explain that handles are non-deterministic - the same value encrypted twice produces different handles, so you can NEVER compare handles directly. Always decrypt to compare values. Walk through a complete test example: deploy contract, create encrypted input bound to contract and user address, call contract function, get handle from contract, decrypt handle, assert value. Explain that mock mode makes tests instant - no waiting for real FHE computation. Cover the four test categories briefly: functional, ACL/permission, edge cases, and integration. Keep it practical with code examples and common pitfalls.
```

---

## Video 2.1: Encrypted Types Deep Dive

**Upload:** `07-week2-lesson1-encrypted-types.pdf`

**Prompt:**
```
Create a detailed podcast about the FHEVM type system. Cover all 8 encrypted types (ebool, euint8 through euint256, eaddress) and their external input variants. The MOST important concept is gas cost hierarchy - gas scales roughly exponentially with type size. Using euint256 when euint8 would suffice wastes enormous gas. Give practical examples: percentages use euint8, token balances use euint64, only use euint256 when absolutely necessary. Cover type casting - upcasting (small to large) is safe, downcasting (large to small) SILENTLY TRUNCATES without any error or warning. This is a dangerous pitfall. Also mention that ebytes types were removed in v0.7. Make the gas optimization message crystal clear - choosing the right type is the single most impactful optimization a developer can make.
```

---

## Video 2.2: Operations on Encrypted Data

**Upload:** `08-week2-lesson2-operations.pdf`

**Prompt:**
```
Create a comprehensive podcast covering all FHE operations. Cover arithmetic (add, sub, mul, neg), division constraints (divisor MUST be plaintext - this is a fundamental limitation), comparisons (all return ebool, not regular bool), and bitwise operations. But the MAIN EVENT is FHE.select - the most important paradigm shift in FHEVM. Explain dramatically why if/else CANNOT work with encrypted conditions - the EVM literally cannot evaluate an encrypted boolean. FHE.select is the encrypted ternary: select(condition, trueValue, falseValue). BOTH branches are ALWAYS computed. This means operations never revert based on encrypted conditions - they always succeed but may have no effect. Walk through the safe transfer pattern: check balance with FHE.ge, then use FHE.select to either perform or skip the transfer. This is a fundamental shift in how developers think about smart contract logic.
```

---

## Video 2.3: Encrypted Inputs & Zero-Knowledge Proofs

**Upload:** `09-week2-lesson3-encrypted-inputs.pdf`

**Prompt:**
```
Create a podcast explaining how users send encrypted values to FHEVM contracts. Walk through the 4-stage lifecycle: (1) Client-side encryption using the Relayer SDK, (2) Zero-Knowledge Proof generation that binds the ciphertext to the specific contract and sender, (3) On-chain submission as externalEuintXX with proof, (4) On-chain validation with FHE.fromExternal(). Focus on WHY the ZK proof is essential - without it, attackers could replay someone else's encrypted bid in an auction, or submit garbage data, or reuse ciphertexts across contracts. The proof guarantees the user knows the plaintext, and binds it to a specific contract and sender. Explain multiple encrypted inputs sharing a single proof for efficiency. Make the security implications vivid and concrete.
```

---

## Video 2.4: The ACL System (Most Critical Lesson)

**Upload:** `10-week2-lesson4-acl-system.pdf`

**Prompt:**
```
Create the most critical video about FHEVM security - the Access Control List system. Every encrypted value has an ACL that starts EMPTY. Cover the three functions: FHE.allowThis() grants the contract access (MANDATORY after every state update - forgetting it means PERMANENT, IRRECOVERABLE data loss), FHE.allow() grants permanent decryption access to an address, and FHE.allowTransient() grants temporary access for a single transaction. Walk through the token transfer ACL pattern in detail - both sender AND receiver need new ACL after a transfer because FHE operations create NEW ciphertexts with NEW empty ACLs. Cover the 4 common mistakes: forgetting allowThis (most dangerous), setting ACL on intermediate values instead of state variables, forgetting receiver ACL in transfers, and granting unnecessary permissions. The message should be: ACL management is the #1 source of bugs in FHEVM contracts, and the consequences are irreversible.
```

---

## Video 2.5: Defensive Programming Patterns

**Upload:** `11-week2-lesson5-patterns-best-practices.pdf`

**Prompt:**
```
Create a podcast about defensive programming in FHEVM. Cover the safe subtraction pattern (FHE.select with FHE.ge to prevent underflow), FHE.isInitialized() checks before first operations, and the 5 rules: check initialization, use FHE.select for conditionals, set ACL after every change, use smallest type, minimize operations. Important: cover anti-patterns - leaking information through reverts (a revert on "insufficient balance" tells observers the balance was too low), leaking through events (never put encrypted data in events), and leaking through gas patterns. The key insight is that FHE protects the DATA, but developers must protect the METADATA (transaction patterns, gas usage, state changes). End with the complete safe transfer pattern template that students should memorize.
```

---

## Video 3.1: Decryption Mechanism

**Upload:** `13-week3-lesson1-decryption.pdf`

**Prompt:**
```
Create a podcast explaining how FHEVM v0.9 decryption works. The key message: data stays encrypted BY DEFAULT and is NEVER automatically decrypted. Explain the self-relaying model in three stages: (1) Contract marks a value with FHE.makePubliclyDecryptable() - this is the contract's decision, not the user's, (2) User decrypts off-chain via the KMS using threshold decryption - multiple KMS nodes each partially decrypt with their key share, (3) User submits the cleartext and proof back on-chain, verified by FHE.checkSignatures(). Cover the design decision framework: decrypt balances and results (users need them), keep losing bids and individual votes encrypted forever. Mention that the Gateway/Oracle pattern from v0.7 is deprecated. The principle is: decrypt the absolute minimum necessary for functionality.
```

---

## Video 3.2: Advanced FHE.select Patterns

**Upload:** `14-week3-lesson2-fhe-select-patterns.pdf`

**Prompt:**
```
Create a podcast with advanced FHE.select techniques. Cover tiered pricing (nested FHE.select for multiple price levels based on encrypted quantity), min/max clamping (ensuring values stay within bounds), complex nested conditions (combining FHE.and and FHE.or with FHE.select for multi-condition business logic), and state machine transitions (encrypted state changes based on encrypted conditions). Emphasize the performance consideration: both branches always execute, so keep them balanced in computational cost. These patterns show that FHE.select is powerful enough to implement any business logic, replacing all if/else/switch/ternary constructs. Provide concrete examples that students can adapt for their own projects.
```

---

## Video 3.3: On-Chain Randomness

**Upload:** `15-week3-lesson3-randomness.pdf`

**Prompt:**
```
Create an exciting podcast about FHE's revolutionary approach to on-chain randomness. Start with the problem: blockchain randomness is either predictable (block-based) or eventually public (Chainlink VRF). Then reveal FHE's solution: random numbers that are encrypted - NOBODY can see them, not even the contract deployer! Cover FHE.randEuint8/16/32/64 and show how to constrain ranges with FHE.rem. Compare with Chainlink VRF in a fair way: VRF is verifiable but public, FHE is both verifiable AND secret. Give exciting use cases: dealing cards that nobody can see (not even the dealer), lottery numbers that exist but are hidden until draw time, game treasures at secret positions. This opens up entirely new categories of blockchain games and applications that were previously impossible.
```

---

## Video 3.4: Frontend Integration

**Upload:** `16-week3-lesson4-frontend-integration.pdf`

**Prompt:**
```
Create a practical podcast about building frontends for FHEVM dApps. Walk through the complete 5-stage flow: connect wallet (standard Web3), encrypt input (Relayer SDK's createEncryptedInput), send transaction (standard ethers.js with encrypted params), decrypt result (via KMS), display to user. Show a complete React component example. The key insight is that frontend code is 90% identical to standard Web3 development - the only additions are the encryption step before sending and the decryption step after reading. Cover error handling: ACL permission failures when trying to decrypt values you don't have access to. The message should be: if you can build a regular Web3 frontend, you can build an FHEVM frontend with minimal additional learning.
```

---

## Video 3.5: Auction & Voting Design Patterns

**Upload:** `17-week3-lesson5-design-patterns.pdf`

**Prompt:**
```
Create a podcast analyzing two flagship FHEVM applications: sealed-bid auctions and private voting. For auctions: explain how FHE.gt and FHE.select find the highest bid without revealing any bid amounts, how losing bids stay encrypted FOREVER, and why this creates truly fair competitive bidding for the first time on blockchain. For voting: explain how encrypted votes (ebool) are accumulated with FHE.add, how individual votes stay private while totals are revealed. Compare the two patterns: both hide individual data and reveal aggregates. The common principle is MINIMAL REVELATION - decrypt only what is absolutely necessary. These patterns demonstrate capabilities that are literally impossible with any other privacy technology including ZKPs and TEEs, because only FHE can compute across multiple parties' encrypted data.
```

---

## Video 4.1: Gas Optimization

**Upload:** `19-week4-lesson1-gas-optimization.pdf`

**Prompt:**
```
Create a podcast about the critical topic of gas optimization for FHE contracts. FHE operations are 10-1000x more expensive than regular EVM operations, making optimization essential. Cover the 5 strategies: (1) Use plaintext operands - FHE.add(x, 1) is cheaper than FHE.add(x, FHE.asEuint32(1)), (2) Use the smallest type that fits - euint8 vs euint256 can be a 50x cost difference, (3) Minimize operations per transaction - compute once, reuse, (4) Batch operations - one condition for multiple updates, (5) Avoid unnecessary re-encryption. Provide the gas optimization checklist developers should review before deployment. The compound effect of applying all strategies can reduce gas by over 90%. Make the financial impact clear with concrete numbers.
```

---

## Video 4.2: Security Best Practices

**Upload:** `20-week4-lesson2-security.pdf`

**Prompt:**
```
Create a serious, thorough podcast about FHEVM security. Cover the 6-point audit checklist: ACL on every state change, overflow protection, initialization checks, input validation, decryption verification, and no sensitive data in events/reverts. Then cover side-channel attacks: transaction patterns, gas usage analysis, timing analysis, and state change observation. These are subtle - even with perfect encryption, METADATA can leak information. Walk through the complete security audit procedure: map variables, trace assignments, verify ACL, check overflow protection, review events, assess side channels. The tone should be serious - security vulnerabilities in FHE contracts can be permanent and irrecoverable. End with the message: FHEVM security requires thinking about WHAT you encrypt AND what you accidentally reveal through contract behavior.
```

---

## Video 4.3: Confidential DeFi

**Upload:** `21-week4-lesson3-confidential-defi.pdf`

**Prompt:**
```
Create a visionary, exciting podcast about the future of Confidential DeFi. FHE doesn't just add privacy to existing DeFi - it enables ENTIRELY NEW financial primitives. Cover 4 revolutionary applications: (1) Confidential AMMs - encrypted reserves eliminate MEV and front-running entirely (saving users billions), (2) Confidential Lending - hidden collateral prevents liquidation sniping, (3) Encrypted Order Books - fair price discovery without information leakage, (4) Private Stablecoins - programmable privacy with selective disclosure. Emphasize the unique capability: only FHE can compute across MULTIPLE PARTIES' encrypted data. TEEs decrypt inside enclaves, ZKPs prove facts but can't compute on hidden data from multiple users. FHE is the only technology that enables these cross-party encrypted computations. The developers learning this today are building the future of finance.
```

---

## Video 4.4: Testing Strategies

**Upload:** `22-week4-lesson4-testing-strategies.pdf`

**Prompt:**
```
Create a practical podcast about comprehensive FHEVM testing. Cover the four test categories: (1) Functional - verify core logic works with encrypted data, test both success and silent failure paths, (2) Permission - verify authorized users can decrypt AND unauthorized users are blocked, (3) Edge cases - uninitialized handles, overflow, zero values, double initialization, (4) Integration - multi-user scenarios, sequential transactions, complete workflows like auction lifecycles. Highlight FHEVM-specific testing patterns: verifying that failed operations leave state UNCHANGED (they don't revert!), and verifying ACL isolation between users. Cover CI/CD with GitHub Actions - mock mode runs automatically, no special infrastructure needed. The message: FHEVM contracts need MORE testing than regular Solidity because failures are SILENT and consequences can be PERMANENT.
```

---

## Video 4.5: Deployment & Capstone Overview

**Upload:** `23-week4-lesson5-deployment.pdf` and `24-week4-homework-capstone.pdf`

**Prompt:**
```
Create a podcast that covers testnet deployment and introduces the capstone project. For deployment: explain the transition from mock mode to real FHE on Sepolia. The deployment script is nearly identical to standard Hardhat. ZamaEthereumConfig auto-resolves infrastructure by chain ID. Key differences: transactions are slower (real FHE computation), gas costs are higher, encryption is real, KMS threshold decryption is involved. Cover the deployment checklist. Then transition to the capstone: students build their own confidential dApp from scratch. Cover the 4 project options (voting, token swap, credentials, game) and the requirements (contract, tests, frontend, documentation). The grading rubric emphasizes originality, technical correctness, and FHEVM feature depth (use 5+ features). End with motivation: completing this capstone means you are among the first developers in the world capable of building confidential smart contracts. This is the beginning, not the end, of your FHE journey.
```

---

## Tips for Best Results with NotebookLM

1. Upload one PDF at a time for focused, detailed videos
2. Longer PDFs produce more detailed content
3. The prompts are designed to be conversational - NotebookLM works best with podcast-style content
4. After generating, review and regenerate if needed - NotebookLM may occasionally miss key points
5. Consider combining related lessons (e.g., 1.4 + 1.5) for a single longer video
