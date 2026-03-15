# NotebookLM Video Prompts - FHE Academy (4 Videos)

## How to Use

1. Upload the corresponding PDF to NotebookLM as a source
2. Click "Generate Audio Overview" (or "Generate Video")
3. Paste the English prompt below to guide content generation
4. Each prompt produces a 10-20 minute engaging podcast-style video

---

## Video 1: Week 1 - From Solidity to Confidential Solidity

**Upload:** `week-1-from-solidity-to-confidential-solidity.pdf`

**Prompt:**
```
Create an engaging, energetic podcast-style educational video covering Week 1 of the FHE Academy bootcamp. Structure the discussion as follows:

START with the dramatic problem: public blockchains expose everything. Use the MEV example - $600M+ stolen from users annually through front-running and sandwich attacks. Make it visceral - bots literally watching your pending trades and stealing from you. Mention that even your salary, savings, and spending habits are on a public billboard.

THEN compare three privacy solutions like a technology showdown: TEEs (fast but trust hardware that gets hacked - Spectre, Meltdown), ZKPs (prove facts but can't compute on encrypted data), and FHE (compute on encrypted data without ever decrypting - the holy grail). Make the comparison fair but show why FHE wins for smart contracts.

EXPLAIN the Zama architecture using the GPU analogy: the EVM is the CPU coordinating, the coprocessor is the GPU doing the heavy FHE math. Cover handles (32-byte pointers to encrypted data), the KMS (threshold decryption so no single party has the key), and the Relayer SDK (encrypts on the client side).

SPEND THE MOST TIME on the Migration Mindset - the core teaching approach. Walk through transforming a simple Solidity counter step by step: replace uint32 with euint32, replace += with FHE.add(), add FHE.allowThis() after EVERY update (emphasize this is CRITICAL - forgetting it means PERMANENT data loss with NO recovery), and handle encrypted inputs with zero-knowledge proofs that prevent replay attacks.

COVER testing briefly: mock mode simulates FHE locally so tests run in seconds, createEncryptedInput for test values, userDecryptEuint32 for verification, and handles being non-deterministic.

END with excitement about what's coming in Week 2: deep diving into types, operations, and the critical ACL system. The tone should be enthusiastic and accessible - make developers feel confident they can do this.
```

---

## Video 2: Week 2 - Mastering Encrypted Types and Access Control

**Upload:** `week-2-mastering-encrypted-types-and-access-control.pdf`

**Prompt:**
```
Create a detailed, technical but accessible podcast covering Week 2 of FHE Academy. This is the deepest technical week, so balance depth with clarity.

START with the type system. Cover all 8 encrypted types (ebool through euint256 plus eaddress). The CRITICAL message: gas costs scale EXPONENTIALLY with type size. Using euint256 when euint8 suffices wastes massive gas - potentially 50x more expensive. Give concrete examples: percentages use euint8, token balances use euint64. Also warn about downcasting - it SILENTLY truncates with no error.

THEN cover all FHE operations: arithmetic (add, sub, mul), the division constraint (divisor MUST be plaintext - a fundamental FHE limitation), comparisons (all return ebool, not regular bool), and bitwise operations.

BUILD TO THE BIG REVEAL: FHE.select - the most important paradigm shift. Dramatically explain WHY if/else CANNOT work with encrypted conditions. The EVM literally cannot evaluate an encrypted boolean. FHE.select is the encrypted ternary where BOTH branches always execute. This means operations NEVER revert based on encrypted conditions - they always succeed but may have no effect. Walk through the safe transfer pattern: check balance, use select to either transfer or keep unchanged. Explain why no revert: reverting would tell observers the balance was insufficient, leaking encrypted information.

COVER encrypted inputs and ZKPoK: the 4-stage lifecycle (client encrypt, proof generation, on-chain submission, validation). Explain how the proof prevents replay attacks by binding to contract and sender.

MAKE THE ACL SECTION DRAMATIC - it's the most critical topic. Every ciphertext starts with an EMPTY ACL. FHE.allowThis() is MANDATORY after every update - forgetting it means PERMANENT, IRRECOVERABLE data loss. FHE.allow() for user decryption. FHE.allowTransient() for temporary cross-contract access. Walk through the transfer pattern where BOTH sender and receiver need new ACL.

END with defensive programming: overflow protection via FHE.select, initialization checks, the 5 rules, and anti-patterns (never leak through reverts or events).
```

---

## Video 3: Week 3 - Building Real-World Confidential dApps

**Upload:** `week-3-building-real-world-confidential-dapps.pdf`

**Prompt:**
```
Create an exciting podcast covering Week 3 of FHE Academy - where theory becomes real applications. The energy should be high because students are now building actual dApps.

START with decryption: data stays encrypted BY DEFAULT forever. Explain the v0.9 self-relaying model in three stages: (1) contract marks with makePubliclyDecryptable - the CONTRACT decides what gets revealed, not users, (2) user decrypts off-chain via KMS threshold decryption - multiple nodes cooperate, no single point of failure, (3) user submits cleartext plus proof on-chain, verified by checkSignatures. Key principle: decrypt the ABSOLUTE MINIMUM necessary.

COVER advanced FHE.select patterns quickly but with enthusiasm: tiered pricing with nested selects, clamping values with min/max, multi-condition logic combining AND/OR with select. Show how these patterns replace ALL if/else/switch logic.

GET EXCITED about FHE randomness - this is genuinely revolutionary. Unlike Chainlink VRF where the random number becomes public, FHE random numbers stay ENCRYPTED. Nobody can see them - not miners, not validators, not even the contract deployer. Use vivid examples: dealing cards nobody can peek at, lottery numbers that exist but are hidden, game treasures at secret positions. Single transaction, no external dependency.

COVER frontend integration practically: the flow is 90% identical to standard Web3. You just add encryption before sending (Relayer SDK) and decryption after reading. Show it's not scary - standard ethers.js with encrypted parameters.

BUILD TO THE GRAND FINALE: the two flagship patterns. Sealed-bid auctions where FHE.gt plus FHE.select find the winner without revealing ANY bids, and losing bids stay encrypted FOREVER. Private voting where encrypted votes are accumulated with FHE.add and only totals are revealed. These demonstrate what's IMPOSSIBLE with any other technology - only FHE computes across multiple parties' encrypted data.

END by previewing the capstone: students will build their OWN confidential dApp in Week 4.
```

---

## Video 4: Week 4 - Advanced Patterns, Security, and the Future

**Upload:** `week-4-advanced-patterns-and-capstone.pdf`

**Prompt:**
```
Create a comprehensive podcast for the final week of FHE Academy. Balance practical production knowledge with an inspiring vision of the future.

START with gas optimization - make the financial case clear. FHE operations cost 10-1000x more than standard EVM. Cover the 5 strategies: (1) plaintext operands save gas by avoiding extra ciphertext creation, (2) smallest type that fits - euint8 vs euint256 is a 50x difference, (3) minimize operations - compute once and reuse, (4) batch conditions - one comparison for multiple updates, (5) no unnecessary re-encryption. Together these can reduce gas by 90%+.

THEN get serious about security. Cover the 6-point audit checklist: ACL on every state change, overflow protection, initialization checks, input validation, decryption verification, and no sensitive data in events or reverts. Then cover side-channel attacks - this is fascinating and unique to FHE. Even with perfect encryption, transaction PATTERNS, gas USAGE, and state CHANGES can leak information. FHE protects the data, but developers must protect the metadata.

GET VISIONARY about Confidential DeFi - the most exciting section. FHE doesn't just add privacy. It enables ENTIRELY NEW financial primitives: Confidential AMMs that eliminate MEV entirely (saving users billions), confidential lending where nobody can snipe liquidations, encrypted order books with fair price discovery, private stablecoins with programmable disclosure rules. Emphasize the unique capability: ONLY FHE computes across multiple parties' encrypted data. TEEs decrypt inside enclaves. ZKPs prove facts but can't compute on hidden data from multiple users.

COVER testing strategies: four categories (functional, permission, edge case, integration). The key insight is that FHEVM failures are SILENT - operations don't revert, they just have no effect. You MUST test that failed operations leave state unchanged.

BRIEFLY cover testnet deployment: nearly identical to standard Hardhat, ZamaEthereumConfig auto-resolves everything by chain ID.

END with the capstone introduction and an inspiring message: students completing this course are among the FIRST developers in the world capable of building confidential smart contracts. They are not just learning a technology - they are building the future of privacy on blockchain. The developers building these applications today will be the leaders of the next wave of Web3 innovation.
```

---

## Tips for Best Results

1. Upload one PDF per video for focused content
2. These prompts are designed for podcast-style (two hosts discussing) which NotebookLM does best
3. After generating, listen through and regenerate if key concepts are missed
4. Each video should be approximately 10-20 minutes
5. The PDFs are comprehensive enough that NotebookLM has plenty of material to work with
