<p align="center">
  <img src="https://img.shields.io/badge/FHEVM-Bootcamp-F5C518?style=for-the-badge&labelColor=0A0A0F" alt="FHEVM Bootcamp" />
  <img src="https://img.shields.io/badge/Zama-Bounty%20Track-8B5CF6?style=for-the-badge&labelColor=0A0A0F" alt="Zama Bounty Track" />
  <img src="https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity" alt="Solidity" />
</p>

<h1 align="center">FHE Academy</h1>

<p align="center">
  <strong>A 4-week interactive bootcamp for building confidential smart contracts with Zama's FHEVM</strong>
</p>

<p align="center">
  <a href="https://fheacademy.vercel.app">Live Demo</a> &nbsp;·&nbsp;
  <a href="#curriculum">Curriculum</a> &nbsp;·&nbsp;
  <a href="#features">Features</a> &nbsp;·&nbsp;
  <a href="#getting-started">Get Started</a>
</p>

---

## The Problem

Every balance, every transfer, every swap on a public blockchain is visible to anyone. MEV bots extract hundreds of millions annually. Competitors monitor treasury wallets. GDPR compliance is impossible. **Blockchains need confidentiality.**

## The Solution

FHE Academy teaches developers to solve this using **Fully Homomorphic Encryption** — computing on encrypted data without ever decrypting it. The platform uses a **Migration Mindset** approach: every lesson places familiar Solidity code side-by-side with its FHEVM equivalent, so developers see exactly what changes and why.

```
  Counter.sol                    FHECounter.sol
┌─────────────────────┐     ┌──────────────────────────┐
│ uint256 public count │ --> │ euint32 private count    │
│ count = count + 1    │ --> │ count = TFHE.add(count,1)│
│                      │     │ TFHE.allowThis(count)    │
└─────────────────────┘     └──────────────────────────┘
```

## Curriculum

| Week | Topic | Focus | Homework |
|------|-------|-------|----------|
| **1** | From Solidity to Confidential Solidity | Encrypted types, first FHEVM contract | Temperature Converter Migration |
| **2** | Mastering Encrypted Types & Access Control | Full type system, ACL, operations | Confidential ERC-20 Token |
| **3** | Building Real-World Confidential dApps | Decryption, frontends, auction patterns | Sealed-Bid Auction dApp |
| **4** | Advanced Patterns & Capstone | Gas optimization, security, deployment | Student-Designed Confidential dApp |

**20 lessons** · **56 quizzes** · **4 assignments** · **1 capstone** · **~17 hours total**

## Features

### Side-by-Side Code Comparison
Every lesson shows the transformation from standard Solidity to FHEVM — left panel vs right panel, with changed lines highlighted.

### Interactive Quizzes
Multiple-choice questions embedded in lessons with instant feedback and explanations. Answers persist across sessions.

### AI-Powered Grading
Paste your homework code, generate a structured grading prompt, and use it with any AI model (ChatGPT, Claude, or any other). No API keys needed. Save your score to track progress.

### Instructor Notes
Collapsible teaching guidance in every lesson — common misconceptions, practical tips, and live demo suggestions for educators.

### Progress Dashboard
Track overall completion, per-week progress, homework grades, and capstone status. All synced to your wallet across devices.

### Hardhat Starter Projects
8 independent Hardhat projects (4 weeks x starter + solution). Starter contracts have TODO comments guiding the migration. Solutions contain complete FHEVM implementations.

### Capstone & Certification
Week 4 capstone: design, build, and deploy your own confidential dApp. Submit your GitHub repo for manual review. Upon passing, receive a completion certificate.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind v4, shadcn/ui, Shiki |
| Auth | thirdweb Connect (wallet-based) |
| Backend | Supabase (progress, grades, submissions) |
| Contracts | Hardhat, fhevm 0.6.2, Solidity 0.8.24 |
| Deployment | Vercel |

## Getting Started

```bash
# Clone and install
git clone https://github.com/kocaemre/fheacademy.git
cd fheacademy
pnpm install

# Set up environment
cp .env.example .env.local
# Fill in your Supabase and thirdweb credentials

# Run
pnpm dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

### Supabase Setup

```sql
CREATE TABLE progress (
  wallet_address TEXT PRIMARY KEY,
  completions TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grades (
  wallet_address TEXT NOT NULL,
  homework_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (wallet_address, homework_id)
);

CREATE TABLE capstone_submissions (
  wallet_address TEXT PRIMARY KEY,
  repo_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending_review',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Hardhat Projects

```
hardhat/
├── week-1/
│   ├── starter/   # TemperatureConverter.sol (with TODOs)
│   └── solution/  # FHETemperatureConverter.sol (complete)
├── week-2/
│   ├── starter/   # ConfidentialERC20.sol (skeleton)
│   └── solution/  # ConfidentialERC20.sol (complete)
├── week-3/
│   ├── starter/   # SealedBidAuction.sol (skeleton)
│   └── solution/  # SealedBidAuction.sol (complete)
└── week-4/
    ├── starter/   # ConfidentialDApp.sol (skeleton)
    └── solution/  # ConfidentialDApp.sol (complete)
```

Each project is independent with its own `package.json`. Run `npm install && npx hardhat compile` in any directory.

## License

MIT

---

<p align="center">
  Built by <a href="https://github.com/kocaemre">0xemrek</a> · Powered by <a href="https://www.zama.ai">Zama</a>
</p>
