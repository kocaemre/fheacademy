import Link from "next/link"
import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { CalloutBox } from "@/components/content/callout-box"

export function Homework1Content() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
            Beginner
          </span>
          <span className="text-sm text-muted-foreground">
            Week 1 Homework
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Homework: Temperature Converter Migration
        </h1>
        <p className="text-lg leading-relaxed text-text-secondary">
          Apply everything you learned in Week 1 by migrating a classical
          Solidity contract to its FHEVM equivalent.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>
        <p className="leading-relaxed text-text-secondary">
          In this homework, you will migrate a plaintext{" "}
          <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
            TemperatureConverter
          </code>{" "}
          contract to use FHEVM encrypted types and operations. The original
          contract converts Celsius to Fahrenheit using the formula{" "}
          <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
            F = (C * 9 / 5) + 32
          </code>{" "}
          and stores the last conversion result. Your task is to make both the
          input and the stored values confidential using FHEVM.
        </p>
        <p className="mt-3 leading-relaxed text-text-secondary">
          This assignment tests your ability to apply the Migration Mindset
          pattern from Lesson 1.4: identify plaintext types, replace them with
          encrypted equivalents, convert operations to FHE library calls, and
          set proper ACL permissions. You will also need to handle the{" "}
          <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
            FHE.div
          </code>{" "}
          constraint -- division only supports a plaintext divisor, which works
          perfectly here since the divisor (5) is a constant.
        </p>
        <p className="mt-3 leading-relaxed text-text-secondary">
          The conversion formula involves multiplication, division, and
          addition on encrypted values. This is a great exercise because it
          combines multiple FHE operations in a single function while being
          simple enough to verify manually.
        </p>
      </section>

      {/* Learning Objectives */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Learning Objectives
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="mb-3 text-sm font-medium text-text-muted">
            By completing this homework, you will demonstrate:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Migrating Solidity types (
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  uint32
                </code>
                ) to FHEVM encrypted types (
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  euint32
                </code>
                )
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Accepting encrypted inputs via{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  externalEuint32
                </code>{" "}
                +{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  inputProof
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Using FHE arithmetic operations (
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.mul
                </code>
                ,{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.div
                </code>
                ,{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.add
                </code>
                ) for temperature conversion
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Setting proper ACL permissions with{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.allowThis
                </code>{" "}
                and{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.allow
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">
                Writing tests using{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  createEncryptedInput
                </code>{" "}
                and{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  userDecryptEuint
                </code>
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Starter Contract */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Starter Contract
        </h2>
        <p className="mb-4 leading-relaxed text-text-secondary">
          Here is the plaintext Solidity contract you will migrate. Study it
          carefully before starting -- identify every type, operation, and
          return value that needs to change.
        </p>

        <CodeBlock
          code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TemperatureConverter {
    uint32 private _lastCelsius;
    uint32 private _lastFahrenheit;

    function convertCtoF(uint32 celsius) external returns (uint32) {
        uint32 fahrenheit = (celsius * 9 / 5) + 32;
        _lastCelsius = celsius;
        _lastFahrenheit = fahrenheit;
        return fahrenheit;
    }

    function getLastConversion() external view returns (uint32, uint32) {
        return (_lastCelsius, _lastFahrenheit);
    }
}`}
          lang="solidity"
          filename="TemperatureConverter.sol"
        />
      </section>

      {/* Transformation Direction */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Transformation Direction
        </h2>
        <p className="mb-4 leading-relaxed text-text-secondary">
          Here is the direction your migration should take. This shows the
          function signature transformation -- not the complete solution:
        </p>

        <CodeDiff
          solidity={`// Plaintext Solidity Signature
function convertCtoF(
    uint32 celsius
) external returns (uint32) {
    uint32 fahrenheit =
        (celsius * 9 / 5) + 32;
    _lastCelsius = celsius;
    _lastFahrenheit = fahrenheit;
    return fahrenheit;
}`}
          fhevm={`// FHEVM Signature Direction
function convertCtoF(
    externalEuint32 calldata encCelsius,
    bytes calldata inputProof
) external returns (euint32) {
    euint32 celsius = FHE.fromExternal(
        encCelsius, inputProof
    );
    // Your conversion logic here...
    // Hint: FHE.mul, FHE.div, FHE.add
    // Don't forget ACL permissions!
}`}
          solidityFilename="TemperatureConverter.sol"
          fhevmFilename="FHETemperatureConverter.sol"
        />

        <CalloutBox type="warning" title="Direction Only -- Not the Complete Solution">
          The code above shows the function signature transformation, not the
          full implementation. You must implement the complete conversion logic
          using FHE operations, store both encrypted values, set ACL
          permissions for all state variables, and write comprehensive tests
          yourself.
        </CalloutBox>
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
                Replace all{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  uint32
                </code>{" "}
                state variables with{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  euint32
                </code>{" "}
                encrypted types
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </span>
              <span className="leading-relaxed">
                Accept encrypted Celsius input via{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  externalEuint32
                </code>{" "}
                +{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  inputProof
                </code>{" "}
                and validate with{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.fromExternal
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </span>
              <span className="leading-relaxed">
                Perform the Celsius-to-Fahrenheit conversion using FHE
                operations:{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.mul
                </code>
                ,{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.div
                </code>{" "}
                (plaintext divisor), and{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.add
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                4
              </span>
              <span className="leading-relaxed">
                Set proper ACL permissions with{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.allowThis
                </code>{" "}
                and{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  FHE.allow
                </code>{" "}
                for all stored encrypted values
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                5
              </span>
              <span className="leading-relaxed">
                Inherit from{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  ZamaEthereumConfig
                </code>{" "}
                for automatic coprocessor configuration
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-text-secondary">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                6
              </span>
              <span className="leading-relaxed">
                Write comprehensive tests using{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  createEncryptedInput
                </code>{" "}
                and{" "}
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  userDecryptEuint
                </code>{" "}
                to verify the conversion produces correct results
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Getting Started
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="leading-relaxed text-text-secondary">
            Make sure you have completed the development environment setup from{" "}
            <Link
              href="/week/1/lesson/development-environment-setup"
              className="text-primary hover:underline"
            >
              Lesson 1.3: Development Environment Setup
            </Link>
            . Your Hardhat project should be configured with the FHEVM plugin
            and mock mode should be working. If you can compile and test the
            FHECounter from Lesson 1.4, you are ready to start this homework.
          </p>
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
                  Compilation
                </td>
                <td className="border border-border px-4 py-2.5">20%</td>
                <td className="border border-border px-4 py-2.5">
                  Compiles with zero warnings
                </td>
                <td className="border border-border px-4 py-2.5">
                  Compiles with minor warnings
                </td>
                <td className="border border-border px-4 py-2.5">
                  Does not compile
                </td>
              </tr>
              <tr className="bg-surface/50">
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Encrypted Types
                </td>
                <td className="border border-border px-4 py-2.5">30%</td>
                <td className="border border-border px-4 py-2.5">
                  All types correctly migrated, proper casting
                </td>
                <td className="border border-border px-4 py-2.5">
                  Most types correct, minor issues
                </td>
                <td className="border border-border px-4 py-2.5">
                  Incorrect types or missing migration
                </td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  ACL Permissions
                </td>
                <td className="border border-border px-4 py-2.5">20%</td>
                <td className="border border-border px-4 py-2.5">
                  Both allowThis and allow correctly placed
                </td>
                <td className="border border-border px-4 py-2.5">
                  Most permissions correct
                </td>
                <td className="border border-border px-4 py-2.5">
                  Missing or incorrect ACL
                </td>
              </tr>
              <tr className="bg-surface/50">
                <td className="border border-border px-4 py-2.5 font-medium text-text-primary">
                  Tests
                </td>
                <td className="border border-border px-4 py-2.5">30%</td>
                <td className="border border-border px-4 py-2.5">
                  Tests for conversion, edge cases, permissions
                </td>
                <td className="border border-border px-4 py-2.5">
                  Basic conversion test passes
                </td>
                <td className="border border-border px-4 py-2.5">
                  Tests missing or failing
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Submission Guidelines */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Submission Guidelines
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </span>
              <span className="leading-relaxed">
                Create a GitHub repository with your Hardhat project
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </span>
              <span className="leading-relaxed">
                Include the migrated contract file (
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  contracts/FHETemperatureConverter.sol
                </code>
                )
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </span>
              <span className="leading-relaxed">
                Include the test file (
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  test/FHETemperatureConverter.ts
                </code>
                )
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                4
              </span>
              <span className="leading-relaxed">
                Ensure all tests pass in mock mode (
                <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
                  npx hardhat test
                </code>
                ) before submission
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                5
              </span>
              <span className="leading-relaxed">
                Share the repository link for review
              </span>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}
