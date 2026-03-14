// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/// @title Capstone: Confidential Voting dApp (Solution)
/// @notice Week 4 homework solution: A complete confidential voting system.
/// @dev Demonstrates all FHEVM patterns combined:
///   - Encrypted state: vote tallies stored as euint64
///   - Encrypted input: votes submitted as einput with ZKPoK
///   - FHE arithmetic: tallies accumulated with TFHE.add
///   - ACL: only owner can view results, voters can verify their vote was counted
///   - Reencryption: results revealed to authorized parties off-chain
///
/// Design decisions:
///   - Vote values are euint64 to support weighted voting (e.g., 1 for yes, 0 for no)
///   - Each address can vote once per proposal
///   - Only the contract owner can create proposals
///   - Results are accessible to the owner via reencryption
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

    // Track total number of voters per proposal (plaintext, for transparency)
    mapping(uint256 => uint256) public voterCount;

    event ProposalCreated(uint256 indexed proposalId, string name);
    event VoteCast(uint256 indexed proposalId, address indexed voter);

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

        emit ProposalCreated(proposalId, name);
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

        // Convert encrypted input to euint64
        euint64 vote = TFHE.asEuint64(encryptedVote, inputProof);

        // Add vote to proposal tally (handles uninitialized tallies via TFHE.add)
        voteTallies[proposalId] = TFHE.add(voteTallies[proposalId], vote);

        // Set ACL: contract can access tally, owner can decrypt results
        TFHE.allowThis(voteTallies[proposalId]);
        TFHE.allow(voteTallies[proposalId], owner);

        // Mark voter as having voted
        hasVotedOn[msg.sender][proposalId] = true;
        voterCount[proposalId]++;

        emit VoteCast(proposalId, msg.sender);
    }

    /// @notice Get the encrypted vote tally for a proposal
    /// @param proposalId The proposal to query
    /// @return The encrypted vote tally handle
    /// @dev The caller must have ACL permission (owner) to decrypt off-chain
    function getResults(
        uint256 proposalId
    ) external view returns (euint64) {
        require(proposals[proposalId].exists, "Proposal does not exist");
        return voteTallies[proposalId];
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

    /// @notice Get the number of voters for a proposal
    /// @param proposalId The proposal to query
    /// @return The number of addresses that have voted
    function getVoterCount(
        uint256 proposalId
    ) external view returns (uint256) {
        return voterCount[proposalId];
    }
}
