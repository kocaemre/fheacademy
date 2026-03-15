import Link from "next/link"
import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { CalloutBox } from "@/components/content/callout-box"
import { AIGrader, type RubricCriterion } from "@/components/content/ai-grader"

const rubricCriteria: RubricCriterion[] = [
  {
    criterion: "Contract Logic",
    weight: "25%",
    exceeds: "Correct placeBid, endAuction, revealWinner with proper state management and access control",
    meets: "Core bid and end functions work, minor state management issues",
    below: "Missing key functions or broken auction flow",
  },
  {
    criterion: "Bid Privacy",
    weight: "20%",
    exceeds: "All bids encrypted, losing bids never decrypted, proper ACL so bidders can only see their own bid",
    meets: "Bids encrypted, but ACL or decryption scope has minor issues",
    below: "Bids exposed or all bids decrypted at end",
  },
  {
    criterion: "Decryption Flow",
    weight: "20%",
    exceeds: "Correct v0.9 self-relaying pattern with FHE.makePubliclyDecryptable, callback, and FHE.checkSignatures",
    meets: "Decryption works but missing proof verification",
    below: "No decryption flow or using deprecated Gateway pattern",
  },
  {
    criterion: "Frontend",
    weight: "20%",
    exceeds: "Complete flow: connect wallet, encrypt bid, submit tx, display status, reveal winner with proper error handling",
    meets: "Basic bid submission and winner display working",
    below: "Frontend missing or non-functional",
  },
  {
    criterion: "Documentation",
    weight: "15%",
    exceeds: "Clear README with architecture diagram, setup instructions, and explanation of FHEVM patterns used",
    meets: "README with basic setup instructions and feature list",
    below: "No README or insufficient documentation",
  },
]

export function Homework3Content() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-medium text-error">
            Advanced
          </span>
          <span className="text-sm text-muted-foreground">
            Week 3 Homework
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Homework: Sealed-Bid Auction dApp
        </h1>
        <p className="text-lg leading-relaxed text-text-secondary">
          Build a complete sealed-bid auction with an FHEVM smart contract AND a
          React frontend. Bids remain encrypted until the auction ends -- only
          the winning bid and winner are ever revealed. This is the most
          ambitious homework yet, combining contract development with full-stack
          dApp integration.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>
        <p className="leading-relaxed text-text-secondary">
          In this homework, you will build a sealed-bid auction dApp that
          demonstrates the core Week 3 concepts: the v0.9 self-relaying
          decryption mechanism (Lesson 3.1), encrypted conditional logic with
          FHE.select (Lesson 3.2), frontend integration with the relayer SDK
          (Lesson 3.4), and the auction design pattern (Lesson 3.5). The auction
          contract accepts encrypted bids, compares them using FHE operations to
          determine the winner, and reveals only the winning bid through the
          decryption flow.
        </p>
        <p className="mt-3 leading-relaxed text-text-secondary">
          This is a full-stack assignment: you will build both the smart contract
          and a React frontend. The contract handles bid submission, encrypted
          comparison, and decryption. The frontend handles wallet connection,
          bid encryption via the SDK, transaction submission, and winner display.
        </p>
      </section>

      {/* Learning Objectives */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Learning Objectives
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="mb-3 text-sm font-medium text-text-muted">
            By completing this homework, you will demonstrate mastery of:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Encrypted comparisons using{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.gt
                </code>{" "}
                and{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.select
                </code>{" "}
                to determine a winner without seeing bid amounts
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                The v0.9 self-relaying decryption flow using{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.makePubliclyDecryptable
                </code>{" "}
                and the relayer SDK callback pattern
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                ACL management for multi-party access: bidders can verify their
                own bids, only the contract can compare bids
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Full-stack dApp development: React frontend with encrypted input
                creation, transaction submission, and decrypted result display
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Smart Contract Requirements */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Smart Contract Requirements
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </span>
              <span className="leading-relaxed">
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  placeBid()
                </code>
                : accept an encrypted bid amount via{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  externalEuint64
                </code>{" "}
                +{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  inputProof
                </code>
                , compare with current highest bid using{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.gt
                </code>{" "}
                +{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.select
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </span>
              <span className="leading-relaxed">
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  endAuction()
                </code>
                : owner-only function that closes bidding and marks the winning
                bid + address for decryption via{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.makePubliclyDecryptable
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </span>
              <span className="leading-relaxed">
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  revealWinner()
                </code>{" "}
                / callback: receive the decrypted winning bid + address via the
                v0.9 self-relaying decryption pattern with{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.checkSignatures
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                4
              </span>
              <span className="leading-relaxed">
                Losing bids remain encrypted forever -- only the winning bid is
                decrypted
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                5
              </span>
              <span className="leading-relaxed">
                Proper ACL: bidders can verify their own bids (
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.allow
                </code>
                ), only the contract can compare all bids (
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.allowThis
                </code>
                )
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Frontend Requirements */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Frontend Requirements
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </span>
              <span className="leading-relaxed">
                Connect wallet (MetaMask or compatible) and display connection
                status
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </span>
              <span className="leading-relaxed">
                Input bid amount, encrypt via the relayer SDK (
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  instance.encryptUint64
                </code>
                ), and submit the encrypted bid transaction
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </span>
              <span className="leading-relaxed">
                Display auction status: open (accepting bids) or closed (auction
                ended)
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                4
              </span>
              <span className="leading-relaxed">
                Reveal winner when auction ends: decrypt and display the winning
                bid amount and winner address
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Testing Requirements */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Testing Requirements
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="mb-3 leading-relaxed text-text-secondary">
            Write at least 3 test scenarios covering the full auction lifecycle:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </span>
              <span className="leading-relaxed">
                Multiple bidders submit encrypted bids, auction ends, correct
                winner is determined
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </span>
              <span className="leading-relaxed">
                Bidding after auction ends is rejected, non-owner cannot end
                auction
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </span>
              <span className="leading-relaxed">
                ACL verification: bidders can verify their own bids but cannot
                see other bidders&apos; amounts
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Transformation Direction */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Transformation Direction
        </h2>
        <p className="mb-4 leading-relaxed text-text-secondary">
          Here is the direction your migration should take. This shows the bid
          function signature and storage pattern -- not the full comparison
          logic:
        </p>

        <CodeDiff
          solidity={`// Standard Open Auction
contract OpenAuction {
    mapping(address => uint64)
        public bids;
    address public highestBidder;
    uint64 public highestBid;

    function bid() external payable {
        require(
            msg.value > highestBid,
            "Bid too low"
        );
        bids[msg.sender] =
            uint64(msg.value);
        highestBidder = msg.sender;
        highestBid =
            uint64(msg.value);
    }
}`}
          fhevm={`// Sealed-Bid Auction
contract SealedAuction
    is ZamaEthereumConfig
{
    mapping(address => euint64)
        private _bids;
    euint64 private _highestBid;
    eaddress private _highestBidder;

    function placeBid(
        externalEuint64 calldata encBid,
        bytes calldata inputProof
    ) external {
        euint64 bid = FHE.fromExternal(
            encBid, inputProof
        );
        _bids[msg.sender] = bid;
        // Your comparison logic here...
        // Hint: FHE.gt + FHE.select
    }
}`}
          solidityFilename="OpenAuction.sol"
          fhevmFilename="SealedAuction.sol"
        />

        <CalloutBox type="warning" title="Direction Only -- Not the Complete Solution">
          The code above shows the bid submission pattern and type
          transformations, not the full implementation. You must implement the
          encrypted bid comparison (FHE.gt + FHE.select), the endAuction
          function with FHE.makePubliclyDecryptable, the callback for receiving
          decrypted results, and all ACL permissions. Review Lesson 3.5 (Auction
          Pattern) before starting.
        </CalloutBox>
      </section>

      {/* Getting Started */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Getting Started
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="leading-relaxed text-text-secondary">
            Before starting, make sure your development environment is set up
            from{" "}
            <Link
              href="/week/1/lesson/development-environment-setup"
              className="text-primary hover:underline"
            >
              Lesson 1.3: Development Environment Setup
            </Link>
            . Then review these critical lessons:
          </p>
          <ul className="mt-3 space-y-1.5">
            <li>
              <Link
                href="/week/3/lesson/the-decryption-mechanism"
                className="text-sm text-primary hover:underline"
              >
                Lesson 3.1: The Decryption Mechanism
              </Link>
              <span className="text-sm text-text-muted">
                {" "}-- v0.9 self-relaying decryption flow you will implement
              </span>
            </li>
            <li>
              <Link
                href="/week/3/lesson/frontend-integration"
                className="text-sm text-primary hover:underline"
              >
                Lesson 3.4: Frontend Integration
              </Link>
              <span className="text-sm text-text-muted">
                {" "}-- React + relayer SDK patterns for your frontend
              </span>
            </li>
            <li>
              <Link
                href="/week/3/lesson/auction-and-voting-patterns"
                className="text-sm text-primary hover:underline"
              >
                Lesson 3.5: Design Patterns: Auction and Voting
              </Link>
              <span className="text-sm text-text-muted">
                {" "}-- the sealed-bid auction pattern reference
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Grading Rubric */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Grading Rubric
        </h2>
        <p className="mb-4 text-sm text-text-muted">
          Passing score: 70% overall
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface">
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Criteria
                </th>
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Weight
                </th>
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Exceeds (90-100)
                </th>
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Meets (70-89)
                </th>
                <th className="border border-border px-4 py-2.5 text-left font-medium text-text-primary">
                  Below (0-69)
                </th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr>
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Contract Logic
                </td>
                <td className="border border-border px-4 py-2.5">25%</td>
                <td className="border border-border px-4 py-2.5">
                  Correct placeBid, endAuction, revealWinner with proper state
                  management and access control
                </td>
                <td className="border border-border px-4 py-2.5">
                  Core bid and end functions work, minor state management issues
                </td>
                <td className="border border-border px-4 py-2.5">
                  Missing key functions or broken auction flow
                </td>
              </tr>
              <tr className="bg-surface/50">
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Bid Privacy
                </td>
                <td className="border border-border px-4 py-2.5">20%</td>
                <td className="border border-border px-4 py-2.5">
                  All bids encrypted, losing bids never decrypted, proper ACL
                  so bidders can only see their own bid
                </td>
                <td className="border border-border px-4 py-2.5">
                  Bids encrypted, but ACL or decryption scope has minor issues
                </td>
                <td className="border border-border px-4 py-2.5">
                  Bids exposed or all bids decrypted at end
                </td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Decryption Flow
                </td>
                <td className="border border-border px-4 py-2.5">20%</td>
                <td className="border border-border px-4 py-2.5">
                  Correct v0.9 self-relaying pattern with
                  FHE.makePubliclyDecryptable, callback, and FHE.checkSignatures
                </td>
                <td className="border border-border px-4 py-2.5">
                  Decryption works but missing proof verification
                </td>
                <td className="border border-border px-4 py-2.5">
                  No decryption flow or using deprecated Gateway pattern
                </td>
              </tr>
              <tr className="bg-surface/50">
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Frontend
                </td>
                <td className="border border-border px-4 py-2.5">20%</td>
                <td className="border border-border px-4 py-2.5">
                  Complete flow: connect wallet, encrypt bid, submit tx, display
                  status, reveal winner with proper error handling
                </td>
                <td className="border border-border px-4 py-2.5">
                  Basic bid submission and winner display working
                </td>
                <td className="border border-border px-4 py-2.5">
                  Frontend missing or non-functional
                </td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Documentation
                </td>
                <td className="border border-border px-4 py-2.5">15%</td>
                <td className="border border-border px-4 py-2.5">
                  Clear README with architecture diagram, setup instructions,
                  and explanation of FHEVM patterns used
                </td>
                <td className="border border-border px-4 py-2.5">
                  README with basic setup instructions and feature list
                </td>
                <td className="border border-border px-4 py-2.5">
                  No README or insufficient documentation
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Grader */}
      <AIGrader
        homeworkTitle="Sealed-Bid Auction dApp"
        homeworkId="homework-3-sealed-bid-auction-dapp"
        rubricCriteria={rubricCriteria}
      />

      <section className="mt-8 mb-8">
        <div className="rounded-lg border border-border bg-card/50 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Stuck? Check the reference solution</p>
            <p className="text-xs text-muted-foreground mt-1">Try solving it yourself first -- you will learn more that way.</p>
          </div>
          <a href="https://github.com/kocaemre/fheacademy/tree/main/hardhat/week-3/solution" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">View Solution</a>
        </div>
      </section>

    </>
  )
}
