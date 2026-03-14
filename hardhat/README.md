# FHE Academy - Hardhat Projects

Hands-on Solidity projects for the FHE Academy 4-week FHEVM bootcamp. Each week has a **starter** project with TODO stubs and a **solution** project with the completed implementation.

## Structure

```
hardhat/
  week-1/   Temperature Converter Migration (Beginner)
    starter/    Plaintext contract with TODO migration markers
    solution/   Complete FHEVM migration with encrypted types
  week-2/   Confidential ERC-20 Token (Intermediate)
    starter/    Contract skeleton with TODO placeholders
    solution/   Full confidential token with encrypted balances
  week-3/   Sealed-Bid Auction dApp (Advanced)
    starter/    Auction skeleton with TODO placeholders
    solution/   Complete sealed-bid auction with encrypted bids
  week-4/   Capstone: Confidential Voting dApp (Advanced)
    starter/    Voting contract skeleton with TODO placeholders
    solution/   Complete confidential voting implementation
```

## Setup

Each week is an independent Hardhat project. To get started with any week:

```bash
# Example: Week 1 starter
cd hardhat/week-1/starter
npm install
npx hardhat compile
npx hardhat test
```

## Mock Mode

All projects use the local Hardhat network with the FHEVM mock mode by default (`defaultNetwork: "hardhat"` in `hardhat.config.ts`). This means:

- No connection to a real FHE network is needed
- Encrypted operations are simulated locally
- Tests run fast without network dependencies
- The `fhevm/hardhat` plugin handles all mock setup automatically

## Workflow

1. Start with the **starter** project for your current week
2. Read the TODO comments in the contract to understand what needs to be implemented
3. Implement the required functionality following the lesson material
4. Run `npx hardhat compile` to check for compilation errors
5. Run `npx hardhat test` to verify your implementation
6. Compare your work with the **solution** project when finished

## Requirements

- Node.js >= 18
- npm or yarn

## Solidity Version

All contracts use Solidity `0.8.24` and import from `fhevm/lib/TFHE.sol` for FHEVM operations.
