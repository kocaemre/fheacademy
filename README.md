# FHE Academy

A 4-week interactive bootcamp platform that teaches Web3 developers how to build confidential smart contracts using Zama's FHEVM.

**Live:** [fheacademy.vercel.app](https://fheacademy.vercel.app)

## What You'll Learn

- **Week 1:** From Solidity to Confidential Solidity -- encrypted types, TFHE operations, ACL basics
- **Week 2:** Mastering Encrypted Types and Access Control -- full type system, confidential ERC-20
- **Week 3:** Building Real-World Confidential dApps -- decryption, frontend integration, sealed-bid auctions
- **Week 4:** Advanced Patterns and Capstone Project -- gas optimization, security hardening, capstone dApp

## Features

- 20 lessons with side-by-side Solidity-to-FHEVM code comparisons ("Migration Mindset")
- 56 inline quiz questions with instant feedback
- 4 graded homework assignments with AI-powered grading prompts
- Hardhat monorepo with starter code (TODOs) and complete solutions for each week
- Wallet-based progress tracking with Supabase cross-device sync
- Dashboard with per-week progress and "Continue Learning" navigation

## Capstone Submission & Grading

Week 1-3 homework uses **AI Grader** -- a prompt generator that works with any AI model (ChatGPT, Claude, etc.). Students paste their code, generate a grading prompt, and save their score.

The Week 4 **capstone project** follows a different process:

1. Student submits their GitHub repository link through the platform
2. The capstone is **manually reviewed** by our team
3. Student receives feedback via email after review
4. Upon passing, student receives a completion certificate NFT

Capstone submissions are stored in Supabase and reviewed manually to ensure quality and originality of the final project.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind v4, shadcn/ui
- **Auth:** thirdweb Connect (wallet-based)
- **Backend:** Supabase (progress + grades + capstone submissions)
- **Contracts:** Hardhat + fhevm 0.6.2 (8 independent projects)
- **Deployment:** Vercel

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

### Supabase Tables

```sql
-- Progress tracking
CREATE TABLE progress (
  wallet_address TEXT PRIMARY KEY,
  completions TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homework scores
CREATE TABLE grades (
  wallet_address TEXT NOT NULL,
  homework_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (wallet_address, homework_id)
);

-- Capstone submissions (manually reviewed)
CREATE TABLE capstone_submissions (
  wallet_address TEXT PRIMARY KEY,
  repo_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending_review',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Hardhat Monorepo

See [hardhat/README.md](hardhat/README.md) for setup instructions and project structure.

## License

MIT
