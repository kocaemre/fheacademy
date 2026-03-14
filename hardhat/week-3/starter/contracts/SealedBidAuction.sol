// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/// @title Sealed-Bid Auction (Starter)
/// @notice Week 3 homework: Build a sealed-bid auction where bids remain encrypted.
/// @dev Complete the TODO sections to implement:
///   - Encrypted bid submission using einput
///   - Encrypted bid comparison using TFHE.gt and TFHE.select
///   - Auction lifecycle management (Open -> Closed -> Revealed)
///   - Winner reveal using reencryption pattern
contract SealedBidAuction is SepoliaZamaFHEVMConfig {
    enum AuctionState {
        Open,
        Closed,
        Revealed
    }

    address public owner;
    AuctionState public state;
    uint256 public endTime;

    // Encrypted bid storage
    mapping(address => euint64) private bids;
    euint64 private highestBid;
    address public highestBidder;

    // Track who has placed a bid
    mapping(address => bool) public hasBid;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier inState(AuctionState _state) {
        require(state == _state, "Invalid auction state");
        _;
    }

    constructor(uint256 _duration) {
        owner = msg.sender;
        state = AuctionState.Open;
        endTime = block.timestamp + _duration;
    }

    /// @notice Place an encrypted bid
    /// @param encryptedBid The encrypted bid amount (einput)
    /// @param inputProof The ZKPoK proof for the input
    function placeBid(
        einput encryptedBid,
        bytes calldata inputProof
    ) external inState(AuctionState.Open) {
        require(!hasBid[msg.sender], "Already placed a bid");

        // TODO: Convert einput to euint64
        //   euint64 bid = TFHE.asEuint64(encryptedBid, inputProof);

        // TODO: Store the encrypted bid
        //   bids[msg.sender] = bid;

        // TODO: Set ACL permissions
        //   TFHE.allowThis(bid);
        //   TFHE.allow(bid, msg.sender);

        // TODO: Compare with current highest bid using TFHE.gt and TFHE.select
        //   If this is the first bid, just set it as highest:
        //   if (!TFHE.isInitialized(highestBid)) {
        //       highestBid = bid;
        //       highestBidder = msg.sender;
        //   } else {
        //       ebool isHigher = TFHE.gt(bid, highestBid);
        //       highestBid = TFHE.select(isHigher, bid, highestBid);
        //       // Note: We cannot use TFHE.select on addresses directly.
        //       // The highestBidder tracking is approximate in the encrypted setting.
        //       // A production implementation would use a different pattern.
        //   }

        // TODO: Set ACL on highestBid
        //   TFHE.allowThis(highestBid);

        hasBid[msg.sender] = true;
    }

    /// @notice Close the auction (only owner)
    function closeAuction() external onlyOwner inState(AuctionState.Open) {
        state = AuctionState.Closed;
    }

    /// @notice Reveal the winning bid amount
    /// @dev The caller must have ACL permission to decrypt the highestBid off-chain
    function revealWinner()
        external
        view
        inState(AuctionState.Closed)
        returns (euint64)
    {
        // TODO: Implement reencryption to reveal winning bid to authorized caller
        //   return highestBid;
        //
        // The caller will decrypt the returned ciphertext handle off-chain
        // using the reencryption pattern with their private key.

        revert("Not implemented - complete the TODO");
    }

    /// @notice Get your own encrypted bid
    /// @return The encrypted bid amount (caller must have ACL permission)
    function getMyBid() external view returns (euint64) {
        require(hasBid[msg.sender], "No bid placed");
        return bids[msg.sender];
    }
}
