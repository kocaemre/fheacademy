# Week 4 - Lesson 4.5: Deployment to Testnet

## Learning Objective
Deploy FHEVM smart contracts to Ethereum Sepolia testnet and interact with them using the Relayer SDK.

---

## From Mock Mode to Real Network

Throughout this course, you have been testing with mock mode - simulated FHE operations running locally. Now it is time to deploy to a real network where actual FHE computation happens on the coprocessor.

---

## Prerequisites

### 1. Sepolia ETH
You need testnet ETH for gas fees. Get it from faucets:
- Alchemy Sepolia Faucet
- Infura Sepolia Faucet
- Google Cloud Sepolia Faucet

### 2. RPC Endpoint
You need a Sepolia RPC URL from a provider:
- Alchemy, Infura, or QuickNode
- Free tiers are sufficient for testing

### 3. Private Key
Your deployer wallet's private key. Never share this or commit it to version control.

### 4. Environment Setup

Create a `.env` file (add to `.gitignore`!):
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

---

## Hardhat Configuration for Testnet

Update `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-fhevm";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      metadata: { bytecodeHash: "none" },
      evmVersion: "cancun",
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
};

export default config;
```

---

## Contract Configuration for Testnet

Your contract inherits from `SepoliaZamaFHEVMConfig` which auto-configures the coprocessor connection:

```solidity
import "fhevm/config/ZamaFHEVMConfig.sol";

contract MyContract is SepoliaZamaFHEVMConfig {
    // ZamaEthereumConfig resolves the coprocessor address
    // based on the chain ID (11155111 for Sepolia)
    // No manual configuration needed!
}
```

**Key insight:** `ZamaEthereumConfig` (via `SepoliaZamaFHEVMConfig`) automatically resolves the correct coprocessor, ACL, and KMS addresses based on the chain ID. You do not need to hardcode any addresses.

---

## Deployment Script

Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
    console.log("Deploying EncryptedCounter...");

    const Counter = await ethers.getContractFactory("EncryptedCounter");
    const counter = await Counter.deploy();
    await counter.waitForDeployment();

    const address = await counter.getAddress();
    console.log(`EncryptedCounter deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

This is nearly identical to a standard Hardhat deployment script. No FHEVM-specific deployment logic is needed.

### Deploy

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## Differences from Mock Mode

When running on testnet:

| Aspect | Mock Mode | Testnet |
|--------|-----------|---------|
| FHE operations | Simulated (instant) | Real (seconds to minutes) |
| Gas costs | Normal EVM gas | Much higher (FHE operations) |
| Encryption | Simulated | Real TFHE encryption |
| Coprocessor | Not used | Active |
| KMS | Not used | Active (threshold decryption) |
| ACL | Simulated | Enforced by coprocessor |

### Important Behavioral Differences

1. **Transactions are slower:** FHE operations require coprocessor computation, which adds latency.
2. **Gas costs are real:** Budget more ETH for testing than you would for standard Solidity.
3. **Encryption is real:** Values are actually encrypted - you cannot read them from the blockchain.
4. **Decryption requires KMS:** The threshold decryption process involves multiple KMS nodes.

---

## Interacting with Deployed Contracts

### Using the Relayer SDK

```javascript
import { createInstance } from "@zama-fhe/relayer-sdk";
import { ethers } from "ethers";

// Connect to Sepolia
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Create FHEVM instance for Sepolia
const fhevm = await createInstance({ chainId: 11155111 });

// Connect to deployed contract
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Encrypt and send
const input = fhevm.createEncryptedInput(contractAddress, wallet.address);
input.addUint32(42);
const encrypted = await input.encrypt();

const tx = await contract.add(encrypted.handles[0], encrypted.inputProof);
await tx.wait();
console.log("Transaction confirmed on Sepolia!");
```

---

## Contract Verification

Verify your contract on Etherscan for transparency:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

Verified contracts allow others to read the source code and interact through Etherscan's UI.

---

## Deployment Checklist

Before deploying to testnet:

1. All tests pass in mock mode
2. Security audit checklist completed (Lesson 4.2)
3. Gas optimization applied (Lesson 4.1)
4. Environment variables configured (.env)
5. .env added to .gitignore
6. Contract inherits from SepoliaZamaFHEVMConfig
7. Sufficient Sepolia ETH for deployment and testing

---

## Key Takeaways

1. Testnet deployment uses standard Hardhat workflow - nearly identical to regular Solidity
2. ZamaEthereumConfig auto-configures coprocessor connection by chain ID
3. Real FHE operations are significantly slower and more expensive than mock mode
4. The Relayer SDK connects your frontend to deployed contracts with real encryption
5. Always verify contracts on Etherscan for transparency
6. Test thoroughly in mock mode before deploying - testnet iterations are slow and costly

---

## Quiz Questions

**Q1:** Why is ZamaEthereumConfig important for deployment, and how does it work?
**A:** ZamaEthereumConfig automatically resolves the correct coprocessor, ACL, and KMS contract addresses based on the blockchain's chain ID. For Sepolia (chain ID 11155111), it connects to Zama's deployed infrastructure. This means developers do not need to manually configure or hardcode infrastructure addresses, reducing deployment errors and simplifying network switching.

**Q2:** What are the key differences a developer will notice when moving from mock mode to testnet?
**A:** Transactions are significantly slower due to real FHE computation in the coprocessor. Gas costs are much higher because FHE operations are computationally expensive. Encryption is real - values cannot be read from blockchain state. Decryption requires the KMS threshold decryption process. These differences make thorough mock mode testing essential before testnet deployment to avoid costly debugging.
