// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/// @title Capstone: Confidential Voting dApp (Starter)
/// @notice Week 4 homework: Build a confidential voting system using FHEVM.
/// @dev This capstone project combines all FHEVM patterns learned:
///   - Encrypted state variables (vote tallies)
///   - Encrypted input handling (vote submission)
///   - FHE arithmetic (tally accumulation)
///   - ACL permissions (result access control)
///   - Reencryption pattern (result revelation)
///
/// Complete the TODO sections to implement the voting logic.
contract ConfidentialDApp is SepoliaZamaFHEVMConfig {
    struct Proposal {
        string name;
        bool exists;
    }

    address public owner;
    uint256 public proposalCount;

    // Proposal storage
    mapping(uint256 => Proposal) public proposals;

    // Encrypted vote tallies per proposal
    mapping(uint256 => euint64) private voteTallies;

    // Track who has voted on which proposal
    mapping(address => mapping(uint256 => bool)) public hasVotedOn;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Create a new proposal (only owner)
    /// @param name The name/description of the proposal
    /// @return proposalId The ID of the newly created proposal
    function createProposal(
        string memory name
    ) external onlyOwner returns (uint256 proposalId) {
        proposalId = proposalCount;
        proposals[proposalId] = Proposal({name: name, exists: true});
        proposalCount++;
    }

    /// @notice Cast an encrypted vote on a proposal
    /// @param proposalId The proposal to vote on
    /// @param encryptedVote The encrypted vote value (einput)
    /// @param inputProof The ZKPoK proof for the input
    function castVote(
        uint256 proposalId,
        einput encryptedVote,
        bytes calldata inputProof
    ) external {
        require(proposals[proposalId].exists, "Proposal does not exist");
        require(!hasVotedOn[msg.sender][proposalId], "Already voted");

        // TODO: Convert einput to encrypted vote value
        //   euint64 vote = TFHE.asEuint64(encryptedVote, inputProof);

        // TODO: Add vote to proposal tally using TFHE.add
        //   voteTallies[proposalId] = TFHE.add(voteTallies[proposalId], vote);

        // TODO: Set ACL permissions
        //   TFHE.allowThis(voteTallies[proposalId]);
        //   TFHE.allow(voteTallies[proposalId], owner);

        // TODO: Mark voter as having voted
        //   hasVotedOn[msg.sender][proposalId] = true;
    }

    /// @notice Get the encrypted vote tally for a proposal
    /// @param proposalId The proposal to query
    /// @return The encrypted vote tally (caller must have ACL permission to decrypt)
    function getResults(
        uint256 proposalId
    ) external view returns (euint64) {
        require(proposals[proposalId].exists, "Proposal does not exist");

        // TODO: Implement reencryption to reveal vote tally to authorized caller
        //   return voteTallies[proposalId];
        //
        // The caller will decrypt the returned ciphertext handle off-chain
        // using the reencryption pattern with their private key.
        // Only the owner (or addresses granted ACL access) can decrypt.

        revert("Not implemented - complete the TODO");
    }

    /// @notice Check if an address has voted on a proposal
    /// @param voter The address to check
    /// @param proposalId The proposal to check
    /// @return Whether the address has voted
    function hasVoted(
        address voter,
        uint256 proposalId
    ) external view returns (bool) {
        return hasVotedOn[voter][proposalId];
    }

    /// @notice Get proposal details
    /// @param proposalId The proposal to query
    /// @return name The proposal name
    function getProposalName(
        uint256 proposalId
    ) external view returns (string memory name) {
        require(proposals[proposalId].exists, "Proposal does not exist");
        return proposals[proposalId].name;
    }
}
