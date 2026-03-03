/**
 * FHEVM v0.9 API Reference
 *
 * Polished cheatsheet and internal source of truth for all 20 lessons.
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

export default function FhevmApiReference() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-text-primary">
      {/* ---------------------------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">FHEVM v0.9 API Reference</h1>
        <p className="text-lg text-text-secondary">
          FHEVM is Zama&apos;s Solidity framework for confidential smart contracts.
          It enables encrypted computation on-chain using Fully Homomorphic
          Encryption (FHE). With FHEVM, smart contracts can store, compute on,
          and selectively reveal encrypted data -- bringing true data
          confidentiality to public blockchains.
        </p>
        <p className="mt-3 text-sm text-text-muted">
          Version: FHEVM v0.9 (current) | Namespace: <code>FHE.*</code> |
          Config: <code>ZamaEthereumConfig</code>
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Contract Structure Boilerplate */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Contract Structure</h2>
        <p className="mb-4 text-text-secondary">
          Every FHEVM v0.9 contract follows this boilerplate. The{" "}
          <code>ZamaEthereumConfig</code> base contract auto-configures the
          coprocessor and network settings based on <code>chainId</code>.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is ZamaEthereumConfig {
    euint32 private _value;

    function setValue(externalEuint32 input, bytes calldata inputProof) external {
        euint32 v = FHE.fromExternal(input, inputProof);
        _value = v;
        FHE.allowThis(_value);
        FHE.allow(_value, msg.sender);
    }
}`}
        </pre>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Encrypted Types Catalog */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Encrypted Types</h2>
        <p className="mb-4 text-text-secondary">
          FHEVM provides encrypted equivalents of Solidity&apos;s primitive types.
          Use the <strong>smallest type that fits your data</strong> -- smaller
          types have significantly lower gas costs for FHE operations.
        </p>

        <h3 className="mb-3 mt-6 text-xl font-medium">On-chain Types (state variables, return values)</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Use Case</th>
                <th className="px-4 py-2">Gas Cost</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>ebool</code></td>
                <td className="px-4 py-2">Encrypted boolean</td>
                <td className="px-4 py-2">Flags, votes, yes/no</td>
                <td className="px-4 py-2">Cheapest</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>euint8</code></td>
                <td className="px-4 py-2">Encrypted 8-bit unsigned int</td>
                <td className="px-4 py-2">Small counters, enum-like values</td>
                <td className="px-4 py-2">Very low</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>euint16</code></td>
                <td className="px-4 py-2">Encrypted 16-bit unsigned int</td>
                <td className="px-4 py-2">Moderate counters, scores</td>
                <td className="px-4 py-2">Low</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>euint32</code></td>
                <td className="px-4 py-2">Encrypted 32-bit unsigned int</td>
                <td className="px-4 py-2">General purpose (good default)</td>
                <td className="px-4 py-2">Moderate</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>euint64</code></td>
                <td className="px-4 py-2">Encrypted 64-bit unsigned int</td>
                <td className="px-4 py-2">Token amounts, balances</td>
                <td className="px-4 py-2">Higher</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>euint128</code></td>
                <td className="px-4 py-2">Encrypted 128-bit unsigned int</td>
                <td className="px-4 py-2">Large computations</td>
                <td className="px-4 py-2">High</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>euint256</code></td>
                <td className="px-4 py-2">Encrypted 256-bit unsigned int</td>
                <td className="px-4 py-2">Avoid unless necessary</td>
                <td className="px-4 py-2">Highest</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>eaddress</code></td>
                <td className="px-4 py-2">Encrypted Ethereum address</td>
                <td className="px-4 py-2">Private recipients, hidden owners</td>
                <td className="px-4 py-2">High</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 mt-6 text-xl font-medium">
          External Input Types (function parameters)
        </h3>
        <p className="mb-3 text-text-secondary">
          When accepting encrypted values from users, function parameters use{" "}
          <code>external</code>-prefixed types. These represent ciphertexts
          encrypted off-chain by the caller, paired with a ZKPoK proof (
          <code>bytes calldata inputProof</code>).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-2">External Type</th>
                <th className="px-4 py-2">Converts To</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>externalEbool</code></td>
                <td className="px-4 py-2"><code>ebool</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>externalEuint8</code></td>
                <td className="px-4 py-2"><code>euint8</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>externalEuint16</code></td>
                <td className="px-4 py-2"><code>euint16</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>externalEuint32</code></td>
                <td className="px-4 py-2"><code>euint32</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>externalEuint64</code></td>
                <td className="px-4 py-2"><code>euint64</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>externalEuint128</code></td>
                <td className="px-4 py-2"><code>euint128</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>externalEuint256</code></td>
                <td className="px-4 py-2"><code>euint256</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code>externalEaddress</code></td>
                <td className="px-4 py-2"><code>eaddress</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Operations Reference */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Operations Reference</h2>

        {/* Arithmetic */}
        <h3 className="mb-3 mt-6 text-xl font-medium">Arithmetic</h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`FHE.add(a, b)     // a + b  (encrypted + encrypted, or encrypted + plaintext)
FHE.sub(a, b)     // a - b
FHE.mul(a, b)     // a * b
FHE.div(a, b)     // a / b  -- PLAINTEXT divisor ONLY
FHE.rem(a, b)     // a % b  -- PLAINTEXT divisor ONLY
FHE.min(a, b)     // minimum of two encrypted values
FHE.max(a, b)     // maximum of two encrypted values
FHE.neg(a)        // negation (two's complement)`}
        </pre>
        <p className="mt-2 text-sm text-text-muted">
          Note: <code>FHE.div</code> and <code>FHE.rem</code> only accept a{" "}
          <strong>plaintext</strong> second operand. Division by an encrypted
          value is not supported.
        </p>

        {/* Comparison */}
        <h3 className="mb-3 mt-6 text-xl font-medium">
          Comparison (all return <code>ebool</code>)
        </h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`FHE.eq(a, b)      // a == b
FHE.ne(a, b)      // a != b
FHE.lt(a, b)      // a < b
FHE.le(a, b)      // a <= b
FHE.gt(a, b)      // a > b
FHE.ge(a, b)      // a >= b`}
        </pre>
        <p className="mt-2 text-sm text-text-muted">
          Comparison results are <code>ebool</code> -- they cannot be used in{" "}
          <code>if</code> statements. Use <code>FHE.select</code> instead.
        </p>

        {/* Bitwise */}
        <h3 className="mb-3 mt-6 text-xl font-medium">Bitwise</h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`FHE.and(a, b)     // bitwise AND
FHE.or(a, b)      // bitwise OR
FHE.xor(a, b)     // bitwise XOR
FHE.not(a)        // bitwise NOT
FHE.shl(a, b)     // shift left
FHE.shr(a, b)     // shift right
FHE.rotl(a, b)    // rotate left
FHE.rotr(a, b)    // rotate right`}
        </pre>

        {/* Branching */}
        <h3 className="mb-3 mt-6 text-xl font-medium">
          Branching -- <code>FHE.select</code>
        </h3>
        <p className="mb-3 text-text-secondary">
          <code>FHE.select</code> is <strong>the critical operation</strong> in
          FHEVM. It replaces <code>if/else</code> and the ternary operator (
          <code>condition ? a : b</code>) for encrypted conditions. Both
          branches are <strong>always executed</strong> -- there is no
          short-circuit evaluation.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// Encrypted ternary: returns ifTrue when condition is true, ifFalse otherwise
FHE.select(condition, ifTrue, ifFalse)

// Example: safe transfer with overflow protection
ebool hasEnough = FHE.ge(balance, amount);
euint64 newBalance = FHE.select(hasEnough,
    FHE.sub(balance, amount),  // if sufficient: deduct
    balance                     // if insufficient: no change
);`}
        </pre>

        {/* Randomness */}
        <h3 className="mb-3 mt-6 text-xl font-medium">Randomness</h3>
        <p className="mb-3 text-text-secondary">
          Generate encrypted random numbers on-chain. The random value is
          encrypted -- nobody (not even validators) can see or predict it.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`FHE.randEuint8()    // random encrypted 8-bit value
FHE.randEuint16()   // random encrypted 16-bit value
FHE.randEuint32()   // random encrypted 32-bit value
FHE.randEuint64()   // random encrypted 64-bit value`}
        </pre>

        {/* Type Conversion */}
        <h3 className="mb-3 mt-6 text-xl font-medium">Type Conversion</h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// Trivial encryption: plaintext -> encrypted
FHE.asEuint32(42)             // encrypts the plaintext value 42

// Upcast (safe): smaller -> larger
FHE.asEuint64(euint32Value)   // euint32 -> euint64

// Downcast (truncates!): larger -> smaller
FHE.asEuint8(euint32Value)    // euint32 -> euint8 (upper bits lost)`}
        </pre>

        {/* Input Validation */}
        <h3 className="mb-3 mt-6 text-xl font-medium">Input Validation</h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// Verify ZKPoK and convert external input to on-chain type
euint32 value = FHE.fromExternal(externalEuint32Input, inputProof);

// externalEuint32Input: ciphertext encrypted off-chain by the caller
// inputProof: ZKPoK proving the caller created this ciphertext`}
        </pre>

        {/* Initialization Check */}
        <h3 className="mb-3 mt-6 text-xl font-medium">Initialization Check</h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// Check if an encrypted variable has been initialized
bool initialized = FHE.isInitialized(handle);
require(FHE.isInitialized(_count), "Counter not yet initialized");`}
        </pre>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* ACL System */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">ACL System</h2>
        <p className="mb-4 text-text-secondary">
          Every ciphertext in FHEVM has an Access Control List (ACL) that
          determines which addresses can use or decrypt it. After every state
          mutation that creates a new ciphertext handle, you must set ACL
          permissions explicitly.
        </p>

        <h3 className="mb-3 mt-6 text-xl font-medium">Permission Functions</h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// Grant current contract access to this ciphertext
// MUST be called after every state mutation
FHE.allowThis(handle);

// Grant a specific address permanent access
FHE.allow(handle, address);

// Grant temporary access (within current transaction only)
FHE.allowTransient(handle, address);

// Mark ciphertext for public decryption (v0.9 self-relaying)
FHE.makePubliclyDecryptable(handle);`}
        </pre>

        <h3 className="mb-3 mt-6 text-xl font-medium">Method Chaining</h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// Enable method chaining syntax
using FHE for *;

// Chain multiple permission grants
ciphertext.allow(address1).allow(address2);
ciphertext.allowThis().allow(msg.sender);
handle.makePubliclyDecryptable();`}
        </pre>

        <h3 className="mb-3 mt-6 text-xl font-medium">Common ACL Patterns</h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// Pattern 1: State update -- contract + caller access
_balance = FHE.add(_balance, amount);
FHE.allowThis(_balance);        // contract can use it later
FHE.allow(_balance, msg.sender); // caller can decrypt

// Pattern 2: Transfer -- update both parties
senderBal = FHE.sub(senderBal, amount);
FHE.allowThis(senderBal);
FHE.allow(senderBal, sender);

recipientBal = FHE.add(recipientBal, amount);
FHE.allowThis(recipientBal);
FHE.allow(recipientBal, recipient);

// Pattern 3: Public result -- anyone can decrypt
FHE.makePubliclyDecryptable(encryptedResult);`}
        </pre>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Self-Relaying Decryption Model (v0.9) */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">
          Self-Relaying Decryption (v0.9)
        </h2>
        <p className="mb-4 text-text-secondary">
          FHEVM v0.9 eliminates the Oracle-based decryption model. Instead,
          decryption is <strong>user-driven</strong>: the user fetches the
          ciphertext, decrypts it off-chain via the relayer SDK, and submits the
          cleartext with a KMS proof back to the contract.
        </p>

        <h3 className="mb-3 mt-6 text-xl font-medium">Step-by-Step Flow</h3>
        <ol className="mb-6 list-inside list-decimal space-y-2 text-text-secondary">
          <li>
            <strong>On-chain:</strong> Contract marks data as publicly
            decryptable via <code>FHE.makePubliclyDecryptable(handle)</code>
          </li>
          <li>
            <strong>Off-chain:</strong> User fetches ciphertext handles from the
            contract
          </li>
          <li>
            <strong>Off-chain:</strong> User calls <code>publicDecrypt()</code>{" "}
            via <code>@zama-fhe/relayer-sdk</code> to decrypt with KMS
          </li>
          <li>
            <strong>On-chain:</strong> User submits cleartext + decryption proof
            back to the contract
          </li>
          <li>
            <strong>On-chain:</strong> Contract verifies proof with{" "}
            <code>FHE.checkSignatures()</code> and uses the decrypted value
          </li>
        </ol>

        <h3 className="mb-3 mt-6 text-xl font-medium">
          On-chain: Mark for Decryption
        </h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// Solidity -- inside your contract
function requestResultDecryption() public {
    // Mark the encrypted result as publicly decryptable
    FHE.makePubliclyDecryptable(encryptedResult);
}`}
        </pre>

        <h3 className="mb-3 mt-6 text-xl font-medium">
          Off-chain: Decrypt via Relayer SDK
        </h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// TypeScript -- client-side code
import { createInstance } from "@zama-fhe/relayer-sdk";

const instance = await createInstance();

// Fetch the ciphertext handle from the contract
const handle = await contract.encryptedResult();

// Decrypt via KMS (off-chain)
const results = await instance.publicDecrypt([handle]);
const clearValue = results.values[handle];     // decrypted plaintext
const proof = results.decryptionProof;          // KMS proof`}
        </pre>

        <h3 className="mb-3 mt-6 text-xl font-medium">
          On-chain: Verify and Use Decrypted Value
        </h3>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// Solidity -- callback to receive decrypted value with proof
function callbackWithProof(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) public {
    // Verify the KMS decryption proof
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);

    // Decode and use the decrypted value
    uint64 result = abi.decode(cleartexts, (uint64));
    // ... use result ...
}`}
        </pre>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Complete Example: Voting Contract */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">
          Complete Example: Encrypted Voting
        </h2>
        <p className="mb-4 text-text-secondary">
          A complete FHEVM v0.9 voting contract demonstrating encrypted types,
          operations, ACL, input validation, and the self-relaying decryption
          pattern.
        </p>
        <pre className="overflow-x-auto rounded-lg border border-code-border bg-code-bg p-4 font-mono text-sm">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

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

    /// @notice Submit an encrypted vote (true = yes, false = no)
    function vote(externalEbool support, bytes memory inputProof) public {
        require(block.timestamp <= voteDeadline, "Too late to vote");
        require(!hasVoted[msg.sender], "Already voted");

        hasVoted[msg.sender] = true;
        ebool isSupport = FHE.fromExternal(support, inputProof);

        // Use FHE.select instead of if/else -- both branches always execute
        encryptedYesVotes = FHE.select(
            isSupport,
            FHE.add(encryptedYesVotes, FHE.asEuint64(1)),
            encryptedYesVotes
        );
        encryptedNoVotes = FHE.select(
            isSupport,
            encryptedNoVotes,
            FHE.add(encryptedNoVotes, FHE.asEuint64(1))
        );

        FHE.allowThis(encryptedYesVotes);
        FHE.allowThis(encryptedNoVotes);
    }

    /// @notice Request decryption of vote totals (v0.9 self-relaying)
    function requestVoteDecryption() public {
        require(block.timestamp > voteDeadline, "Voting is not finished");
        // Mark totals as publicly decryptable for off-chain relaying
        FHE.makePubliclyDecryptable(encryptedYesVotes);
        FHE.makePubliclyDecryptable(encryptedNoVotes);
        status = VotingStatus.DecryptionInProgress;
    }

    /// @notice Callback: user submits decrypted values + KMS proof
    function callbackDecryptVotes(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) public {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        (uint64 yesVotes, uint64 noVotes) = abi.decode(
            cleartexts,
            (uint64, uint64)
        );
        decryptedYesVotes = yesVotes;
        decryptedNoVotes = noVotes;
        status = VotingStatus.ResultsDecrypted;
    }
}`}
        </pre>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Quick Reference Table */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Quick Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Function</th>
                <th className="px-4 py-2">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border">
                <td className="px-4 py-2">Arithmetic</td>
                <td className="px-4 py-2"><code>FHE.add</code>, <code>FHE.sub</code>, <code>FHE.mul</code>, <code>FHE.div</code>, <code>FHE.rem</code></td>
                <td className="px-4 py-2">Math on encrypted values</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">Min/Max</td>
                <td className="px-4 py-2"><code>FHE.min</code>, <code>FHE.max</code>, <code>FHE.neg</code></td>
                <td className="px-4 py-2">Bounds and negation</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">Comparison</td>
                <td className="px-4 py-2"><code>FHE.eq</code>, <code>FHE.ne</code>, <code>FHE.lt</code>, <code>FHE.le</code>, <code>FHE.gt</code>, <code>FHE.ge</code></td>
                <td className="px-4 py-2">Returns <code>ebool</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">Bitwise</td>
                <td className="px-4 py-2"><code>FHE.and</code>, <code>FHE.or</code>, <code>FHE.xor</code>, <code>FHE.not</code>, <code>FHE.shl</code>, <code>FHE.shr</code>, <code>FHE.rotl</code>, <code>FHE.rotr</code></td>
                <td className="px-4 py-2">Bit-level operations</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">Branching</td>
                <td className="px-4 py-2"><code>FHE.select</code></td>
                <td className="px-4 py-2">Encrypted ternary (replaces if/else)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">Randomness</td>
                <td className="px-4 py-2"><code>FHE.randEuint8</code> ... <code>FHE.randEuint64</code></td>
                <td className="px-4 py-2">Encrypted on-chain random</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">Conversion</td>
                <td className="px-4 py-2"><code>FHE.asEuintXX</code></td>
                <td className="px-4 py-2">Trivial encryption and casting</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">Input</td>
                <td className="px-4 py-2"><code>FHE.fromExternal</code></td>
                <td className="px-4 py-2">Verify ZKPoK and convert input</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">Init</td>
                <td className="px-4 py-2"><code>FHE.isInitialized</code></td>
                <td className="px-4 py-2">Check if handle is set</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">ACL</td>
                <td className="px-4 py-2"><code>FHE.allow</code>, <code>FHE.allowThis</code>, <code>FHE.allowTransient</code></td>
                <td className="px-4 py-2">Permission management</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2">Decrypt</td>
                <td className="px-4 py-2"><code>FHE.makePubliclyDecryptable</code>, <code>FHE.checkSignatures</code></td>
                <td className="px-4 py-2">Self-relaying decryption (v0.9)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Version Notes */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Version Notes</h2>
        <p className="mb-4 text-text-secondary">
          FHEVM has undergone significant API changes across recent versions.
          This reference covers <strong>v0.9</strong> (current). Key changes
          from prior versions:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-2">Old (Deprecated)</th>
                <th className="px-4 py-2">Current (v0.9)</th>
                <th className="px-4 py-2">Changed In</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code className="text-error">TFHE.*</code></td>
                <td className="px-4 py-2"><code className="text-success">FHE.*</code></td>
                <td className="px-4 py-2">v0.7</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code className="text-error">einput</code></td>
                <td className="px-4 py-2"><code className="text-success">externalEuintXX</code></td>
                <td className="px-4 py-2">v0.7</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code className="text-error">ebytesXXX</code></td>
                <td className="px-4 py-2">Removed</td>
                <td className="px-4 py-2">v0.7</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code className="text-error">SepoliaConfig</code></td>
                <td className="px-4 py-2"><code className="text-success">ZamaEthereumConfig</code></td>
                <td className="px-4 py-2">v0.9</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code className="text-error">Gateway.requestDecryption</code></td>
                <td className="px-4 py-2"><code className="text-success">FHE.makePubliclyDecryptable</code> + relayer SDK</td>
                <td className="px-4 py-2">v0.9</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2"><code className="text-error">GatewayCaller</code></td>
                <td className="px-4 py-2">Removed (self-relaying model)</td>
                <td className="px-4 py-2">v0.9</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
