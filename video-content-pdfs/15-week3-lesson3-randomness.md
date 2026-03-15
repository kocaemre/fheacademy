# Week 3 - Lesson 3.3: On-Chain Randomness with FHE

## Learning Objective
Understand how FHEVM provides truly unpredictable and secret on-chain randomness, and compare it with existing solutions like Chainlink VRF.

---

## The Randomness Problem on Blockchain

Generating random numbers on blockchain is notoriously difficult:

1. **Block-based randomness** (block.timestamp, block.prevrandao) - Miners/validators can influence these values. Not truly random.

2. **Commit-reveal schemes** - Require multiple transactions and can be gamed if a participant refuses to reveal.

3. **Chainlink VRF** - Provides verifiable randomness, but the random number is eventually REVEALED on-chain. Everyone can see it.

For applications like card games, lotteries, or private auctions, revealing the random number defeats the purpose.

---

## FHE Randomness: Encrypted and Unpredictable

FHEVM provides random number generation where the result stays encrypted:

```solidity
euint8 randomByte = FHE.randEuint8();     // Random 0-255
euint16 randomShort = FHE.randEuint16();  // Random 0-65535
euint32 randomWord = FHE.randEuint32();   // Random 0-4294967295
euint64 randomLong = FHE.randEuint64();   // Random 0-18446744073709551615
```

**The key insight:** The random value is encrypted. Nobody - not the contract, not the user, not the validator - can see the random number. It exists only as an encrypted value that can be used in FHE computations.

---

## Why FHE Randomness is Special

### Property 1: Truly Unpredictable

The randomness comes from the FHE coprocessor's random number generator, not from blockchain state. It cannot be predicted or influenced by miners, validators, or users.

### Property 2: Stays Secret

Unlike Chainlink VRF where the random number becomes public, FHE randomness stays encrypted. The random value is only revealed if the contract explicitly marks it for decryption.

### Property 3: Composable

The encrypted random value can be used in FHE operations just like any other encrypted value:

```solidity
// Random number between 1 and 6 (dice roll)
euint8 random = FHE.randEuint8();
euint8 diceRoll = FHE.add(FHE.rem(random, 6), 1);
FHE.allowThis(diceRoll);
```

---

## Comparison: FHE vs Chainlink VRF

| Feature | Chainlink VRF | FHE Randomness |
|---------|--------------|----------------|
| Unpredictable | Yes | Yes |
| Verifiable | Yes (proof) | Yes (FHE guarantees) |
| Secret | No (revealed on-chain) | Yes (stays encrypted) |
| Single transaction | No (request + callback) | Yes (instant) |
| External dependency | Yes (Chainlink network) | No (built into FHEVM) |
| Cost | LINK token fee | FHE gas cost |

**Bottom line:** If you need randomness that NOBODY can see, FHE is the only option. If you just need verifiable randomness and visibility is acceptable, Chainlink VRF works.

---

## Use Cases

### Card Dealing

```solidity
function dealCard() internal returns (euint8) {
    euint8 random = FHE.randEuint8();
    euint8 card = FHE.rem(random, 52);  // 0-51, representing 52 cards
    FHE.allowThis(card);
    return card;
}
```

Nobody can see what card was dealt until the game reveals it.

### Lottery

```solidity
function drawWinningNumber() public {
    require(block.timestamp > drawTime, "Too early");
    winningNumber = FHE.randEuint32();
    FHE.allowThis(winningNumber);
    // Winning number exists but nobody knows it yet
    // Players submit their numbers, contract compares privately
}
```

### Hidden Game State

```solidity
function initializeGame() public {
    // Place treasure at random position on 10x10 grid
    treasureX = FHE.rem(FHE.randEuint8(), 10);
    treasureY = FHE.rem(FHE.randEuint8(), 10);
    FHE.allowThis(treasureX);
    FHE.allowThis(treasureY);
    // Nobody knows where the treasure is!
}
```

---

## Key Takeaways

1. FHE.randEuintXX() generates encrypted random numbers that nobody can see
2. Unlike Chainlink VRF, FHE randomness stays secret - the value is never revealed unless explicitly decrypted
3. Random values are generated in a single transaction (no request/callback pattern)
4. Encrypted random values can be used in all FHE operations
5. Use FHE.rem() to constrain random values to a specific range
6. Ideal for games, lotteries, and any application needing secret randomness

---

## Quiz Questions

**Q1:** What is the fundamental advantage of FHE randomness over Chainlink VRF?
**A:** FHE randomness stays encrypted - nobody can see the random value, not even the contract owner or validators. Chainlink VRF provides verifiable randomness, but the value is eventually revealed on-chain. For applications like card games or hidden game state, FHE randomness is the only option that keeps the value truly secret.

**Q2:** How would you generate a random encrypted number between 1 and 100 using FHEVM?
**A:** Use FHE.randEuint8() to generate a random encrypted byte, then FHE.rem(random, 100) to get range 0-99, then FHE.add(result, 1) to shift to range 1-100. The result stays encrypted throughout, and FHE.allowThis() must be called on the stored result.
