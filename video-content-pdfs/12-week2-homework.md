# Week 2 - Homework: Confidential ERC-20 Token

## Assignment Overview

Build a complete ERC-20 token with encrypted balances using FHEVM. This is the most fundamental building block of confidential DeFi.

---

## Requirements

### Core Functions

1. **mint(address to, externalEuint64 amount, bytes calldata proof)** - Mint new tokens with encrypted amount
2. **transfer(address to, externalEuint64 amount, bytes calldata proof)** - Transfer tokens with encrypted amount
3. **approve(address spender, externalEuint64 amount, bytes calldata proof)** - Approve spender with encrypted allowance
4. **transferFrom(address from, address to, externalEuint64 amount, bytes calldata proof)** - Transfer using allowance
5. **balanceOf(address account) returns (euint64)** - Return encrypted balance handle

### Technical Requirements

- Use `euint64` for all balances and amounts
- Implement overflow protection using FHE.select (no reverts on insufficient balance)
- Set proper ACL: only the token owner can decrypt their own balance
- Both sender and receiver must have ACL on their balances after transfers
- Handle uninitialized balances with FHE.isInitialized()

### Overflow Protection Pattern

```solidity
// For transfer:
ebool hasEnough = FHE.ge(balances[from], amount);
balances[from] = FHE.select(hasEnough, FHE.sub(balances[from], amount), balances[from]);
balances[to] = FHE.select(hasEnough, FHE.add(balances[to], amount), balances[to]);
```

### Test Suite Requirements

Write tests covering:
- Minting tokens to an address
- Transferring between accounts
- Balance verification via decryption
- Approval and transferFrom flow
- Insufficient balance handling (should not revert, should keep balances unchanged)

---

## Grading Rubric

| Criteria | Weight | Description |
|----------|--------|-------------|
| ERC-20 Interface | 15% | All 5 core functions implemented |
| Encrypted Balances | 25% | Correct use of euint64, encrypted inputs |
| ACL Permissions | 25% | Proper FHE.allowThis() and FHE.allow() on all updates |
| Overflow Protection | 15% | FHE.select-based safe arithmetic |
| Tests | 20% | Comprehensive test suite with encrypted inputs and decryption |

**Passing Score:** 70%

---

## Key Concepts Applied

- Complete encrypted type usage (euint64 for balances)
- Full ACL lifecycle management across transfers
- FHE.select for conditional transfer logic
- Encrypted input handling with proofs
- Defensive programming patterns from Lesson 2.5
