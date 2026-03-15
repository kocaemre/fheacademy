import Link from "next/link"
import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { CalloutBox } from "@/components/content/callout-box"
import { AIGrader, type RubricCriterion } from "@/components/content/ai-grader"

const rubricCriteria: RubricCriterion[] = [
  {
    criterion: "ERC-20 Interface",
    weight: "15%",
    exceeds: "All standard functions adapted for FHE (mint, transfer, approve, transferFrom, balanceOf)",
    meets: "Core functions present (mint, transfer, balanceOf)",
    below: "Missing key functions",
  },
  {
    criterion: "Encrypted Balance",
    weight: "25%",
    exceeds: "Proper euint64 usage, correct FHE.add/sub, initialization handling",
    meets: "Mostly correct encrypted types and operations",
    below: "Wrong types or broken arithmetic logic",
  },
  {
    criterion: "ACL Permissions",
    weight: "25%",
    exceeds: "Perfect permission flow -- allowThis + allow for every state change, only owner can decrypt",
    meets: "Most permissions correct, minor omissions",
    below: "Missing or incorrect ACL calls",
  },
  {
    criterion: "Overflow Protection",
    weight: "15%",
    exceeds: "FHE.select guard on all arithmetic (transfer + transferFrom)",
    meets: "FHE.select on transfer, missing on transferFrom",
    below: "No overflow handling",
  },
  {
    criterion: "Test Coverage",
    weight: "20%",
    exceeds: "Mint, transfer, approve, transferFrom, edge cases, and ACL tests",
    meets: "Basic mint + transfer tests pass",
    below: "Tests missing or failing",
  },
]

export function Homework2Content() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
            Intermediate
          </span>
          <span className="text-sm text-muted-foreground">
            Week 2 Homework
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Homework: Confidential ERC-20 Token
        </h1>
        <p className="text-lg leading-relaxed text-text-secondary">
          Build your first real-world confidential smart contract -- a full
          ERC-20 token where balances are encrypted, transfers are
          overflow-protected, and only token owners can view their own balance.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>
        <p className="leading-relaxed text-text-secondary">
          In this homework, you will build a confidential ERC-20 token that
          combines all Week 2 concepts: encrypted types (Lesson 2.1), FHE
          operations and FHE.select (Lesson 2.2), encrypted inputs with ZKPoK
          (Lesson 2.3), the ACL system (Lesson 2.4), and defensive programming
          patterns (Lesson 2.5). This is the first contract you will build that
          has real-world applicability -- confidential token transfers are one
          of the most requested features in DeFi.
        </p>
        <p className="mt-3 leading-relaxed text-text-secondary">
          Your token should support the standard ERC-20 operations (mint,
          transfer, approve, transferFrom, balanceOf) but with encrypted
          balances and allowances. The critical challenge is implementing the
          transfer function with proper overflow protection using{" "}
          <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
            FHE.select
          </code>{" "}
          and ensuring every balance update has correct ACL permissions.
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
                Using{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  euint64
                </code>{" "}
                for token balances and allowances with proper type selection
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Implementing the complete ACL permission flow for multi-party
                token transfers (sender, recipient, spender)
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Overflow protection using{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.select
                </code>{" "}
                with{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.ge
                </code>{" "}
                for safe transfers
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Accepting encrypted inputs via{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  externalEuint64
                </code>{" "}
                +{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  inputProof
                </code>{" "}
                with ZKPoK validation
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Writing comprehensive tests for encrypted token operations
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Requirements */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Requirements
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </span>
              <span className="leading-relaxed">
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  mapping(address =&gt; euint64)
                </code>{" "}
                for encrypted balances
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </span>
              <span className="leading-relaxed">
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  mint()
                </code>
                : accept an encrypted amount via{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  externalEuint64
                </code>
                , add to the sender&apos;s balance with proper ACL
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </span>
              <span className="leading-relaxed">
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  transfer()
                </code>
                : encrypted amount transfer with overflow protection using{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.select
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                4
              </span>
              <span className="leading-relaxed">
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  balanceOf()
                </code>
                : returns the encrypted handle -- only the token owner can
                decrypt their own balance
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                5
              </span>
              <span className="leading-relaxed">
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  approve()
                </code>{" "}
                +{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  transferFrom()
                </code>
                : encrypted allowance system with proper ACL for owner, spender,
                and recipient
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                6
              </span>
              <span className="leading-relaxed">
                Proper ACL: only the token owner can decrypt their balance; the
                contract must have{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.allowThis
                </code>{" "}
                on every stored encrypted value
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                7
              </span>
              <span className="leading-relaxed">
                Comprehensive test suite covering mint, transfer, approve,
                transferFrom, and edge cases
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
          Here is the direction your migration should take. This shows the type
          and signature transformations -- not the complete implementation:
        </p>

        <CodeDiff
          solidity={`// Standard ERC-20 Storage
mapping(address => uint256)
    private _balances;
mapping(address =>
    mapping(address => uint256))
    private _allowances;

// Standard transfer signature
function transfer(
    address to,
    uint256 amount
) external returns (bool) {
    require(
        _balances[msg.sender] >= amount
    );
    _balances[msg.sender] -= amount;
    _balances[to] += amount;
    return true;
}`}
          fhevm={`// Confidential ERC-20 Storage
mapping(address => euint64)
    private _balances;
mapping(address =>
    mapping(address => euint64))
    private _allowances;

// Confidential transfer signature
function transfer(
    address to,
    externalEuint64 calldata encAmount,
    bytes calldata inputProof
) external {
    euint64 amount = FHE.fromExternal(
        encAmount, inputProof
    );
    // Your implementation here...
    // Hint: FHE.ge + FHE.select + ACL
}`}
          solidityFilename="ERC20.sol"
          fhevmFilename="ConfidentialERC20.sol"
        />

        <CalloutBox type="warning" title="Direction Only -- Not the Complete Solution">
          The code above shows the type and signature transformation, not the
          full implementation. You must implement the complete transfer logic
          with overflow protection using{" "}
          <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
            FHE.select
          </code>
          , set all ACL permissions for both sender and recipient, and handle
          the approve/transferFrom flow yourself. Review Lesson 2.4 (ACL) and
          Lesson 2.5 (Safe Transfer Pattern) before starting.
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
                href="/week/2/lesson/access-control-list-system"
                className="text-sm text-primary hover:underline"
              >
                Lesson 2.4: ACL System
              </Link>
              <span className="text-sm text-text-muted">
                {" "}-- the complete transfer ACL flow
              </span>
            </li>
            <li>
              <Link
                href="/week/2/lesson/patterns-and-best-practices"
                className="text-sm text-primary hover:underline"
              >
                Lesson 2.5: Patterns and Best Practices
              </Link>
              <span className="text-sm text-text-muted">
                {" "}-- the safe transfer pattern you will implement
              </span>
            </li>
            <li>
              <Link
                href="/week/2/lesson/encrypted-inputs-and-zkpok"
                className="text-sm text-primary hover:underline"
              >
                Lesson 2.3: Encrypted Inputs and ZKPoK
              </Link>
              <span className="text-sm text-text-muted">
                {" "}-- how to accept encrypted amounts
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Contract Skeleton */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Contract Skeleton
        </h2>
        <p className="mb-4 leading-relaxed text-text-secondary">
          Start with this skeleton. Fill in the function bodies using the
          patterns from Lessons 2.1-2.5:
        </p>

        <CodeBlock
          code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialERC20 is ZamaEthereumConfig {
    string public name;
    string public symbol;
    uint8 public decimals = 6;

    mapping(address => euint64) private _balances;
    mapping(address => mapping(address => euint64)) private _allowances;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function mint(
        externalEuint64 calldata encAmount,
        bytes calldata inputProof
    ) external {
        // TODO: Validate input, add to balance, set ACL
    }

    function transfer(
        address to,
        externalEuint64 calldata encAmount,
        bytes calldata inputProof
    ) external {
        // TODO: Validate input, check balance, safe transfer, ACL
    }

    function balanceOf(address account) external view returns (euint64) {
        // TODO: Return encrypted balance handle
    }

    function approve(
        address spender,
        externalEuint64 calldata encAmount,
        bytes calldata inputProof
    ) external {
        // TODO: Set encrypted allowance, ACL
    }

    function transferFrom(
        address from,
        address to,
        externalEuint64 calldata encAmount,
        bytes calldata inputProof
    ) external {
        // TODO: Check allowance + balance, safe transfer, update allowance, ACL
    }
}`}
          lang="solidity"
          filename="ConfidentialERC20.sol"
        />
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
                  ERC-20 Interface
                </td>
                <td className="border border-border px-4 py-2.5">15%</td>
                <td className="border border-border px-4 py-2.5">
                  All standard functions adapted for FHE (mint, transfer,
                  approve, transferFrom, balanceOf)
                </td>
                <td className="border border-border px-4 py-2.5">
                  Core functions present (mint, transfer, balanceOf)
                </td>
                <td className="border border-border px-4 py-2.5">
                  Missing key functions
                </td>
              </tr>
              <tr className="bg-surface/50">
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Encrypted Balance
                </td>
                <td className="border border-border px-4 py-2.5">25%</td>
                <td className="border border-border px-4 py-2.5">
                  Proper euint64 usage, correct FHE.add/sub, initialization
                  handling
                </td>
                <td className="border border-border px-4 py-2.5">
                  Mostly correct encrypted types and operations
                </td>
                <td className="border border-border px-4 py-2.5">
                  Wrong types or broken arithmetic logic
                </td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  ACL Permissions
                </td>
                <td className="border border-border px-4 py-2.5">25%</td>
                <td className="border border-border px-4 py-2.5">
                  Perfect permission flow -- allowThis + allow for every state
                  change, only owner can decrypt
                </td>
                <td className="border border-border px-4 py-2.5">
                  Most permissions correct, minor omissions
                </td>
                <td className="border border-border px-4 py-2.5">
                  Missing or incorrect ACL calls
                </td>
              </tr>
              <tr className="bg-surface/50">
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Overflow Protection
                </td>
                <td className="border border-border px-4 py-2.5">15%</td>
                <td className="border border-border px-4 py-2.5">
                  FHE.select guard on all arithmetic (transfer + transferFrom)
                </td>
                <td className="border border-border px-4 py-2.5">
                  FHE.select on transfer, missing on transferFrom
                </td>
                <td className="border border-border px-4 py-2.5">
                  No overflow handling
                </td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Test Coverage
                </td>
                <td className="border border-border px-4 py-2.5">20%</td>
                <td className="border border-border px-4 py-2.5">
                  Mint, transfer, approve, transferFrom, edge cases, and ACL
                  tests
                </td>
                <td className="border border-border px-4 py-2.5">
                  Basic mint + transfer tests pass
                </td>
                <td className="border border-border px-4 py-2.5">
                  Tests missing or failing
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Grader */}
      <AIGrader
        homeworkTitle="Confidential ERC-20 Token"
        homeworkId="homework-2-confidential-erc20-token"
        rubricCriteria={rubricCriteria}
      />

      <section className="mt-8 mb-8">
        <div className="rounded-lg border border-border bg-card/50 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Stuck? Check the reference solution</p>
            <p className="text-xs text-muted-foreground mt-1">Try solving it yourself first -- you will learn more that way.</p>
          </div>
          <a href="https://github.com/kocaemre/fheacademy/tree/main/hardhat/week-2/solution" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">View Solution</a>
        </div>
      </section>

    </>
  )
}
