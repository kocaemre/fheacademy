/**
 * Solidity-to-FHEVM Transformation Guide
 *
 * Step-by-step migration reference showing how to convert a vanilla Solidity
 * contract to its FHEVM v0.9 equivalent. Follows the "Migration Mindset"
 * teaching philosophy: left panel = Solidity, right panel = FHEVM.
 *
 * All code patterns verified against Zama docs (docs.zama.org) and
 * Context7 (/zama-ai/fhevm). No AI-generated FHEVM code from memory.
 *
 * DEPRECATED PATTERN CHECKLIST -- this file MUST NOT contain:
 * - TFHE.* (old namespace -- use FHE.*)
 * - Gateway.requestDecryption (removed in v0.9)
 * - GatewayCaller (removed in v0.9)
 * - einput (replaced by externalEuintXX in v0.7)
 * - ebytes (removed in v0.7)
 * - SepoliaConfig (replaced by ZamaEthereumConfig)
 * - decryptionOracle (removed in v0.9)
 */

export default function SolidityToFhevmGuide() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-text-primary">
      {/* ---------------------------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">
          Solidity to FHEVM: Migration Guide
        </h1>
        <p className="text-lg text-text-secondary">
          A step-by-step reference for transforming vanilla Solidity contracts
          into confidential FHEVM v0.9 contracts. Follow these 6 sequential
          steps to migrate any contract -- each step builds on the previous one.
        </p>
        <p className="mt-3 text-sm text-text-muted">
          Teaching approach: &quot;Migration Mindset&quot; -- learn FHEVM by
          seeing familiar Solidity patterns transform into their encrypted
          equivalents.
        </p>
      </section>

      {/* ================================================================ */}
      {/* STEP 1: Import and Configuration */}
      {/* ================================================================ */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-semibold">
          Step 1: Import and Configuration
        </h2>
        <p className="mb-4 text-text-secondary">
          Add the FHEVM library import and inherit from{" "}
          <code>ZamaEthereumConfig</code>. This base contract auto-configures
          the FHE coprocessor and network settings based on{" "}
          <code>chainId</code>.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Solidity */}
          <div className="rounded-lg border border-border">
            <div className="border-b border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted">
              Vanilla Solidity
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// No special imports needed

contract MyContract {
    // Standard Solidity contract
}`}
            </pre>
          </div>

          {/* FHEVM */}
          <div className="rounded-lg border border-primary/30">
            <div className="border-b border-primary/30 bg-surface px-4 py-2 text-sm font-medium text-primary">
              FHEVM v0.9
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 }
  from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig }
  from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is ZamaEthereumConfig {
    // FHEVM-enabled contract
}`}
            </pre>
          </div>
        </div>

        <p className="mt-3 text-sm text-text-muted">
          <strong>What changed:</strong> The FHEVM library provides all
          encrypted types and operations via the <code>FHE</code> namespace.{" "}
          <code>ZamaEthereumConfig</code> handles coprocessor setup
          automatically -- no manual configuration needed.
        </p>
      </section>

      {/* ================================================================ */}
      {/* STEP 2: Types */}
      {/* ================================================================ */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-semibold">Step 2: Types</h2>
        <p className="mb-4 text-text-secondary">
          Replace standard Solidity types with their encrypted equivalents.
          Function parameters that accept user input need{" "}
          <code>external</code>-prefixed types plus a ZKPoK proof parameter.
        </p>

        <h3 className="mb-3 mt-4 text-lg font-medium">State Variables</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-2">Solidity</th>
                <th className="px-4 py-2">FHEVM v0.9</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>uint8</code></td>
                <td className="px-4 py-2"><code>euint8</code></td>
                <td className="px-4 py-2">Cheapest FHE operations</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>uint16</code></td>
                <td className="px-4 py-2"><code>euint16</code></td>
                <td className="px-4 py-2"></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>uint32</code></td>
                <td className="px-4 py-2"><code>euint32</code></td>
                <td className="px-4 py-2">Good general-purpose default</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>uint64</code></td>
                <td className="px-4 py-2"><code>euint64</code></td>
                <td className="px-4 py-2">Recommended for token amounts</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>uint128</code></td>
                <td className="px-4 py-2"><code>euint128</code></td>
                <td className="px-4 py-2"></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>uint256</code></td>
                <td className="px-4 py-2"><code>euint256</code></td>
                <td className="px-4 py-2">Most expensive -- avoid unless needed</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>bool</code></td>
                <td className="px-4 py-2"><code>ebool</code></td>
                <td className="px-4 py-2">Encrypted boolean</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>address</code></td>
                <td className="px-4 py-2"><code>eaddress</code></td>
                <td className="px-4 py-2">Encrypted Ethereum address</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 mt-6 text-lg font-medium">Function Parameters</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border">
            <div className="border-b border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted">
              Vanilla Solidity
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`function foo(uint32 value) external {
    // use value directly
}`}
            </pre>
          </div>
          <div className="rounded-lg border border-primary/30">
            <div className="border-b border-primary/30 bg-surface px-4 py-2 text-sm font-medium text-primary">
              FHEVM v0.9
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`function foo(
    externalEuint32 value,
    bytes calldata inputProof
) external {
    euint32 v = FHE.fromExternal(
        value, inputProof
    );
    // use v
}`}
            </pre>
          </div>
        </div>

        <p className="mt-3 text-sm text-text-muted">
          <strong>What changed:</strong> Each type maps to its encrypted
          equivalent. Function parameters need a ZKPoK proof to ensure input
          integrity -- the caller encrypts the value off-chain and provides a
          proof that they created the ciphertext.
        </p>
      </section>

      {/* ================================================================ */}
      {/* STEP 3: Operations */}
      {/* ================================================================ */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-semibold">Step 3: Operations</h2>
        <p className="mb-4 text-text-secondary">
          Replace native Solidity operators with <code>FHE.*</code> function
          calls. The critical paradigm shift: <strong>
            you cannot use <code>if/else</code> with encrypted conditions
          </strong>. Use <code>FHE.select</code> instead.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-2">Solidity</th>
                <th className="px-4 py-2">FHEVM v0.9</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>a + b</code></td>
                <td className="px-4 py-2"><code>FHE.add(a, b)</code></td>
                <td className="px-4 py-2">Works with encrypted or plaintext b</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>a - b</code></td>
                <td className="px-4 py-2"><code>FHE.sub(a, b)</code></td>
                <td className="px-4 py-2"></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>a * b</code></td>
                <td className="px-4 py-2"><code>FHE.mul(a, b)</code></td>
                <td className="px-4 py-2"></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>a / b</code></td>
                <td className="px-4 py-2"><code>FHE.div(a, plaintextB)</code></td>
                <td className="px-4 py-2">Plaintext divisor ONLY</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>a == b</code></td>
                <td className="px-4 py-2"><code>FHE.eq(a, b)</code></td>
                <td className="px-4 py-2">Returns <code>ebool</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>a &lt; b</code></td>
                <td className="px-4 py-2"><code>FHE.lt(a, b)</code></td>
                <td className="px-4 py-2">Returns <code>ebool</code></td>
              </tr>
              <tr className="border-b border-border bg-surface">
                <td className="px-4 py-2"><code>condition ? a : b</code></td>
                <td className="px-4 py-2"><code>FHE.select(condition, a, b)</code></td>
                <td className="px-4 py-2 font-medium text-primary">Both branches always execute</td>
              </tr>
              <tr className="border-b border-border bg-surface">
                <td className="px-4 py-2"><code>if (condition) {"{ ... }"}</code></td>
                <td className="px-4 py-2 text-error">Cannot use if with ebool</td>
                <td className="px-4 py-2 font-medium text-primary">Use FHE.select instead</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4">
          <p className="text-sm font-medium text-warning">Critical Paradigm Shift</p>
          <p className="mt-1 text-sm text-text-secondary">
            Encrypted booleans (<code>ebool</code>) cannot be evaluated in{" "}
            <code>if</code> statements because their value is hidden. Both
            branches of <code>FHE.select</code> are always computed -- there is
            no short-circuit evaluation. This is the most fundamental difference
            between Solidity and FHEVM programming.
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* STEP 4: ACL Permissions */}
      {/* ================================================================ */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-semibold">
          Step 4: ACL Permissions
        </h2>
        <p className="mb-4 text-text-secondary">
          In standard Solidity, all data is public by default. In FHEVM, every
          ciphertext has an Access Control List (ACL). You must explicitly grant
          permissions after every state mutation that creates a new ciphertext.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border">
            <div className="border-b border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted">
              Vanilla Solidity
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`// Data is public by default
// No special permission needed
_count = _count + value;
// Anyone can read _count`}
            </pre>
          </div>
          <div className="rounded-lg border border-primary/30">
            <div className="border-b border-primary/30 bg-surface px-4 py-2 text-sm font-medium text-primary">
              FHEVM v0.9
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`// Must set ACL after every mutation
_count = FHE.add(_count, value);

// Grant contract access to use
// this ciphertext in future ops
FHE.allowThis(_count);

// Grant caller access to decrypt
FHE.allow(_count, msg.sender);`}
            </pre>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-2">Function</th>
                <th className="px-4 py-2">Purpose</th>
                <th className="px-4 py-2">When to Use</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>FHE.allowThis(handle)</code></td>
                <td className="px-4 py-2">Grant current contract access</td>
                <td className="px-4 py-2">After every state mutation (required)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>FHE.allow(handle, addr)</code></td>
                <td className="px-4 py-2">Grant specific address permanent access</td>
                <td className="px-4 py-2">Let callers decrypt their own data</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>FHE.allowTransient(handle, addr)</code></td>
                <td className="px-4 py-2">Grant temporary access (transaction only)</td>
                <td className="px-4 py-2">Cross-contract calls within same tx</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-sm text-text-muted">
          <strong>What changed:</strong> Every ciphertext has an ACL. The
          contract must grant itself access (<code>FHE.allowThis</code>) to use
          new ciphertexts in future operations. Forgetting this is the #1 source
          of FHEVM bugs.
        </p>
      </section>

      {/* ================================================================ */}
      {/* STEP 5: Encrypted Inputs */}
      {/* ================================================================ */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-semibold">
          Step 5: Encrypted Inputs
        </h2>
        <p className="mb-4 text-text-secondary">
          In Solidity, function parameters are plaintext. In FHEVM, users
          encrypt values off-chain and send the ciphertext with a ZKPoK (Zero
          Knowledge Proof of Knowledge) that proves they created it. The
          contract validates and converts this input.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border">
            <div className="border-b border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted">
              Vanilla Solidity
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`function deposit(uint32 amount)
    external
{
    // Use amount directly
    _balance += amount;
}`}
            </pre>
          </div>
          <div className="rounded-lg border border-primary/30">
            <div className="border-b border-primary/30 bg-surface px-4 py-2 text-sm font-medium text-primary">
              FHEVM v0.9
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`function deposit(
    externalEuint32 amount,
    bytes calldata inputProof
) external {
    // Verify ZKPoK + convert
    euint32 eAmount = FHE.fromExternal(
        amount, inputProof
    );
    _balance = FHE.add(_balance, eAmount);
    FHE.allowThis(_balance);
    FHE.allow(_balance, msg.sender);
}`}
            </pre>
          </div>
        </div>

        <p className="mt-3 text-sm text-text-muted">
          <strong>What changed:</strong> Off-chain encryption + ZKPoK proof
          ensures input integrity. The proof prevents replay attacks (cannot
          reuse someone else&apos;s ciphertext) and contract confusion (ciphertext
          is bound to the intended contract).
        </p>
      </section>

      {/* ================================================================ */}
      {/* STEP 6: Decryption (v0.9 Self-Relaying) */}
      {/* ================================================================ */}
      <section className="mb-12">
        <h2 className="mb-2 text-2xl font-semibold">
          Step 6: Decryption (v0.9 Self-Relaying)
        </h2>
        <p className="mb-4 text-text-secondary">
          In Solidity, you simply <code>return</code> a value. In FHEVM, values
          stay encrypted on-chain. Decryption is user-driven: the contract marks
          data as decryptable, the user decrypts off-chain via the relayer SDK,
          and submits the result with a KMS proof.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border">
            <div className="border-b border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted">
              Vanilla Solidity
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`// Plaintext return
function getBalance()
    external view
    returns (uint32)
{
    return _balance;
}
// Caller reads the value directly`}
            </pre>
          </div>
          <div className="rounded-lg border border-primary/30">
            <div className="border-b border-primary/30 bg-surface px-4 py-2 text-sm font-medium text-primary">
              FHEVM v0.9
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`// Return encrypted handle (not value)
function getBalance()
    external view
    returns (euint32)
{
    return _balance;
}

// Mark for public decryption
function revealBalance() external {
    FHE.makePubliclyDecryptable(_balance);
}`}
            </pre>
          </div>
        </div>

        <h3 className="mb-3 mt-6 text-lg font-medium">Off-chain Decryption</h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// TypeScript -- client-side using @zama-fhe/relayer-sdk
import { createInstance } from "@zama-fhe/relayer-sdk";

const instance = await createInstance();

// 1. Get the encrypted handle from the contract
const handle = await contract.getBalance();

// 2. Decrypt off-chain via KMS
const results = await instance.publicDecrypt([handle]);
const balance = results.values[handle];     // plaintext value
const proof = results.decryptionProof;       // KMS proof

// 3. Submit result + proof back to contract (if needed)
await contract.callbackWithProof(balance, proof);`}
        </pre>

        <p className="mt-3 text-sm text-text-muted">
          <strong>What changed:</strong> Values stay encrypted on-chain.
          Decryption is user-driven, not Oracle-driven. The user fetches the
          ciphertext, decrypts via the relayer SDK, and optionally submits the
          cleartext + proof back to the contract for on-chain verification.
        </p>
      </section>

      {/* ================================================================ */}
      {/* Complete Before/After: Counter Contract */}
      {/* ================================================================ */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">
          Complete Example: Counter Migration
        </h2>
        <p className="mb-4 text-text-secondary">
          A full before-and-after comparison showing a standard Counter contract
          migrated to FHEVM v0.9, applying all 6 steps.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Before */}
          <div className="rounded-lg border border-border">
            <div className="border-b border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted">
              Before: Counter.sol (Vanilla Solidity)
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint32 private _count;

    function getCount()
        external view
        returns (uint32)
    {
        return _count;
    }

    function increment(uint32 value)
        external
    {
        _count += value;
    }

    function decrement(uint32 value)
        external
    {
        require(
            _count >= value,
            "Cannot go below zero"
        );
        _count -= value;
    }
}`}
            </pre>
          </div>

          {/* After */}
          <div className="rounded-lg border border-primary/30">
            <div className="border-b border-primary/30 bg-surface px-4 py-2 text-sm font-medium text-primary">
              After: FHECounter.sol (FHEVM v0.9)
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 }
  from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig }
  from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHECounter
    is ZamaEthereumConfig
{
    euint32 private _count;

    function getCount()
        external view
        returns (euint32)
    {
        return _count;
    }

    function increment(
        externalEuint32 inputVal,
        bytes calldata inputProof
    ) external {
        euint32 eVal = FHE.fromExternal(
            inputVal, inputProof
        );
        _count = FHE.add(_count, eVal);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    function decrement(
        externalEuint32 inputVal,
        bytes calldata inputProof
    ) external {
        euint32 eVal = FHE.fromExternal(
            inputVal, inputProof
        );
        // Cannot use require with
        // encrypted values -- use
        // FHE.select for overflow
        // protection (see Week 2)
        _count = FHE.sub(
            _count, eVal
        );
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}`}
            </pre>
          </div>
        </div>

        <h3 className="mb-3 mt-6 text-lg font-medium">What Changed -- Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-2">Step</th>
                <th className="px-4 py-2">Change</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border">
                <td className="px-4 py-2">1. Import</td>
                <td className="px-4 py-2">
                  Added <code>FHE.sol</code> import + <code>is ZamaEthereumConfig</code>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">2. Types</td>
                <td className="px-4 py-2">
                  <code>uint32</code> to <code>euint32</code>, params to <code>externalEuint32 + inputProof</code>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">3. Operations</td>
                <td className="px-4 py-2">
                  <code>+=</code> to <code>FHE.add()</code>, <code>-=</code> to <code>FHE.sub()</code>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">4. ACL</td>
                <td className="px-4 py-2">
                  Added <code>FHE.allowThis()</code> + <code>FHE.allow()</code> after every mutation
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">5. Inputs</td>
                <td className="px-4 py-2">
                  Added <code>FHE.fromExternal()</code> to validate ZKPoK
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">6. Decrypt</td>
                <td className="px-4 py-2">
                  Returns encrypted handle; decryption happens off-chain via relayer SDK
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Common Mistakes */}
      {/* ================================================================ */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Common Migration Mistakes</h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-error/30 bg-error/5 p-4">
            <p className="text-sm font-medium text-error">
              Forgetting FHE.allowThis() after state mutations
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              The contract cannot use its own ciphertexts in future operations
              without explicit permission. This is the #1 source of FHEVM bugs.
            </p>
          </div>
          <div className="rounded-lg border border-error/30 bg-error/5 p-4">
            <p className="text-sm font-medium text-error">
              Using if/else with encrypted booleans
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              <code>ebool</code> values cannot be evaluated in{" "}
              <code>if</code> statements. Use <code>FHE.select(condition, a, b)</code>{" "}
              instead. Both branches always execute.
            </p>
          </div>
          <div className="rounded-lg border border-error/30 bg-error/5 p-4">
            <p className="text-sm font-medium text-error">
              Forgetting FHE.allow() for the caller
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Without <code>FHE.allow(handle, msg.sender)</code>, the caller can
              never decrypt the result -- the data becomes inaccessible to them.
            </p>
          </div>
          <div className="rounded-lg border border-error/30 bg-error/5 p-4">
            <p className="text-sm font-medium text-error">
              Dividing by an encrypted value
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              <code>FHE.div(a, b)</code> only supports a <strong>plaintext</strong>{" "}
              divisor. Division by an encrypted value is not supported in FHEVM.
            </p>
          </div>
          <div className="rounded-lg border border-error/30 bg-error/5 p-4">
            <p className="text-sm font-medium text-error">
              Not inheriting from ZamaEthereumConfig
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Without the config inheritance, no FHEVM functionality is
              available. The coprocessor connection is not established.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
