# Week 4 - Capstone Project: Build Your Own Confidential dApp

## Assignment Overview

Design and build an original confidential decentralized application using FHEVM. This is your culminating project that demonstrates mastery of all course concepts.

---

## Project Options

Choose one of the following categories or propose your own:

### Option 1: Confidential Voting System
Build a voting system where individual votes are private but results are public.
- Encrypted vote submission (ebool or euint8 for multiple choices)
- Private vote accumulation using FHE.add
- Time-locked result revelation using FHE.makePubliclyDecryptable
- Voter eligibility checks
- React frontend for voting and viewing results

### Option 2: Private Token Swap
Build an MEV-resistant token swap mechanism.
- Encrypted order submission (price and quantity)
- Encrypted order matching using FHE comparisons
- Automatic execution when prices cross
- No front-running possible
- Frontend for order placement and status tracking

### Option 3: Encrypted Credentials / DID
Build a decentralized identity system with encrypted credentials.
- Encrypted credential storage (age, citizenship, qualifications)
- Selective disclosure using FHE.select and ACL
- Verifiable claims without revealing underlying data
- Multi-party credential verification
- Frontend for credential management

### Option 4: Privacy-Preserving Game
Build a game with hidden state using FHE.
- Encrypted game state (positions, scores, cards)
- FHE randomness for unpredictable and secret events
- Fair play enforcement through encrypted computation
- Multi-player support with individual encrypted views
- Frontend for gameplay

---

## Requirements

### Smart Contract
- Deployed on Sepolia testnet (or working in mock mode)
- Minimum 3 different FHE operations used
- Proper ACL management throughout
- Overflow protection where applicable
- Clean, well-organized code

### Test Suite
- Minimum 5 test cases
- Cover all four test categories: functional, permission, edge case, integration
- All tests passing

### React Frontend
- Wallet connection
- Encrypted input submission via Relayer SDK
- Decryption and display of results
- User-friendly interface

### Documentation (README)
- Architecture overview with diagram
- Setup and installation instructions
- How to run tests
- List of FHEVM features used with explanations
- Design decisions and trade-offs

---

## Grading Rubric

| Criteria | Weight | Description |
|----------|--------|-------------|
| Originality | 20% | Creative application of FHE concepts |
| Technical Correctness | 25% | Proper FHEVM usage, no security vulnerabilities |
| FHEVM Feature Depth | 20% | Use of 5+ FHEVM features (types, operations, ACL, select, randomness, decryption) |
| Documentation | 15% | Clear README with architecture, setup, and explanations |
| Presentation | 20% | Code quality, UI polish, overall coherence |

**Passing Score:** 70%

---

## Submission

Submit your GitHub repository URL through the platform. Your repository should include:
- Complete smart contract source code
- Test suite
- Frontend application
- README documentation

---

## Grading Process

- Capstone projects are manually reviewed by the FHE Academy team
- Feedback is provided via email
- Upon passing, you receive an NFT completion certificate

---

## FHEVM Features Checklist

Aim to use at least 5 of these in your project:

- [ ] Encrypted types (euint8, euint32, euint64, ebool, eaddress)
- [ ] FHE arithmetic (add, sub, mul, div)
- [ ] FHE comparisons (eq, ne, gt, lt, ge, le)
- [ ] FHE.select for encrypted branching
- [ ] ACL management (allowThis, allow, allowTransient)
- [ ] Encrypted inputs with proofs (fromExternal)
- [ ] Decryption (makePubliclyDecryptable, checkSignatures)
- [ ] FHE randomness (randEuint8, etc.)
- [ ] Type casting (asEuintXX)
- [ ] FHE.isInitialized checks
