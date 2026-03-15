# Week 3 - Homework: Sealed-Bid Auction dApp

## Assignment Overview

Build a complete sealed-bid auction application with both a smart contract and a React frontend. This is your first full-stack FHEVM project.

---

## Requirements

### Smart Contract

1. **placeBid(externalEuint64 bid, bytes calldata proof)** - Accept encrypted bids
2. **endAuction()** - Close bidding and determine winner using FHE comparisons
3. **revealWinner()** - Mark winning bid for decryption via FHE.makePubliclyDecryptable()
4. Losing bids must NEVER be exposed
5. One bid per address
6. Time-based auction end

### Frontend (React)

1. Wallet connection (MetaMask)
2. Encrypt bid using Relayer SDK
3. Submit encrypted bid transaction
4. View auction status (active/ended)
5. Reveal winner after auction ends (decrypt and display)

### Test Suite

At least 3 test scenarios:
1. Multiple users placing encrypted bids
2. Correct winner determination
3. Losing bids remain encrypted

---

## Grading Rubric

| Criteria | Weight | Description |
|----------|--------|-------------|
| Contract Logic | 25% | Correct bid handling, comparison, winner selection |
| Bid Privacy | 20% | Losing bids never exposed, proper encryption |
| Decryption Flow | 20% | Correct v0.9 self-relaying implementation |
| Frontend | 20% | Working UI with encryption and decryption |
| Documentation | 15% | Clear README with setup and architecture explanation |

**Passing Score:** 70%

---

## Key Concepts Applied

- Encrypted inputs with ZKPoK proofs
- FHE.gt + FHE.select for encrypted comparisons
- eaddress for encrypted winner tracking
- FHE.makePubliclyDecryptable() for controlled revelation
- Full-stack integration with Relayer SDK
- ACL management across multiple bidders
