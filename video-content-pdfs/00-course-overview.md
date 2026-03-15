# FHE Academy - Confidential Smart Contracts Bootcamp

## Course Overview

### What is FHE Academy?

FHE Academy is a 4-week intensive bootcamp designed to teach Web3 developers how to build confidential smart contracts using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine). This is approximately 50 hours of hands-on learning content.

### Who is This For?

This bootcamp is designed for Web3 developers who already have basic knowledge of Ethereum and Solidity. No prior cryptography experience is required - the course bridges from familiar Solidity patterns to encrypted FHEVM equivalents using a "Migration Mindset" approach.

### What is Fully Homomorphic Encryption (FHE)?

Fully Homomorphic Encryption is a revolutionary cryptographic technique that allows computation on encrypted data without ever decrypting it. Imagine being able to add two encrypted numbers and get an encrypted result - without ever knowing what those numbers are. That is FHE.

In the blockchain context, this means smart contracts can process sensitive data (balances, votes, bids, medical records) while keeping everything encrypted on-chain. Nobody - not miners, not validators, not other users - can see the underlying data.

### The Problem FHE Solves

Public blockchains like Ethereum have a fundamental transparency problem:
- **Every transaction is visible** to everyone on the network
- **Account balances are public** - anyone can see how much ETH or tokens you hold
- **Smart contract state is readable** - all storage slots are publicly accessible
- **MEV (Maximal Extractable Value)** attacks exploit this transparency - bots front-run trades, sandwich attack swaps, and extract value from users

This transparency creates real problems:
- Financial privacy is non-existent
- Competitive bidding is impossible (everyone sees your bid)
- Voting is not secret (everyone sees your vote)
- Business logic is exposed to competitors

### How FHEVM Solves This

Zama's FHEVM brings FHE to the Ethereum Virtual Machine. Instead of storing plain numbers on-chain, you store encrypted values. Instead of using regular arithmetic, you use FHE operations that work on encrypted data.

**The key insight:** Your Solidity code looks almost the same - you just replace `uint256` with `euint256`, and `+` with `FHE.add()`. The "Migration Mindset" makes learning accessible.

### Course Structure

| Week | Topic | Hours | Focus |
|------|-------|-------|-------|
| Week 1 | From Solidity to Confidential Solidity | 8-10h | Foundations, first encrypted contract |
| Week 2 | Mastering Encrypted Types & Access Control | 10-12h | Deep dive into types, operations, ACL |
| Week 3 | Building Real-World Confidential dApps | 12-14h | Decryption, frontend, design patterns |
| Week 4 | Advanced Patterns & Capstone Project | 14-16h | Optimization, security, deployment |

### What You Will Build

- **Week 1:** Encrypted Counter (your first FHEVM contract)
- **Week 2:** Confidential ERC-20 Token (encrypted balances)
- **Week 3:** Sealed-Bid Auction dApp (with React frontend)
- **Week 4:** Capstone Project (your own confidential dApp)

### The Zama Technology Stack

Zama provides a complete ecosystem for FHE:

1. **TFHE-rs** - The core FHE library written in Rust
2. **FHEVM** - Solidity library that brings FHE to EVM smart contracts
3. **Coprocessor** - Off-chain FHE computation engine
4. **KMS (Key Management Service)** - Threshold decryption for secure key management
5. **Relayer SDK** - Client-side tools for encrypting inputs and decrypting results

### Teaching Philosophy: Migration Mindset

Every lesson follows a consistent pattern:
1. Show the familiar Solidity code
2. Show the FHEVM equivalent side-by-side
3. Explain what changed and why
4. Practice with hands-on exercises

This approach makes the complex world of FHE accessible to any Solidity developer.

---

*FHE Academy - Building the future of confidential computing on blockchain*
