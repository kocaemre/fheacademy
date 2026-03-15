# Week 3 - Lesson 3.5: Design Patterns - Auction and Voting

## Learning Objective
Implement two fundamental confidential dApp patterns: sealed-bid auctions and private voting systems.

---

## Pattern 1: Sealed-Bid Auction

A sealed-bid auction is the classic example of what FHE enables that was previously impossible on blockchain: competitive bidding where no one can see other bids.

### How It Works

1. **Bidding phase:** Users submit encrypted bids. Nobody can see any bid amount.
2. **Evaluation phase:** The contract compares all bids using FHE operations to find the highest bid - without ever decrypting them.
3. **Reveal phase:** Only the winning bid amount is revealed. All losing bids remain encrypted forever.

### Contract Architecture

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

contract SealedBidAuction is SepoliaZamaFHEVMConfig {
    address public owner;
    uint256 public auctionEndTime;
    bool public auctionEnded;

    euint64 private highestBid;
    eaddress private highestBidder;
    mapping(address => euint64) private bids;

    constructor(uint256 duration) {
        owner = msg.sender;
        auctionEndTime = block.timestamp + duration;
    }

    function placeBid(externalEuint64 encBid, bytes calldata proof) public {
        require(block.timestamp < auctionEndTime, "Auction ended");
        require(!FHE.isInitialized(bids[msg.sender]), "Already bid");

        euint64 bid = FHE.fromExternal(encBid, proof);
        bids[msg.sender] = bid;
        FHE.allowThis(bids[msg.sender]);
        FHE.allow(bids[msg.sender], msg.sender);

        // Update highest bid using FHE comparison
        if (!FHE.isInitialized(highestBid)) {
            highestBid = bid;
            highestBidder = FHE.asEaddress(msg.sender);
        } else {
            ebool isHigher = FHE.gt(bid, highestBid);
            highestBid = FHE.select(isHigher, bid, highestBid);
            highestBidder = FHE.select(
                isHigher,
                FHE.asEaddress(msg.sender),
                highestBidder
            );
        }

        FHE.allowThis(highestBid);
        FHE.allowThis(highestBidder);
    }

    function endAuction() public {
        require(block.timestamp >= auctionEndTime, "Auction not ended");
        require(!auctionEnded, "Already ended");
        auctionEnded = true;

        // Mark winning bid for decryption
        FHE.makePubliclyDecryptable(highestBid);
        FHE.makePubliclyDecryptable(highestBidder);
    }
}
```

### Key Design Decisions

1. **One bid per address:** Prevents bid manipulation and simplifies logic
2. **Running comparison:** Highest bid is updated with each new bid using FHE.select
3. **No reverts on lower bids:** The bid is accepted regardless - FHE.select simply keeps the higher one
4. **Losing bids stay encrypted:** Only the winner is revealed, preserving losers' privacy
5. **eaddress for winner:** The winner's identity is also tracked in encrypted form

---

## Pattern 2: Private Voting

Private voting demonstrates a different FHE pattern: many encrypted inputs are aggregated, and only the aggregate result is revealed.

### How It Works

1. **Voting phase:** Each voter submits an encrypted vote (ebool: true for yes, false for no)
2. **Accumulation:** Votes are added using FHE.add (true=1, false=0)
3. **Reveal phase:** Only the total counts are decrypted. Individual votes remain encrypted forever.

### Contract Architecture

```solidity
contract PrivateVoting is SepoliaZamaFHEVMConfig {
    address public owner;
    uint256 public votingEndTime;
    bool public votingEnded;

    euint32 private yesVotes;
    euint32 private totalVotes;
    mapping(address => bool) public hasVoted;

    constructor(uint256 duration) {
        owner = msg.sender;
        votingEndTime = block.timestamp + duration;
        yesVotes = FHE.asEuint32(0);
        totalVotes = FHE.asEuint32(0);
        FHE.allowThis(yesVotes);
        FHE.allowThis(totalVotes);
    }

    function vote(externalEbool encVote, bytes calldata proof) public {
        require(block.timestamp < votingEndTime, "Voting ended");
        require(!hasVoted[msg.sender], "Already voted");

        hasVoted[msg.sender] = true;

        ebool voteValue = FHE.fromExternal(encVote, proof);

        // Convert ebool to euint32 for counting
        // true → 1, false → 0
        euint32 voteAsInt = FHE.select(
            voteValue,
            FHE.asEuint32(1),
            FHE.asEuint32(0)
        );

        yesVotes = FHE.add(yesVotes, voteAsInt);
        totalVotes = FHE.add(totalVotes, 1);

        FHE.allowThis(yesVotes);
        FHE.allowThis(totalVotes);
    }

    function endVoting() public {
        require(block.timestamp >= votingEndTime, "Voting not ended");
        require(!votingEnded, "Already ended");
        votingEnded = true;

        // Only reveal totals, never individual votes
        FHE.makePubliclyDecryptable(yesVotes);
        FHE.makePubliclyDecryptable(totalVotes);
    }
}
```

### Key Design Decisions

1. **ebool for votes:** Binary choice (yes/no) uses the smallest possible type
2. **euint32 for counters:** Accumulates votes efficiently
3. **Individual votes never decrypted:** Only yesVotes and totalVotes are revealed
4. **hasVoted mapping is public:** Knowing someone voted is OK; knowing HOW they voted is private
5. **Vote = 1 or 0:** FHE.select converts ebool to integer for addition

---

## Comparing the Two Patterns

| Aspect | Sealed-Bid Auction | Private Voting |
|--------|-------------------|----------------|
| Input type | euint64 (bid amount) | ebool (yes/no) |
| Core operation | Comparison (FHE.gt) | Addition (FHE.add) |
| What is revealed | Winner + winning bid | Total counts only |
| What stays secret | All losing bids | All individual votes |
| Privacy model | Hiding data | Hiding data |
| Number of decryptions | 2 (bid + bidder) | 2 (yes count + total) |

### Common Thread: Minimal Revelation

Both patterns follow the same principle: **reveal only the minimum information needed for the application to function.** In the auction, users need to know who won and how much. In voting, users need to know the outcome. Everything else stays encrypted permanently.

---

## Key Takeaways

1. Sealed-bid auctions use FHE.gt + FHE.select to compare bids without revealing them
2. Private voting uses FHE.add to accumulate encrypted votes
3. Both patterns reveal only aggregate results, keeping individual data private forever
4. FHE enables applications impossible with other privacy tech (ZKP, TEE)
5. Design principle: decrypt the absolute minimum needed for functionality
6. These patterns are building blocks for more complex confidential applications

---

## Quiz Questions

**Q1:** In the sealed-bid auction, why do losing bids remain encrypted forever?
**A:** Because the contract never calls FHE.makePubliclyDecryptable() on losing bids - only on the winning bid. Without this explicit marking, encrypted values stay encrypted permanently. This preserves losers' privacy; nobody ever learns what they were willing to pay, which is crucial for maintaining bidding integrity in future auctions.

**Q2:** What is the fundamental difference between the privacy models of the auction and voting patterns?
**A:** Both hide individual data and reveal aggregates, but the nature differs. The auction hides individual bid amounts while revealing the maximum (winner). Voting hides individual vote choices while revealing the sum (total yes/no counts). Both patterns demonstrate that FHE allows computing meaningful aggregate results from encrypted inputs without revealing any individual contribution.
