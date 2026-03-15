# Week 1: From Solidity to Confidential Solidity

## Introduction

Welcome to Week 1 of FHE Academy. This week you will learn why blockchain privacy matters, understand the Zama FHEVM architecture, set up your development environment, write your very first encrypted smart contract, and test it. By the end of this week, you will have transformed a familiar Solidity counter into a fully confidential FHEVM contract.

---

## The Privacy Crisis on Public Blockchains

Every public blockchain, whether Ethereum, BNB Chain, or Polygon, operates on radical transparency. Every transaction, every balance, every piece of smart contract state is visible to the entire world.

### MEV: The $600 Million Problem

MEV, or Maximal Extractable Value, is the most damaging consequence of blockchain transparency. Here is how it works in practice:

**Front-Running.** You submit a large trade on a decentralized exchange. A bot sees your pending transaction in the mempool, places its own trade before yours pushing the price up, and then lets your trade execute at a worse price. The bot profits. You lose money.

**Sandwich Attacks.** Even worse than front-running. A bot places a trade before AND after yours. They buy before you, pushing the price up. You buy at the inflated price. They sell after you, locking in profit. You get a worse price both ways.

**Liquidation Sniping.** Bots monitor lending protocols for positions close to liquidation. When a position becomes liquidatable, bots compete to liquidate it first, earning bonuses at the borrower's expense.

In 2023 alone, MEV bots extracted over 600 million dollars from Ethereum users. This is not theoretical. It is real money being taken from regular users every single day.

### Beyond MEV

Financial privacy is non-existent. When you receive your salary in ETH or USDC, your employer, colleagues, and the entire world can see exactly how much you earn. Your spending habits, savings, and investments are all publicly visible.

Competitive applications are fundamentally broken. Auctions where everyone sees all bids are not real auctions. The last bidder always wins by bidding slightly more. Voting where everyone sees votes is not secret voting. Social pressure and coercion become possible. Business logic visible to competitors gets copied or exploited.

---

## Privacy Solutions Compared

### Trusted Execution Environments (TEE)

TEEs like Intel SGX create secure hardware enclaves where data is decrypted and processed in isolation. They are fast and support general computation, but require trust in hardware manufacturers. Vulnerabilities like Spectre, Meltdown, and Foreshadow have shown this trust can be misplaced. If the hardware is compromised, all privacy is lost. It is a single point of failure.

### Zero-Knowledge Proofs (ZKP)

ZKPs allow proving something is true without revealing the underlying data. You can prove you have enough balance without showing the amount. Strong mathematical guarantees, no hardware trust needed. But ZKPs prove things about data. They do not compute on encrypted data. Each proof is custom-designed for a specific computation. They are complex to develop and limited in what they can express.

### Fully Homomorphic Encryption (FHE)

FHE enables arbitrary computation on encrypted data without ever decrypting it. No hardware trust needed. No custom proofs required. Data never leaves encrypted form. The trade-off is computational cost, but Zama's coprocessor architecture handles this elegantly.

The unique capability of FHE is cross-party computation on encrypted data. Only FHE can compare two users' encrypted bids without revealing either one. Only FHE can add encrypted votes from different voters without seeing any individual vote. Neither TEEs nor ZKPs can do this.

---

## The Zama FHEVM Architecture

Zama provides a complete 5-layer technology stack that makes FHE practical for blockchain developers.

### TFHE-rs: The Cryptographic Engine

TFHE-rs is Zama's core FHE library written in Rust. TFHE stands for Torus Fully Homomorphic Encryption. It uses programmable bootstrapping to refresh noise in ciphertexts during computation, enabling unlimited computation depth. You never interact with it directly. It powers everything behind the scenes.

### FHEVM: The Solidity Library

FHEVM is what you use in your smart contracts. It provides encrypted types including ebool, euint8, euint16, euint32, euint64, euint128, euint256, and eaddress. It provides FHE operations including add, sub, mul, div, comparisons, and the critical select operation. It provides access control through allowThis, allow, and allowTransient. And it handles input validation through fromExternal with zero-knowledge proofs.

### The Coprocessor: Off-Chain FHE Computation

This is the critical architectural insight. FHE operations are far too expensive to run inside the EVM. When your contract calls FHE.add(a, b), the EVM does not actually perform the encrypted addition. Instead, it records the operation and sends it to the coprocessor. The coprocessor performs the actual FHE computation off-chain on specialized hardware. The result, an encrypted handle, is returned to the contract.

Think of it like a GPU in a computer. The CPU, which is the EVM, sends instructions to the GPU, which is the coprocessor. The GPU does the heavy math and sends results back. The CPU coordinates, the GPU computes.

### KMS: Threshold Key Management

The KMS handles the most sensitive part: decryption keys. The decryption key is split into shares distributed among multiple independent parties using threshold cryptography. No single party can decrypt anything alone. A threshold, for example 3 out of 5, must cooperate to decrypt. This eliminates the single point of failure that TEEs have.

### Relayer SDK: The Client Bridge

The Relayer SDK is the JavaScript library your frontend uses to encrypt inputs client-side before sending transactions, and to decrypt results through the KMS after computations.

### Handles, Not Ciphertexts

When your smart contract stores an encrypted value, it does not store the actual ciphertext, which is very large. Instead, it stores a handle, which is a 256-bit identifier that references the ciphertext stored in the coprocessor. Handles are just 32 bytes, keeping gas costs manageable.

Handles are non-deterministic. The same plaintext value encrypted twice produces different handles. You cannot compare handles to check equality. You must use FHE.eq() instead.

---

## Development Environment Setup

Building FHEVM contracts uses standard Hardhat with two additional packages.

Install the FHEVM Solidity library and Hardhat plugin:
```
npm install fhevm@0.6.2
npm install --save-dev hardhat-fhevm
```

Configure Hardhat with Solidity 0.8.24 and evmVersion cancun. Import hardhat-fhevm in your config file. The plugin automatically handles mock mode configuration.

In your contracts, import FHEVM:
```solidity
import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

contract MyContract is SepoliaZamaFHEVMConfig {
    // Your encrypted code here
}
```

### Mock Mode: The Developer's Best Friend

Mock mode is the most important concept for FHEVM development. When testing locally, there is no coprocessor, no KMS, no FHE hardware. Mock mode simulates FHE operations using plaintext arithmetic. It stores values as plain numbers wrapped to look like handles, performs regular arithmetic instead of FHE operations, and simulates ACL checks.

Mock mode makes tests run in seconds instead of hours. If your contract works in mock mode, the logic will work on the real network. Mock mode activates automatically when you run npx hardhat test. No configuration needed.

What mock mode cannot test: actual encryption strength, real gas costs, ciphertext sizes, timing, and network interactions. For those, you test on Sepolia testnet in Week 4.

---

## Your First FHEVM Contract: The Migration Mindset

The Migration Mindset is the core teaching approach. You transform familiar Solidity patterns into encrypted equivalents through four systematic steps.

### The Original Solidity Counter

```solidity
contract Counter {
    uint32 public count;

    function increment() public {
        count += 1;
    }

    function add(uint32 value) public {
        count += value;
    }

    function getCount() public view returns (uint32) {
        return count;
    }
}
```

### Step 1: Replace Types

Replace uint32 with euint32. Make the state variable private instead of public, because a public getter would auto-generate a function returning a meaningless encrypted handle.

Encrypted type mapping: uint8 becomes euint8, uint16 becomes euint16, uint32 becomes euint32, uint64 becomes euint64, uint128 becomes euint128, uint256 becomes euint256, bool becomes ebool, address becomes eaddress.

### Step 2: Replace Operations

Standard operators do not work on encrypted types. Replace them with FHE library functions.

The operation mapping: a + b becomes FHE.add(a, b). a - b becomes FHE.sub(a, b). a * b becomes FHE.mul(a, b). a / b becomes FHE.div(a, plaintextB) where the divisor must be plaintext. a == b becomes FHE.eq(a, b) returning ebool. a > b becomes FHE.gt(a, b) returning ebool. And if condition then a else b becomes FHE.select(condition, a, b).

For our counter, count += 1 becomes count = FHE.add(count, 1). Note that FHE.add(count, 1) uses a plaintext 1 as the second operand. FHEVM handles mixed encrypted-plaintext operations, and this is cheaper in gas.

### Step 3: Add ACL Permissions

This step is completely new and has no equivalent in standard Solidity. Every time you create or modify an encrypted value, you must set its Access Control List.

**FHE.allowThis(count)** grants the contract itself permission to use the value in future transactions. Each FHE operation creates a NEW ciphertext with a NEW handle that has an EMPTY ACL. Without allowThis, the contract permanently loses access to its own state variable. There is no recovery mechanism. This is the number one source of bugs in FHEVM.

**FHE.allow(count, msg.sender)** grants a specific address permission to decrypt the value. Users need this to read their own data.

### Step 4: Handle Encrypted Inputs

User values must arrive encrypted. FHEVM uses externalEuint32 along with a zero-knowledge proof:

```solidity
function add(externalEuint32 encryptedValue, bytes calldata inputProof) public {
    euint32 value = FHE.fromExternal(encryptedValue, inputProof);
    count = FHE.add(count, value);
    FHE.allowThis(count);
    FHE.allow(count, msg.sender);
}
```

FHE.fromExternal validates the zero-knowledge proof ensuring the user knows the plaintext, the ciphertext is bound to this contract, and the ciphertext is bound to this sender. This prevents replay attacks.

### The Complete Migrated Contract

```solidity
contract EncryptedCounter is SepoliaZamaFHEVMConfig {
    euint32 private count;

    function increment() public {
        count = FHE.add(count, 1);
        FHE.allowThis(count);
        FHE.allow(count, msg.sender);
    }

    function add(externalEuint32 encryptedValue, bytes calldata inputProof) public {
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);
        count = FHE.add(count, value);
        FHE.allowThis(count);
        FHE.allow(count, msg.sender);
    }

    function getCount() public view returns (euint32) {
        return count;
    }
}
```

---

## Testing FHEVM Contracts

Testing uses two key helpers from the hardhat-fhevm plugin.

### Creating Encrypted Inputs

```typescript
const input = await hre.fhevm.createEncryptedInput(
    await counter.getAddress(),
    owner.address
);
input.addUint32(42);
const encrypted = await input.encrypt();
await counter.add(encrypted.handles[0], encrypted.inputProof);
```

createEncryptedInput is bound to a specific contract address and sender address. addUint32 adds a value to encrypt. encrypt() produces handles and a shared proof.

### Decrypting Results

```typescript
const handle = await counter.getCount();
const value = await hre.fhevm.userDecryptEuint32(handle, owner.address);
expect(value).to.equal(42);
```

The address must have ACL permission via FHE.allow() in the contract. Without permission, decryption fails.

### Non-Deterministic Handles

Handles are NOT deterministic. The same plaintext encrypted at different times produces different handles. Never compare handles directly. Always decrypt to compare values.

### Test Categories

Functional tests verify core logic works correctly. Permission tests verify authorized users can decrypt and unauthorized users are blocked. Edge case tests cover zero values, maximum values, and uninitialized state. Integration tests verify multi-user, multi-transaction correctness.

---

## Week 1 Homework: Temperature Converter Migration

Migrate a plaintext TemperatureConverter to FHEVM. The contract stores temperature in Celsius and converts to Fahrenheit using the formula F = (C * 9 / 5) + 32.

Replace uint32 with euint32 for state, externalEuint32 for inputs. Replace arithmetic with FHE.mul(temp, 9), FHE.div(result, 5) which works because the divisor is plaintext, and FHE.add(result, 32). Add FHE.allowThis() and FHE.allow() after every update. Write tests using createEncryptedInput() and userDecryptEuint32().

Grading: Compilation 20%, Encrypted Types 30%, ACL Permissions 20%, Tests 30%. Passing score: 70%.

---

## Week 1 Key Takeaways

1. Public blockchain transparency causes real harm through MEV, privacy loss, and broken competitive applications
2. FHE enables computation on encrypted data, providing the strongest privacy guarantee for smart contracts
3. Zama's coprocessor architecture makes FHE practical. Contracts store handles, the coprocessor does the math
4. The Migration Mindset: replace types, replace operations, add ACL, handle encrypted inputs
5. FHE.allowThis() is mandatory after every state update. Forgetting it causes permanent, irrecoverable data loss
6. Mock mode enables fast local testing that faithfully simulates FHE behavior
7. Handles are non-deterministic. Always decrypt to compare values
8. Zero-knowledge proofs on encrypted inputs prevent replay attacks by binding ciphertext to contract and sender
