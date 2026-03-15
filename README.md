<p align="center">
  <img src="https://img.shields.io/badge/FHEVM-Bootcamp-F5C518?style=for-the-badge&labelColor=0A0A0F" alt="FHEVM Bootcamp" />
  <img src="https://img.shields.io/badge/Zama-Bounty%20Track-8B5CF6?style=for-the-badge&labelColor=0A0A0F" alt="Zama Bounty Track" />
  <img src="https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/Tailwind%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

<h1 align="center">
  <br>
  FHE Academy
  <br>
</h1>

<h4 align="center">A 4-week interactive bootcamp for building confidential smart contracts with <a href="https://www.zama.ai">Zama's</a> FHEVM</h4>

<p align="center">
  <a href="https://fheacademy.vercel.app"><strong>fheacademy.vercel.app</strong></a>
</p>

<p align="center">
  <a href="https://youtu.be/BNa2t5iOUB0">
    <img src="https://img.shields.io/badge/Demo%20Video-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Demo Video" />
  </a>
</p>

<p align="center">
  <a href="#-why">Why</a> &nbsp;&bull;&nbsp;
  <a href="#-curriculum">Curriculum</a> &nbsp;&bull;&nbsp;
  <a href="#-key-features">Features</a> &nbsp;&bull;&nbsp;
  <a href="#-architecture">Architecture</a> &nbsp;&bull;&nbsp;
  <a href="#-getting-started">Get Started</a>
</p>

---

## 💡 Why

Every balance, every transfer, every swap on a public blockchain is visible to anyone with an internet connection.

> MEV bots extract **$600M+** annually from transparent mempools. Competitors monitor treasury wallets. GDPR compliance on public chains is impossible.

**Fully Homomorphic Encryption** solves this by enabling computation on encrypted data — without ever decrypting it. But there's no structured way to learn it.

**FHE Academy** bridges that gap.

---

## 🎯 How It Works

The platform uses a **Migration Mindset** approach. Every lesson starts with code you already know and shows you — side by side — how to make it confidential:

```
  ERC20.sol                          ConfidentialERC20.sol
 ┌──────────────────────────┐       ┌────────────────────────────────────┐
 │                          │       │                                    │
 │  mapping(address =>      │       │  mapping(address =>                │
 │    uint256) balances;    │  ──>  │    euint64) balances;              │
 │                          │       │                                    │
 │  balances[to] += amount; │  ──>  │  balances[to] = TFHE.add(         │
 │                          │       │    balances[to], amount);          │
 │                          │       │  TFHE.allowThis(balances[to]);     │
 │                          │       │                                    │
 └──────────────────────────┘       └────────────────────────────────────┘
        PUBLIC on-chain                    ENCRYPTED on-chain
```

---

## 📚 Curriculum

<table>
  <tr>
    <th>Week</th>
    <th>Topic</th>
    <th>What You'll Build</th>
    <th>Homework</th>
  </tr>
  <tr>
    <td><strong>1</strong></td>
    <td>From Solidity to Confidential Solidity</td>
    <td>First FHEVM contract — counter migration</td>
    <td>Temperature Converter</td>
  </tr>
  <tr>
    <td><strong>2</strong></td>
    <td>Encrypted Types & Access Control</td>
    <td>Full type system, ACL permissions</td>
    <td>Confidential ERC-20</td>
  </tr>
  <tr>
    <td><strong>3</strong></td>
    <td>Real-World Confidential dApps</td>
    <td>Decryption, frontends, design patterns</td>
    <td>Sealed-Bid Auction</td>
  </tr>
  <tr>
    <td><strong>4</strong></td>
    <td>Advanced Patterns & Capstone</td>
    <td>Gas optimization, security, deployment</td>
    <td>Your Own Confidential dApp</td>
  </tr>
</table>

<p align="center">
  <strong>20 lessons</strong> &nbsp;·&nbsp; <strong>56 quizzes</strong> &nbsp;·&nbsp; <strong>4 assignments</strong> &nbsp;·&nbsp; <strong>1 capstone</strong> &nbsp;·&nbsp; <strong>~17 hours</strong>
</p>

---

## ✨ Key Features

<details>
<summary><strong>Side-by-Side Code Comparison</strong></summary>
<br>
Every lesson places standard Solidity next to its FHEVM equivalent with syntax highlighting and changed-line indicators. Students see exactly what transforms and why.
</details>

<details>
<summary><strong>Interactive Quizzes</strong></summary>
<br>
56 multiple-choice questions embedded throughout lessons. Instant feedback with explanations. Answers persist across sessions so you can pick up where you left off.
</details>

<details>
<summary><strong>AI-Powered Grading</strong></summary>
<br>
Paste your homework code and generate a structured grading prompt. Use it with ChatGPT, Claude, or any AI model — no API keys required. Save your score to track progress.
</details>

<details>
<summary><strong>Instructor Notes</strong></summary>
<br>
Collapsible teaching guidance in every lesson with common misconceptions, practical tips, and live demo suggestions. Designed for both self-learners and educators.
</details>

<details>
<summary><strong>Progress Dashboard</strong></summary>
<br>
Track overall completion, per-week progress, homework grades, and capstone status. Everything syncs to your connected wallet across devices via Supabase.
</details>

<details>
<summary><strong>Hardhat Starter Projects</strong></summary>
<br>
8 independent Hardhat projects (4 weeks x starter + solution). Starter contracts include TODO comments guiding the migration. Reference solutions available for comparison.
</details>

<details>
<summary><strong>Capstone & Certification</strong></summary>
<br>
Design, build, and deploy your own confidential dApp. Submit your GitHub repo for manual review. Upon passing, receive a completion certificate NFT.
</details>

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js 15 (App Router)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Lessons  │  │ Homework │  │Dashboard │  │Landing │  │
│  │ CodeDiff │  │ AIGrader │  │ Progress │  │  Hero  │  │
│  │  Quizzes │  │  Rubrics │  │  Grades  │  │Timeline│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┘  │
│       │              │             │                     │
│  ┌────┴──────────────┴─────────────┴──────┐              │
│  │         ProgressProvider (React)       │              │
│  └────────────────┬───────────────────────┘              │
│                   │                                      │
│  ┌────────────────┴───────────────────────┐              │
│  │     API Routes (/api/progress, etc.)   │              │
│  └────────────────┬───────────────────────┘              │
└───────────────────┼─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────┴─────┐          ┌─────┴──────┐
   │ Supabase │          │  thirdweb  │
   │ Database │          │  Connect   │
   │ progress │          │  (wallet)  │
   │  grades  │          └────────────┘
   │ capstone │
   └──────────┘
```

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, Tailwind v4, shadcn/ui, Shiki |
| **Auth** | thirdweb Connect (wallet-based) |
| **Backend** | Supabase (progress, grades, capstone submissions) |
| **Contracts** | Hardhat, fhevm 0.6.2, Solidity 0.8.24 |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

```bash
git clone https://github.com/kocaemre/fheacademy.git
cd fheacademy
pnpm install
cp .env.example .env.local   # fill in credentials
pnpm dev
```

<details>
<summary><strong>Environment Variables</strong></summary>

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```
</details>

<details>
<summary><strong>Supabase Tables</strong></summary>

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
</details>

---

## 📁 Hardhat Projects

Each week includes independent starter and solution Hardhat projects:

```
hardhat/
├── week-1/
│   ├── starter/   →  TemperatureConverter.sol (with TODOs)
│   └── solution/  →  FHETemperatureConverter.sol
├── week-2/
│   ├── starter/   →  ConfidentialERC20.sol (skeleton)
│   └── solution/  →  ConfidentialERC20.sol
├── week-3/
│   ├── starter/   →  SealedBidAuction.sol (skeleton)
│   └── solution/  →  SealedBidAuction.sol
└── week-4/
    ├── starter/   →  ConfidentialDApp.sol (skeleton)
    └── solution/  →  ConfidentialDApp.sol
```

```bash
cd hardhat/week-1/solution
npm install
npx hardhat compile
```

---

## 📝 License

MIT

---

<p align="center">
  Built by <a href="https://github.com/kocaemre"><strong>0xemrek</strong></a> &nbsp;·&nbsp; Powered by <a href="https://www.zama.ai"><strong>Zama</strong></a>
</p>
