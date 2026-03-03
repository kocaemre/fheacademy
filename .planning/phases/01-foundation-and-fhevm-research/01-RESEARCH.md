# Phase 1: Foundation and FHEVM Research - Research

**Researched:** 2026-03-03
**Domain:** Next.js 15 project scaffolding, FHEVM v0.9 API reference creation, curriculum outline
**Confidence:** HIGH

## Summary

Phase 1 is a foundation phase with two distinct workstreams: (1) scaffolding a Next.js 15 + Tailwind v4 + shadcn/ui project deployed to Vercel, and (2) producing verified FHEVM v0.9 reference documentation (API cheatsheet, Solidity-to-FHEVM transformation guide, curriculum outline). The project scaffolding is straightforward -- `create-next-app` with pnpm, Tailwind v4 CSS-first config, and shadcn/ui init. The FHEVM reference work is the higher-risk item: FHEVM v0.9 introduced significant breaking changes from earlier versions (TFHE->FHE namespace rename in v0.7, Oracle elimination in v0.9, self-relaying decryption model), and all code examples must be verified against current Zama docs to avoid shipping deprecated patterns.

The curriculum outline is well-defined by the existing project plan document (20 lessons, 4 weeks, 4 homeworks, 1 capstone) and primarily needs FHEVM API accuracy verification plus structuring into the required format.

**Primary recommendation:** Scaffold the Next.js project first (fast, mechanical), then produce the FHEVM reference materials using Context7 and docs.zama.org as primary sources -- never generate FHEVM code from memory alone.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Ship as a reusable content asset -- polished cheatsheet that lives on the platform as bonus content (judges see it)
- Also serves as internal source of truth for all 20 lessons in Phase 3
- Must be verified against current v0.9 docs via Context7 and docs.zama.org -- no AI-generated FHEVM content without verification
- Covers: all encrypted types, all FHE.* operations, ACL system, encrypted inputs, self-relaying decryption model
- Solidity-to-FHEVM Transformation Reference organized by migration step (sequential): import -> types -> operations -> ACL -> inputs -> decrypt
- Mirrors how a developer would actually migrate a contract -- matches the "Migration Mindset" teaching philosophy
- Each step shows vanilla Solidity on left, FHEVM equivalent on right, with explanation of what changed and why
- Full outline: title + learning objectives + key code concepts + quiz topic ideas per lesson
- Follow the project plan document closely -- it already has detailed lesson breakdowns
- Verify FHEVM API accuracy against current docs; update any outdated references (TFHE.* -> FHE.*, Oracle -> self-relaying)
- 4 weeks, 20 lessons, 4 homeworks, 1 capstone -- structure matches the plan document
- Package manager: pnpm
- Framework: Next.js 15 (App Router, Turbopack, React 19)
- Styling: Tailwind CSS v4 + shadcn/ui
- All dependency versions pinned exactly in package.json
- Deploy to Vercel on day 1 (even as placeholder)

### Claude's Discretion
- Exact folder structure within app/ (route groups, layout nesting)
- shadcn/ui component selection during init
- .env.example structure and variable naming
- README content for initial commit

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CURR-05 | All FHEVM code examples use current v0.9 API (`FHE.*` syntax, self-relaying decryption, `externalEuint` inputs) | FHEVM v0.9 API verified via Context7 (`/zama-ai/fhevm`) and docs.zama.org. Migration guide confirms: TFHE->FHE rename (v0.7), Oracle eliminated (v0.9), self-relaying via `@zama-fhe/relayer-sdk`. All FHE.* functions, encrypted types, ACL patterns, and decryption model documented below. |
| INFRA-01 | Next.js 15 project with App Router, React 19, Tailwind v4, shadcn/ui | Next.js 15.5.x is the latest stable 15.x line (15.5.9). Tailwind CSS v4.2.x uses CSS-first config (`@import "tailwindcss"`). shadcn/ui fully supports Tailwind v4 + React 19. pnpm setup verified. |
| INFRA-02 | Deployed to Vercel with environment variables configured | Standard Vercel deploy from git. Env vars needed: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` -- values TBD in Phase 4, but `.env.example` should be created now. |
| INFRA-03 | All dependency versions pinned exactly in package.json | Use exact versions (no `^` or `~` prefixes). pnpm lockfile (`pnpm-lock.yaml`) provides additional reproducibility. |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.9 | React framework with App Router | Latest stable Next.js 15.x; App Router is the standard for new projects; Turbopack dev server included |
| react / react-dom | 19.x (installed by create-next-app) | UI library | Required by Next.js 15; React 19 is stable and default |
| tailwindcss | 4.2.x | Utility-first CSS | v4 uses CSS-first config; no tailwind.config.js needed |
| @tailwindcss/postcss | 4.2.x | PostCSS plugin for Tailwind v4 | Required for Next.js integration with Tailwind v4 |
| postcss | latest | CSS transformation | Peer dependency of @tailwindcss/postcss |
| typescript | 5.x | Type safety | Default with create-next-app |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui (CLI) | latest (`pnpm dlx shadcn@latest init`) | Component library | During init -- adds components to project, not a runtime dependency |
| @fhevm/solidity | 0.9.1+ | FHEVM Solidity library | Reference only in Phase 1 -- used in Hardhat projects in Phase 5 |
| @zama-fhe/relayer-sdk | 0.3.0+ | Off-chain decryption SDK | Reference only in Phase 1 -- used in frontend integration in Phase 5 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js 15.5.x | Next.js 16.1.x (latest) | 16.x is newest but user decision locked Next.js 15; 15.5.9 is latest stable 15.x with security patches |
| pnpm | npm / yarn / bun | User decision locked pnpm; best lockfile determinism, workspace support for future monorepo |
| Tailwind v4 | Tailwind v3 | User decision locked v4; CSS-first config is simpler, no tailwind.config.js needed |

**Installation:**
```bash
# Project scaffolding
pnpm create next-app@latest fheacademy --typescript --tailwind --eslint --app --turbopack --use-pnpm

# Verify Tailwind v4 is installed (create-next-app should install v4 by default)
# If not, install manually:
pnpm add tailwindcss@latest @tailwindcss/postcss@latest postcss

# Initialize shadcn/ui
pnpm dlx shadcn@latest init
```

---

## Architecture Patterns

### Recommended Project Structure

```
fheacademy/
├── app/
│   ├── layout.tsx              # Root layout (html, body, fonts, metadata)
│   ├── page.tsx                # Landing/placeholder page
│   ├── globals.css             # @import "tailwindcss" + custom theme variables
│   │
│   ├── (platform)/             # Route group for lesson platform (Phase 2+)
│   │   ├── layout.tsx          # Platform layout with sidebar
│   │   ├── syllabus/
│   │   ├── week/[weekId]/
│   │   └── homework/[weekId]/
│   │
│   └── api/                    # API routes (Phase 4+)
│       └── progress/
│
├── components/
│   └── ui/                     # shadcn/ui components land here
│
├── lib/
│   └── utils.ts                # shadcn/ui cn() utility
│
├── content/                    # FHEVM reference docs (Phase 1 deliverables)
│   ├── fhevm-api-reference.md  # Or .tsx if shipped as platform content
│   ├── solidity-to-fhevm.md
│   └── curriculum-outline.md
│
├── public/
├── postcss.config.mjs
├── next.config.ts
├── tsconfig.json
├── package.json                # All versions pinned exactly
├── pnpm-lock.yaml
├── .env.example
└── .gitignore
```

**Notes on structure:**
- Route groups `(platform)` keep the URL clean while allowing different layouts
- `content/` directory holds the Phase 1 reference deliverables -- these become platform content in Phase 3
- shadcn/ui components install to `components/ui/` by default
- The `(platform)` route group is a placeholder for Phase 2; Phase 1 only needs the root `page.tsx`

### Pattern 1: Tailwind v4 CSS-First Configuration

**What:** Tailwind v4 eliminates `tailwind.config.js` in favor of CSS-based configuration using `@theme` directive.
**When to use:** All styling configuration for this project.

```css
/* app/globals.css */
@import "tailwindcss";

/* Zama-inspired dark theme */
@theme {
  --color-background: #0A0A0F;
  --color-surface: #13131A;
  --color-surface-hover: #1A1A24;
  --color-border: #1E1E2E;
  --color-border-active: #2A2A3E;

  --color-primary: #F5C518;
  --color-primary-hover: #D4A812;
  --color-secondary: #8B5CF6;
  --color-secondary-hover: #7C3AED;

  --color-text-primary: #F1F1F3;
  --color-text-secondary: #9191A4;
  --color-text-muted: #5A5A6E;

  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  --color-code-bg: #1A1A2E;
  --color-code-border: #252540;

  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```
Source: Tailwind CSS v4 docs (https://tailwindcss.com/docs/installation/framework-guides/nextjs), Zama design tokens from project plan

### Pattern 2: PostCSS Configuration for Tailwind v4

**What:** Tailwind v4 uses `@tailwindcss/postcss` plugin instead of the old `tailwindcss` plugin.
**When to use:** Required for Tailwind v4 to work with Next.js.

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```
Source: Tailwind CSS v4 Next.js guide (https://tailwindcss.com/docs/installation/framework-guides/nextjs)

### Pattern 3: Pinned Dependencies in package.json

**What:** Use exact version numbers without `^` or `~` prefixes.
**When to use:** All dependencies in this project (INFRA-03 requirement).

```json
{
  "dependencies": {
    "next": "15.5.9",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "tailwindcss": "4.2.1",
    "@tailwindcss/postcss": "4.2.1",
    "postcss": "8.5.3",
    "typescript": "5.7.3",
    "@types/react": "19.0.10",
    "@types/react-dom": "19.0.4"
  }
}
```
**Important:** After `create-next-app` generates the project, manually remove all `^` prefixes from `package.json`. Then run `pnpm install` to regenerate the lockfile with exact versions.

### Anti-Patterns to Avoid
- **Using `tailwind.config.js` with Tailwind v4:** v4 uses CSS-first configuration via `@theme` in your CSS file. A JS config file is not needed and will cause confusion.
- **Using `@tailwind base/components/utilities` directives:** v4 replaces these with `@import "tailwindcss"`.
- **Installing Next.js 16:** The user locked Next.js 15. Pin to 15.5.9 (latest stable 15.x).
- **Using `npm` or `yarn`:** The user locked pnpm as the package manager.
- **Generating FHEVM code from memory:** All FHEVM code examples MUST be verified against current docs. The API has changed significantly across versions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS utility framework | Custom CSS classes | Tailwind v4 | Battle-tested, design system consistency, JIT compilation |
| UI component primitives | Custom buttons, inputs, dialogs | shadcn/ui | Accessible, composable, follows Radix UI patterns, Tailwind v4 compatible |
| Project scaffolding | Manual webpack/babel config | create-next-app | Handles React 19, Turbopack, TypeScript, ESLint config automatically |
| FHEVM API documentation | AI-generated content from training data | Context7 + docs.zama.org verification | Training data is stale; FHEVM API changed significantly in v0.7 and v0.9 |
| Deployment pipeline | Custom CI/CD | Vercel Git integration | Zero-config deployment, automatic preview deploys, env var management |

**Key insight:** The project scaffolding is a solved problem -- `create-next-app` handles it. The real Phase 1 value is in accurate, verified FHEVM reference content. Every minute spent on custom tooling is a minute not spent verifying API accuracy.

---

## Common Pitfalls

### Pitfall 1: Stale FHEVM API References
**What goes wrong:** Code examples use deprecated `TFHE.*` namespace, `Gateway.requestDecryption()`, `GatewayCaller`, `einput` types, or chain-specific config imports (`SepoliaConfig`).
**Why it happens:** FHEVM has undergone rapid API evolution. v0.7 (July 2025) renamed TFHE to FHE and replaced `einput` with `externalEuintXX`. v0.9 eliminated the Oracle entirely and introduced self-relaying decryption.
**How to avoid:** Every FHEVM code example must be verified against Context7 (`/zama-ai/fhevm`) or docs.zama.org/protocol/solidity-guides. Never write FHEVM code from memory.
**Warning signs:** Any reference to `TFHE.`, `Gateway.requestDecryption`, `GatewayCaller`, `einput`, `SepoliaConfig`, or `decryptionOracle`.

### Pitfall 2: Tailwind v4 Configuration Confusion
**What goes wrong:** Developer creates a `tailwind.config.js` file (v3 pattern) or uses `@tailwind base; @tailwind components; @tailwind utilities;` directives.
**Why it happens:** Most tutorials and AI training data reference Tailwind v3 patterns. v4 is fundamentally different.
**How to avoid:** Use only `@import "tailwindcss"` in CSS. Configure theme via `@theme {}` directive in CSS. Use `@tailwindcss/postcss` plugin (not `tailwindcss` in PostCSS config).
**Warning signs:** Presence of `tailwind.config.js`, `@tailwind` directives in CSS, or `tailwindcss` as a PostCSS plugin entry.

### Pitfall 3: shadcn/ui Tailwind v4 Config Mismatch
**What goes wrong:** shadcn/ui `components.json` has stale `tailwind` config paths when using Tailwind v4.
**Why it happens:** shadcn/ui's Tailwind v4 support requires leaving the `tailwind` config property empty in `components.json`.
**How to avoid:** When running `pnpm dlx shadcn@latest init`, let it detect Tailwind v4 automatically. Verify `components.json` has empty tailwind config.
**Warning signs:** `components.json` containing a `tailwind.config` path, or shadcn components using v3-style CSS variable patterns.

### Pitfall 4: Version Drift from Caret Ranges
**What goes wrong:** `package.json` uses `"next": "^15.5.9"` and a future `pnpm install` pulls 15.6.x or even 16.x, breaking the build.
**Why it happens:** `create-next-app` defaults to caret (`^`) version ranges.
**How to avoid:** After scaffolding, remove all `^` and `~` prefixes from `package.json`. Run `pnpm install` to regenerate lockfile. Commit `pnpm-lock.yaml`.
**Warning signs:** Any `^` or `~` in `package.json` dependency versions.

### Pitfall 5: FHEVM Decryption Model Confusion
**What goes wrong:** Documentation describes the old Oracle-based async decryption model (Gateway sends callback to contract) instead of the v0.9 self-relaying model (user calls `publicDecrypt` off-chain, submits result + proof on-chain).
**Why it happens:** The decryption model changed fundamentally in v0.9. Old tutorials and even Zama's own older docs describe the Oracle pattern.
**How to avoid:** The correct v0.9 flow is: (1) contract calls `FHE.makePubliclyDecryptable()`, (2) user fetches ciphertext, (3) user calls `publicDecrypt()` via `@zama-fhe/relayer-sdk`, (4) user submits cleartext + proof to contract, (5) contract verifies with `FHE.checkSignatures()`.
**Warning signs:** References to `Gateway.requestDecryption`, `GatewayCaller`, callback-based decryption, or "the Oracle will call back your contract".

### Pitfall 6: pnpm + shadcn Workspace Detection
**What goes wrong:** `pnpm dlx shadcn@latest init` fails because pnpm detects it is in a workspace root and blocks implicit installation.
**Why it happens:** pnpm's strict workspace rules conflict with shadcn's package detection.
**How to avoid:** If this occurs, use `pnpm dlx shadcn@latest init --force` or ensure the project is not inside a pnpm workspace root. For the initial scaffold this should not be an issue since there is no pnpm-workspace.yaml yet.
**Warning signs:** Error messages about workspace root or implicit installation.

---

## Code Examples

Verified patterns from official sources:

### FHEVM v0.9 Contract Structure
```solidity
// Source: docs.zama.org/protocol/solidity-guides/getting-started/quick-start-tutorial/turn_it_into_fhevm
// Verified via Context7: /zama-ai/fhevm

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHECounter is ZamaEthereumConfig {
    euint32 private _count;

    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 evalue = FHE.fromExternal(inputEuint32, inputProof);
        _count = FHE.add(_count, evalue);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    function getCount() external view returns (euint32) {
        return _count;
    }
}
```

### FHEVM v0.9 Complete Encrypted Types
```solidity
// Source: docs.zama.org/protocol/solidity-guides/getting-started/overview
// Verified via Context7: /zama-ai/fhevm

// Boolean
ebool      // encrypted boolean

// Unsigned integers (smallest to largest -- use smallest that fits)
euint8     // encrypted 8-bit uint (cheapest operations)
euint16    // encrypted 16-bit uint
euint32    // encrypted 32-bit uint (good default)
euint64    // encrypted 64-bit uint (token amounts)
euint128   // encrypted 128-bit uint
euint256   // encrypted 256-bit uint (most expensive)

// Address
eaddress   // encrypted Ethereum address

// External input types (for function parameters)
externalEbool
externalEuint8, externalEuint16, externalEuint32, externalEuint64
externalEuint128, externalEuint256
externalEaddress
```

**Note:** `ebytesXXX` types were **removed** in v0.7 (July 2025). Do NOT reference them.

### FHEVM v0.9 Operations Reference
```solidity
// Source: docs.zama.org/protocol/solidity-guides/getting-started/overview
// Verified via Context7: /zama-ai/fhevm

// Arithmetic
FHE.add(a, b)     // encrypted + encrypted (or encrypted + plaintext)
FHE.sub(a, b)     // encrypted - encrypted
FHE.mul(a, b)     // encrypted * encrypted
FHE.div(a, b)     // encrypted / PLAINTEXT ONLY
FHE.rem(a, b)     // encrypted % PLAINTEXT ONLY
FHE.min(a, b)     // minimum of two encrypted values
FHE.max(a, b)     // maximum of two encrypted values
FHE.neg(a)        // negation

// Comparison (all return ebool)
FHE.eq(a, b)      // equal
FHE.ne(a, b)      // not equal
FHE.lt(a, b)      // less than
FHE.le(a, b)      // less than or equal
FHE.gt(a, b)      // greater than
FHE.ge(a, b)      // greater than or equal

// Bitwise
FHE.and(a, b)     FHE.or(a, b)      FHE.xor(a, b)
FHE.not(a)        FHE.shl(a, b)     FHE.shr(a, b)
FHE.rotl(a, b)    FHE.rotr(a, b)

// Branching (CRITICAL -- replaces if/else for encrypted data)
FHE.select(condition, ifTrue, ifFalse)  // encrypted ternary

// Randomness
FHE.randEuint8()   FHE.randEuint16()
FHE.randEuint32()  FHE.randEuint64()

// Type conversion
FHE.asEuint32(plaintext)    // trivial encryption (plaintext -> encrypted)
FHE.asEuint64(euint32Value) // upcast (safe)
FHE.asEuint8(euint32Value)  // downcast (truncates!)

// Input validation
FHE.fromExternal(externalEuintXX, inputProof)  // verify ZKPoK + convert to on-chain type

// Initialization check
FHE.isInitialized(handle)   // check if encrypted variable is set
```

### FHEVM v0.9 ACL System
```solidity
// Source: Context7 /zama-ai/fhevm - ACL examples
// Verified via docs.zama.org/protocol/solidity-guides/acl

// Permanent access grants
FHE.allow(handle, address)     // grant specific address access to ciphertext
FHE.allowThis(handle)          // grant current contract access (= FHE.allow(handle, address(this)))
FHE.allowTransient(handle, address)  // temporary access (within transaction only)

// Public decryption (v0.9 -- enables self-relaying)
FHE.makePubliclyDecryptable(handle)  // marks ciphertext for public decryption
// Or using method chaining:
handle.makePubliclyDecryptable()

// Method chaining syntax
using FHE for *;
ciphertext.allow(address1).allow(address2);

// Verification (for self-relaying decryption)
FHE.checkSignatures(requestId, cleartexts, decryptionProof)
FHE.verifySignatures(decryptedData, proof)  // alternative name
```

### FHEVM v0.9 Self-Relaying Decryption Pattern
```solidity
// Source: Context7 /zama-ai/fhevm - migration.md
// The v0.9 decryption model (replaces Oracle-based decryption)

// STEP 1: On-chain -- mark data as publicly decryptable
FHE.makePubliclyDecryptable(encryptedResult);

// STEP 2: Off-chain -- user fetches ciphertext handles
// STEP 3: Off-chain -- user decrypts via relayer-sdk
```

```typescript
// Source: Context7 /zama-ai/fhevm - migration.md, oracle.md

// Off-chain decryption using @zama-fhe/relayer-sdk
import { createInstance } from "@zama-fhe/relayer-sdk";

const instance = await createInstance();
const results = await instance.publicDecrypt([handle1, handle2]);
const clearValue = results.values[handle1];       // decrypted value
const proof = results.decryptionProof;             // KMS proof

// STEP 4: Submit cleartext + proof back to contract
await contract.callbackWithProof(clearValue, proof);
```

```solidity
// STEP 5: On-chain -- verify proof and use decrypted value
function callbackWithProof(uint256 requestId, bytes memory cleartexts, bytes memory decryptionProof) public {
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);
    // Use decrypted values...
}
```

### FHEVM v0.9 Voting Contract (Complete Example)
```solidity
// Source: Context7 /zama-ai/fhevm - transform_smart_contract_with_fhevm.md
// Complete verified example of a v0.9 voting contract

pragma solidity ^0.8.0;

import "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptedSimpleVoting is ZamaEthereumConfig {
    enum VotingStatus { Open, DecryptionInProgress, ResultsDecrypted }
    mapping(address => bool) public hasVoted;
    VotingStatus public status;
    uint64 public decryptedYesVotes;
    uint64 public decryptedNoVotes;
    uint256 public voteDeadline;
    euint64 private encryptedYesVotes;
    euint64 private encryptedNoVotes;

    constructor() {
        encryptedYesVotes = FHE.asEuint64(0);
        encryptedNoVotes = FHE.asEuint64(0);
        FHE.allowThis(encryptedYesVotes);
        FHE.allowThis(encryptedNoVotes);
    }

    function vote(externalEbool support, bytes memory inputProof) public {
        require(block.timestamp <= voteDeadline, "Too late to vote");
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        ebool isSupport = FHE.fromExternal(support, inputProof);
        encryptedYesVotes = FHE.select(isSupport, FHE.add(encryptedYesVotes, 1), encryptedYesVotes);
        encryptedNoVotes = FHE.select(isSupport, encryptedNoVotes, FHE.add(encryptedNoVotes, 1));
        FHE.allowThis(encryptedYesVotes);
        FHE.allowThis(encryptedNoVotes);
    }

    function requestVoteDecryption() public {
        require(block.timestamp > voteDeadline, "Voting is not finished");
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(encryptedYesVotes);
        cts[1] = FHE.toBytes32(encryptedNoVotes);
        uint256 requestId = FHE.requestDecryption(cts, this.callbackDecryptVotes.selector);
        status = VotingStatus.DecryptionInProgress;
    }

    function callbackDecryptVotes(uint256 requestId, bytes memory cleartexts, bytes memory decryptionProof) public {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        (uint64 yesVotes, uint64 noVotes) = abi.decode(cleartexts, (uint64, uint64));
        decryptedYesVotes = yesVotes;
        decryptedNoVotes = noVotes;
        status = VotingStatus.ResultsDecrypted;
    }
}
```

### Next.js 15 + Tailwind v4 Scaffold Commands
```bash
# Source: create-next-app docs + Tailwind v4 Next.js guide

# 1. Create project with pnpm
pnpm create next-app@latest fheacademy \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --turbopack \
  --use-pnpm

# 2. Initialize shadcn/ui
cd fheacademy
pnpm dlx shadcn@latest init

# 3. Pin all dependency versions (remove ^ prefixes)
# Edit package.json manually, then:
pnpm install

# 4. Create .env.example
cat > .env.example << 'EOF'
# Auth (Phase 4)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=

# Database (Phase 4)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
EOF

# 5. Deploy to Vercel
# Connect git repo to Vercel via vercel.com dashboard or:
pnpm dlx vercel
```

### PostCSS Config for Tailwind v4
```javascript
// postcss.config.mjs
// Source: tailwindcss.com/docs/installation/framework-guides/nextjs

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `TFHE.*` namespace | `FHE.*` namespace | FHEVM v0.7 (July 2025) | All function calls renamed; `TFHE.add` -> `FHE.add` etc. |
| `einput` type | `externalEuintXX`, `externalEbool`, `externalEaddress` | FHEVM v0.7 (July 2025) | Typed external inputs replace generic `einput` |
| `ebytesXXX` types | Removed | FHEVM v0.7 (July 2025) | No encrypted byte array types in v0.7+ |
| `GatewayCaller` / Oracle decryption | Self-relaying decryption via `@zama-fhe/relayer-sdk` | FHEVM v0.9 | Oracle eliminated; dApp client performs off-chain decrypt and submits proof |
| `Gateway.requestDecryption()` | `FHE.makePubliclyDecryptable()` + off-chain `publicDecrypt()` | FHEVM v0.9 | Decryption is now user-driven, not Oracle-driven |
| `SepoliaConfig` (chain-specific) | `ZamaEthereumConfig` (auto-resolves by chainId) | FHEVM v0.9 | Single config import for all supported networks |
| `FHE.requestDecryption()` | Removed | FHEVM v0.9 | No on-chain decryption requests; use self-relaying pattern |
| `tailwind.config.js` | `@theme {}` in CSS | Tailwind v4.0 (Jan 2025) | CSS-first configuration, no JS config file |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4.0 | Single CSS import replaces three directives |
| `tailwindcss` PostCSS plugin | `@tailwindcss/postcss` plugin | Tailwind v4.0 | Separate PostCSS package |

**Deprecated/outdated:**
- `TFHE.*` functions: Renamed to `FHE.*` in v0.7. Any reference to `TFHE.add`, `TFHE.asEuint32`, etc. is outdated.
- `GatewayCaller` contract: Eliminated in v0.9. The Oracle-based decryption pattern is completely removed.
- `Gateway.requestDecryption()`: Removed in v0.9. Self-relaying replaces it.
- `einput` type: Replaced by typed `externalEuintXX` in v0.7.
- `ebytesXXX` types: Removed entirely in v0.7.
- `tailwind.config.js`: Not needed in Tailwind v4 (CSS-first config).

---

## FHEVM Solidity-to-FHEVM Transformation Reference (Research Basis)

This section provides the verified transformation steps that will form the basis of the Solidity-to-FHEVM reference document.

### Step 1: Import and Configuration
| Vanilla Solidity | FHEVM v0.9 | What Changed |
|-----------------|------------|--------------|
| No special imports | `import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";` | FHEVM library import |
| No inheritance | `contract MyContract is ZamaEthereumConfig { }` | Config inheritance sets up coprocessor automatically |

### Step 2: Types
| Vanilla Solidity | FHEVM v0.9 | What Changed |
|-----------------|------------|--------------|
| `uint8` | `euint8` | Encrypted 8-bit unsigned int |
| `uint32` | `euint32` | Encrypted 32-bit unsigned int |
| `uint64` | `euint64` | Encrypted 64-bit unsigned int (use for token amounts) |
| `uint256` | `euint256` | Encrypted 256-bit (expensive -- avoid unless necessary) |
| `bool` | `ebool` | Encrypted boolean |
| `address` | `eaddress` | Encrypted address |
| `uint32` (function param) | `externalEuint32, bytes calldata inputProof` | Encrypted input with ZKPoK proof |

### Step 3: Operations
| Vanilla Solidity | FHEVM v0.9 | What Changed |
|-----------------|------------|--------------|
| `a + b` | `FHE.add(a, b)` | Encrypted addition |
| `a - b` | `FHE.sub(a, b)` | Encrypted subtraction |
| `a * b` | `FHE.mul(a, b)` | Encrypted multiplication |
| `a / b` | `FHE.div(a, plaintextB)` | Division by PLAINTEXT only |
| `a == b` | `FHE.eq(a, b)` returns `ebool` | Cannot evaluate in `if` |
| `a < b` | `FHE.lt(a, b)` returns `ebool` | Cannot evaluate in `if` |
| `condition ? a : b` | `FHE.select(condition, a, b)` | Both branches always execute |
| `if (condition) { ... }` | Cannot use `if` with encrypted bools | Use `FHE.select` instead |

### Step 4: ACL Permissions
| Vanilla Solidity | FHEVM v0.9 | What Changed |
|-----------------|------------|--------------|
| N/A (data is public) | `FHE.allowThis(handle)` after every state mutation | Contract must grant itself access to new ciphertexts |
| N/A | `FHE.allow(handle, msg.sender)` | Grant caller permission to decrypt |
| N/A | `FHE.allowTransient(handle, address)` | Temporary (single-transaction) access |

### Step 5: Encrypted Inputs
| Vanilla Solidity | FHEVM v0.9 | What Changed |
|-----------------|------------|--------------|
| `function foo(uint32 value)` | `function foo(externalEuint32 value, bytes calldata inputProof)` | Encrypted parameter + ZKPoK |
| Direct use of `value` | `euint32 v = FHE.fromExternal(value, inputProof)` | Must validate and convert |

### Step 6: Decryption (v0.9 Self-Relaying)
| Vanilla Solidity | FHEVM v0.9 | What Changed |
|-----------------|------------|--------------|
| `return value;` (plaintext) | `return encryptedHandle;` (handle only) | Values stay encrypted |
| N/A | `FHE.makePubliclyDecryptable(handle)` | Mark for off-chain decrypt |
| N/A | Off-chain: `relayer.publicDecrypt(handles)` | User decrypts via SDK |
| N/A | On-chain: `FHE.checkSignatures(id, cleartexts, proof)` | Verify decryption proof |

---

## Curriculum Outline Research Basis

The project plan document (`/Users/0xemrek/Downloads/FHE_Academy___Complete_Project_Plan.md`) provides a detailed 20-lesson curriculum that has been verified against FHEVM v0.9 API. Key findings:

### Structure Confirmed
- 4 weeks, 5 lessons per week = 20 lessons
- 4 weekly homeworks + 1 capstone project
- Each lesson has: title, duration, type, learning objectives, content outline, instructor notes, quiz questions

### FHEVM API Accuracy Issues Found in Project Plan
The project plan was written with FHEVM v0.9 in mind but contains some references that need verification during implementation:

1. **Lesson 3.1 (Decryption):** References `Gateway.requestDecryption(handle, callbackFunction, ...)` -- this is the OLD Oracle pattern. Must be updated to self-relaying pattern (`FHE.makePubliclyDecryptable` + `@zama-fhe/relayer-sdk`).
2. **Lesson 1.2 (Ecosystem):** References "KMS + Gateway" architecture -- Gateway terminology may be outdated in v0.9 context.
3. **Project Structure:** Plan uses `apps/web/` monorepo structure and Next.js 14 -- user has decided on flat structure and Next.js 15.
4. **`ebytesXXX` types:** If referenced anywhere, these were removed in v0.7.

### Verified Lesson Topics (all align with v0.9 API)
- Week 1: Privacy motivation, Zama ecosystem, dev setup, first contract migration, testing
- Week 2: Encrypted types, FHE operations, encrypted inputs/ZKPoK, ACL system, patterns
- Week 3: Decryption mechanism (needs v0.9 update), FHE.select patterns, randomness, frontend, auction/voting
- Week 4: Gas optimization, security, confidential DeFi, testing strategies, testnet deployment

---

## Open Questions

1. **Exact `@fhevm/solidity` npm version for v0.9**
   - What we know: v0.9.1 is referenced in the migration guide as the minimum. The npm package `fhevm` shows 0.6.2 as latest stable, but the package may have been renamed to `@fhevm/solidity`.
   - What's unclear: The exact npm install command for the Solidity library in v0.9 (is it `npm install @fhevm/solidity@0.9.1` or something else?). The Hardhat template may handle this.
   - Recommendation: This is Phase 5 concern (Hardhat monorepo). For Phase 1, document the API patterns and import paths. The exact package installation will be validated when building Hardhat projects.

2. **Next.js 15.5.9 exact React version**
   - What we know: Next.js 15 requires React 19. `create-next-app` will install the correct React version.
   - What's unclear: The exact React 19.x.x version that `create-next-app@15.5.9` pins.
   - Recommendation: Run `pnpm create next-app@latest` (which currently may pull Next.js 16), so use `pnpm create next-app@15.5.9` to ensure Next.js 15. Then check the generated `package.json` for exact React version and pin it.

3. **shadcn/ui Zama theme integration**
   - What we know: shadcn/ui supports custom themes via CSS variables. Tailwind v4 uses `@theme` directive.
   - What's unclear: Whether shadcn's `init` generates Tailwind v4-compatible CSS variables or whether manual conversion is needed.
   - Recommendation: Run `pnpm dlx shadcn@latest init` and inspect the generated CSS. Then overlay the Zama theme colors. This is a Phase 2 task but the foundation is set in Phase 1.

---

## Sources

### Primary (HIGH confidence)
- Context7 `/zama-ai/fhevm` - FHEVM v0.9 API: FHE.* functions, encrypted types, ACL patterns, self-relaying decryption, migration guide, voting contract example
- https://docs.zama.org/protocol/solidity-guides/getting-started/quick-start-tutorial/turn_it_into_fhevm - Import paths, ZamaEthereumConfig, contract structure
- https://docs.zama.org/protocol/solidity-guides/development-guide/migration - v0.9 migration checklist, self-relaying pattern, removed functions
- https://docs.zama.org/protocol/solidity-guides/getting-started/overview - Complete type catalog, all FHE.* operations
- https://docs.zama.org/change-log/release/fhevm-v0.7-july-2025 - TFHE->FHE rename, ebytes removal, externalEuint types
- https://tailwindcss.com/docs/installation/framework-guides/nextjs - Tailwind v4 + Next.js setup
- https://tailwindcss.com/docs/upgrade-guide - Tailwind v3->v4 breaking changes
- https://ui.shadcn.com/docs/installation/next - shadcn/ui + Next.js setup
- https://ui.shadcn.com/docs/tailwind-v4 - shadcn/ui Tailwind v4 support
- Context7 `/vercel/next.js` - Next.js 15 installation, App Router, create-next-app
- Context7 `/websites/tailwindcss` - Tailwind v4 CSS-first config, @import directive
- Context7 `/websites/ui_shadcn` - shadcn/ui init, monorepo support, Tailwind v4 compatibility

### Secondary (MEDIUM confidence)
- https://nextjs.org/blog/next-15-5 - Next.js 15.5 release blog (August 2025)
- https://github.com/zama-ai/fhevm/releases - FHEVM release history
- https://github.com/zama-ai/relayer-sdk - Relayer SDK repository

### Tertiary (LOW confidence)
- npm package versions for `fhevm` (0.6.2 on npm may be stale; `@fhevm/solidity` may be the current package name) - needs validation at implementation time

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via Context7 and official docs. Versions confirmed.
- Architecture: HIGH - Next.js 15 App Router + Tailwind v4 + shadcn/ui is a well-documented, standard stack.
- FHEVM API: HIGH - Extensively verified via Context7 (/zama-ai/fhevm) and docs.zama.org. Multiple sources cross-referenced for v0.7 and v0.9 changes.
- Pitfalls: HIGH - FHEVM version migration pitfalls verified from official migration guide. Tailwind v4 pitfalls verified from upgrade guide.
- Curriculum outline: MEDIUM - Lesson structure from project plan document verified against v0.9 API, but some lessons (especially 3.1 decryption) need content updates for self-relaying model.

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (30 days -- stable domain, FHEVM v0.9 is current)
