// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/// @title Confidential ERC-20 Token (Solution)
/// @notice Week 2 homework solution: A complete confidential ERC-20 token.
/// @dev Demonstrates:
///   - Encrypted balances using euint64
///   - Transfer with overflow protection using TFHE.select
///   - Approve and transferFrom with encrypted allowances
///   - ACL permissions on all encrypted values
contract ConfidentialERC20 is SepoliaZamaFHEVMConfig {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    address public owner;

    // Encrypted balance storage
    mapping(address => euint64) private balances;
    // Encrypted allowance storage
    mapping(address => mapping(address => euint64)) private allowances;

    event Transfer(address indexed from, address indexed to);
    event Approval(address indexed owner, address indexed spender);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    /// @notice Mint encrypted tokens to an address
    /// @param to The recipient address
    /// @param encryptedAmount The encrypted amount to mint (einput)
    /// @param inputProof The ZKPoK proof for the input
    function mint(
        address to,
        einput encryptedAmount,
        bytes calldata inputProof
    ) public onlyOwner {
        euint64 amount = TFHE.asEuint64(encryptedAmount, inputProof);

        // Add to existing balance (handles uninitialized balances via TFHE.add)
        balances[to] = TFHE.add(balances[to], amount);

        // Set ACL: contract can access, recipient can access
        TFHE.allowThis(balances[to]);
        TFHE.allow(balances[to], to);
    }

    /// @notice Transfer encrypted tokens to another address
    /// @param to The recipient address
    /// @param encryptedAmount The encrypted transfer amount (einput)
    /// @param inputProof The ZKPoK proof for the input
    function transfer(
        address to,
        einput encryptedAmount,
        bytes calldata inputProof
    ) public {
        euint64 amount = TFHE.asEuint64(encryptedAmount, inputProof);

        // Overflow protection: only transfer if sender has enough balance
        ebool hasEnough = TFHE.le(amount, balances[msg.sender]);
        euint64 transferAmount = TFHE.select(hasEnough, amount, TFHE.asEuint64(0));

        // Update balances
        balances[msg.sender] = TFHE.sub(balances[msg.sender], transferAmount);
        balances[to] = TFHE.add(balances[to], transferAmount);

        // Set ACL permissions on updated balances
        TFHE.allowThis(balances[msg.sender]);
        TFHE.allow(balances[msg.sender], msg.sender);
        TFHE.allowThis(balances[to]);
        TFHE.allow(balances[to], to);

        emit Transfer(msg.sender, to);
    }

    /// @notice Approve a spender to transfer encrypted tokens on your behalf
    /// @param spender The address to approve
    /// @param encryptedAmount The encrypted allowance amount (einput)
    /// @param inputProof The ZKPoK proof for the input
    function approve(
        address spender,
        einput encryptedAmount,
        bytes calldata inputProof
    ) public {
        euint64 amount = TFHE.asEuint64(encryptedAmount, inputProof);

        // Set the encrypted allowance
        allowances[msg.sender][spender] = amount;

        // Set ACL: contract, owner, and spender can all access
        TFHE.allowThis(allowances[msg.sender][spender]);
        TFHE.allow(allowances[msg.sender][spender], msg.sender);
        TFHE.allow(allowances[msg.sender][spender], spender);

        emit Approval(msg.sender, spender);
    }

    /// @notice Transfer tokens on behalf of another address (requires approval)
    /// @param from The address to transfer from
    /// @param to The address to transfer to
    /// @param encryptedAmount The encrypted transfer amount (einput)
    /// @param inputProof The ZKPoK proof for the input
    function transferFrom(
        address from,
        address to,
        einput encryptedAmount,
        bytes calldata inputProof
    ) public {
        euint64 amount = TFHE.asEuint64(encryptedAmount, inputProof);

        // Check both allowance and balance
        ebool hasAllowance = TFHE.le(amount, allowances[from][msg.sender]);
        ebool hasBalance = TFHE.le(amount, balances[from]);
        ebool canTransfer = TFHE.and(hasAllowance, hasBalance);
        euint64 transferAmount = TFHE.select(canTransfer, amount, TFHE.asEuint64(0));

        // Update balances
        balances[from] = TFHE.sub(balances[from], transferAmount);
        balances[to] = TFHE.add(balances[to], transferAmount);

        // Update allowance
        allowances[from][msg.sender] = TFHE.sub(
            allowances[from][msg.sender],
            transferAmount
        );

        // Set ACL permissions on all updated values
        TFHE.allowThis(balances[from]);
        TFHE.allow(balances[from], from);
        TFHE.allowThis(balances[to]);
        TFHE.allow(balances[to], to);
        TFHE.allowThis(allowances[from][msg.sender]);
        TFHE.allow(allowances[from][msg.sender], from);
        TFHE.allow(allowances[from][msg.sender], msg.sender);

        emit Transfer(from, to);
    }

    /// @notice Get the encrypted balance for an account
    /// @param account The address to query
    /// @return The encrypted balance (caller must have ACL permission to decrypt)
    function balanceOf(address account) public view returns (euint64) {
        return balances[account];
    }

    /// @notice Get the encrypted allowance
    /// @param _owner The token owner
    /// @param spender The approved spender
    /// @return The encrypted allowance (caller must have ACL permission to decrypt)
    function allowance(
        address _owner,
        address spender
    ) public view returns (euint64) {
        return allowances[_owner][spender];
    }
}
