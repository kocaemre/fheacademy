# Week 1 - Lesson 1.3: Development Environment Setup

## Learning Objective
Set up a complete FHEVM development environment with Hardhat and understand mock mode for local testing.

---

## Development Tools Overview

Building FHEVM smart contracts requires a few specialized tools on top of the standard Ethereum development stack. If you have built Solidity projects before, most of this will feel familiar.

### Prerequisites

Before starting, ensure you have:
- **Node.js** version 20 or higher
- **npm** or **pnpm** package manager
- **VS Code** (recommended editor)
- **MetaMask** or another Web3 wallet
- Basic familiarity with Hardhat and Solidity

---

## Setting Up Hardhat for FHEVM

### Step 1: Create a New Project

Start with a standard Hardhat TypeScript project:

```bash
mkdir my-fhevm-project
cd my-fhevm-project
npm init -y
npm install --save-dev hardhat
npx hardhat init
# Choose: "Create a TypeScript project"
```

### Step 2: Install FHEVM Dependencies

Install the FHEVM Solidity library and Hardhat plugin:

```bash
npm install fhevm@0.6.2
npm install --save-dev hardhat-fhevm
```

The `fhevm` package provides:
- Solidity library with encrypted types and operations
- Type definitions for TypeScript
- Helper utilities for testing

The `hardhat-fhevm` plugin provides:
- Mock mode for local testing
- Test helpers for creating encrypted inputs
- Decryption utilities for test verification

### Step 3: Configure Hardhat

Update your `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-fhevm";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      evmVersion: "cancun",
    },
  },
};

export default config;
```

**Important settings:**
- Solidity version `0.8.24` is required for FHEVM compatibility
- `evmVersion: "cancun"` enables the latest EVM features
- `bytecodeHash: "none"` is recommended for deterministic deployments
- The `hardhat-fhevm` plugin automatically configures mock mode

### Step 4: Import FHEVM in Contracts

In your Solidity files, import FHEVM:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

contract MyContract is SepoliaZamaFHEVMConfig {
    // Your encrypted contract code here
}
```

Key imports:
- `TFHE.sol` - Main library with all FHE operations
- `ZamaFHEVMConfig.sol` - Auto-configures coprocessor connection by chain ID
- `SepoliaZamaFHEVMConfig` - Base contract for Sepolia testnet configuration

---

## Understanding Mock Mode

Mock mode is perhaps the most critical concept for FHEVM development. Understanding it will save you enormous amounts of time and frustration.

### What is Mock Mode?

When you run tests locally with Hardhat, there is no coprocessor available. There is no KMS. There is no FHE hardware. So how do you test encrypted contracts?

**Mock mode simulates FHE operations using plaintext arithmetic.** Instead of actually encrypting values and performing homomorphic operations, mock mode:

1. Stores values as plain numbers (but wrapped to look like handles)
2. Performs regular arithmetic instead of FHE operations
3. Simulates ACL checks
4. Returns results that match what real FHE would produce

### Why Mock Mode Matters

**Speed:** Real FHE operations take seconds to minutes. Mock mode operations are instant. This means your test suite runs in seconds, not hours.

**Correctness:** Mock mode faithfully simulates the behavior of real FHE operations. If your contract works in mock mode, it will work on the real network (with the same logic).

**Development cycle:** You can iterate rapidly - write code, run tests, fix bugs, repeat - all locally without needing network access.

### What Mock Mode Does NOT Test

Mock mode cannot test:
- **Actual encryption strength** - values are not really encrypted
- **Gas costs** - FHE operations have very different gas costs than regular arithmetic
- **Ciphertext sizes** - mock handles are smaller than real ciphertexts
- **Timing** - real FHE operations are much slower
- **Network interactions** - coprocessor communication, KMS decryption

For these aspects, you need to test on the Sepolia testnet (covered in Week 4, Lesson 4.5).

### Mock Mode is Automatic

When you import `hardhat-fhevm` and run `npx hardhat test`, mock mode activates automatically. No configuration needed. No flags to set. It just works.

---

## VS Code Setup

### Recommended Extensions

1. **Solidity (Juan Blanco)** - Syntax highlighting, compilation, and linting for Solidity files
2. **Hardhat Solidity** - Hardhat-specific Solidity support with better error messages
3. **ESLint** - TypeScript/JavaScript linting for test files

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "solidity.compileUsingRemoteVersion": "v0.8.24",
  "solidity.defaultCompiler": "localNodeModule",
  "editor.formatOnSave": true
}
```

---

## Project Structure

A well-organized FHEVM project looks like this:

```
my-fhevm-project/
├── contracts/          # Solidity smart contracts
│   └── MyContract.sol
├── test/               # Test files
│   └── MyContract.test.ts
├── scripts/            # Deployment scripts
│   └── deploy.ts
├── hardhat.config.ts   # Hardhat configuration
├── package.json
└── tsconfig.json
```

This is identical to a standard Hardhat project. FHEVM does not require any special directory structure.

---

## Verifying Your Setup

Run this quick check to verify everything is configured correctly:

```bash
# Compile contracts (should succeed with no errors)
npx hardhat compile

# Run tests (should use mock mode automatically)
npx hardhat test
```

If compilation succeeds and tests run, your environment is ready for FHEVM development.

---

## Key Takeaways

1. FHEVM development uses standard Hardhat with two additional packages: `fhevm` and `hardhat-fhevm`
2. Mock mode simulates FHE operations locally using plaintext arithmetic for fast testing
3. Mock mode activates automatically - no configuration needed
4. Mock mode tests logic correctness but not encryption, gas costs, or network behavior
5. The project structure is identical to standard Hardhat projects
6. Use Solidity 0.8.24 with `evmVersion: "cancun"` for FHEVM compatibility

---

## Quiz Questions

**Q1:** What is mock mode and why is it essential for FHEVM development?
**A:** Mock mode simulates FHE operations using plaintext arithmetic during local testing. It is essential because real FHE operations are computationally expensive and require a coprocessor and KMS infrastructure. Mock mode enables rapid development cycles by running tests instantly while faithfully simulating FHE behavior and ACL checks.

**Q2:** What are the limitations of mock mode that developers should be aware of?
**A:** Mock mode cannot test actual encryption strength (values are not really encrypted), real gas costs (FHE operations cost significantly more than regular arithmetic), ciphertext sizes, operation timing (real FHE is much slower), or network interactions with the coprocessor and KMS. For these aspects, developers must test on the Sepolia testnet.
