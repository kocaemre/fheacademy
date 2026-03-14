// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/// @title Confidential ERC-20 Token (Starter)
/// @notice Week 2 homework: Build a confidential ERC-20 with encrypted balances.
/// @dev Complete the TODO sections to implement:
///   - Encrypted balance storage using euint64
///   - Transfer with overflow protection using TFHE.select
///   - Approve and transferFrom with encrypted allowances
///   - View functions using reencryption pattern
contract ConfidentialERC20 is SepoliaZamaFHEVMConfig {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    address public owner;

    // TODO: Replace these with encrypted mappings:
    //   mapping(address => euint64) private balances;
    //   mapping(address => mapping(address => euint64)) private allowances;
    mapping(address => uint256) private _plainBalances; // Replace with euint64
    mapping(address => mapping(address => uint256)) private _plainAllowances; // Replace with euint64

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
        // TODO: Convert einput to euint64:
        //   euint64 amount = TFHE.asEuint64(encryptedAmount, inputProof);
        //
        // TODO: Add to existing balance:
        //   balances[to] = TFHE.add(balances[to], amount);
        //
        // TODO: Set ACL permissions:
        //   TFHE.allowThis(balances[to]);
        //   TFHE.allow(balances[to], to);
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
        // TODO: Convert einput to euint64:
        //   euint64 amount = TFHE.asEuint64(encryptedAmount, inputProof);
        //
        // TODO: Check if sender has sufficient balance (overflow protection):
        //   ebool hasEnough = TFHE.le(amount, balances[msg.sender]);
        //   euint64 transferAmount = TFHE.select(hasEnough, amount, TFHE.asEuint64(0));
        //
        // TODO: Update balances:
        //   balances[msg.sender] = TFHE.sub(balances[msg.sender], transferAmount);
        //   balances[to] = TFHE.add(balances[to], transferAmount);
        //
        // TODO: Set ACL permissions on updated balances:
        //   TFHE.allowThis(balances[msg.sender]);
        //   TFHE.allow(balances[msg.sender], msg.sender);
        //   TFHE.allowThis(balances[to]);
        //   TFHE.allow(balances[to], to);
        //
        // emit Transfer(msg.sender, to);
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
        // TODO: Convert einput to euint64:
        //   euint64 amount = TFHE.asEuint64(encryptedAmount, inputProof);
        //
        // TODO: Set the allowance:
        //   allowances[msg.sender][spender] = amount;
        //
        // TODO: Set ACL permissions:
        //   TFHE.allowThis(allowances[msg.sender][spender]);
        //   TFHE.allow(allowances[msg.sender][spender], msg.sender);
        //   TFHE.allow(allowances[msg.sender][spender], spender);
        //
        // emit Approval(msg.sender, spender);
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
        // TODO: Convert einput to euint64:
        //   euint64 amount = TFHE.asEuint64(encryptedAmount, inputProof);
        //
        // TODO: Check allowance and balance:
        //   ebool hasAllowance = TFHE.le(amount, allowances[from][msg.sender]);
        //   ebool hasBalance = TFHE.le(amount, balances[from]);
        //   ebool canTransfer = TFHE.and(hasAllowance, hasBalance);
        //   euint64 transferAmount = TFHE.select(canTransfer, amount, TFHE.asEuint64(0));
        //
        // TODO: Update balances and allowance:
        //   balances[from] = TFHE.sub(balances[from], transferAmount);
        //   balances[to] = TFHE.add(balances[to], transferAmount);
        //   allowances[from][msg.sender] = TFHE.sub(allowances[from][msg.sender], transferAmount);
        //
        // TODO: Set ACL permissions on all updated values
        //
        // emit Transfer(from, to);
    }

    /// @notice Get your encrypted balance
    /// @dev In FHEVM, the caller needs ACL permission to decrypt this off-chain
    // TODO: Return euint64 instead of uint256
    function balanceOf(address account) public view returns (uint256) {
        // TODO: Return the encrypted balance:
        //   return balances[account];
        return _plainBalances[account];
    }

    /// @notice Get the encrypted allowance
    // TODO: Return euint64 instead of uint256
    function allowance(
        address _owner,
        address spender
    ) public view returns (uint256) {
        // TODO: Return the encrypted allowance:
        //   return allowances[_owner][spender];
        return _plainAllowances[_owner][spender];
    }
}
