import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson1_4Meta = {
  learningObjective:
    "Learn how to migrate a standard Solidity contract to use FHEVM encrypted types, operations, and access control.",
}

export function Lesson1_4Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        In this lesson, we will migrate a simple Solidity counter contract to
        its FHEVM equivalent. This is the foundational pattern you will
        repeat throughout the course: take familiar Solidity code, identify
        the state variables that need encryption, replace them with encrypted
        types, and wire up the FHE library calls and ACL permissions.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The 4-Step Migration Pattern
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Every Solidity-to-FHEVM migration follows four steps:
      </p>

      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-primary mb-1">Step 1: Replace Types</p>
          <p className="text-sm text-text-secondary">
            <code className="text-xs rounded bg-code-bg px-1 py-0.5 font-mono">uint256</code> becomes{" "}
            <code className="text-xs rounded bg-code-bg px-1 py-0.5 font-mono text-primary">euint32</code> (or euint64, ebool, etc.)
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-primary mb-1">Step 2: Update Operations</p>
          <p className="text-sm text-text-secondary">
            <code className="text-xs rounded bg-code-bg px-1 py-0.5 font-mono">a + b</code> becomes{" "}
            <code className="text-xs rounded bg-code-bg px-1 py-0.5 font-mono text-primary">FHE.add(a, b)</code>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-primary mb-1">Step 3: Set ACL Permissions</p>
          <p className="text-sm text-text-secondary">
            Call{" "}
            <code className="text-xs rounded bg-code-bg px-1 py-0.5 font-mono text-primary">FHE.allowThis()</code> and{" "}
            <code className="text-xs rounded bg-code-bg px-1 py-0.5 font-mono text-primary">FHE.allow()</code> after every state change
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-primary mb-1">Step 4: Validate Inputs</p>
          <p className="text-sm text-text-secondary">
            Accept{" "}
            <code className="text-xs rounded bg-code-bg px-1 py-0.5 font-mono text-primary">externalEuint32</code> +{" "}
            <code className="text-xs rounded bg-code-bg px-1 py-0.5 font-mono text-primary">inputProof</code> and call{" "}
            <code className="text-xs rounded bg-code-bg px-1 py-0.5 font-mono text-primary">FHE.fromExternal()</code>
          </p>
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Side-by-Side: Counter Migration
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Let&apos;s apply these four steps to a simple counter. On the left is the
        standard Solidity contract. On the right is the FHEVM version with every
        change highlighted:
      </p>

      <CodeDiff
        solidity={`// Standard Solidity Counter
pragma solidity ^0.8.24;

contract Counter {
  uint256 public count;

  function increment(
    uint256 value
  ) external {
    count += value;
  }

  function getCount()
    external view
    returns (uint256)
  {
    return count;
  }
}`}
        fhevm={`// FHEVM Encrypted Counter
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 }
  from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig }
  from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHECounter is ZamaEthereumConfig {
  euint32 private _count;

  function increment(
    externalEuint32 encValue,
    bytes calldata inputProof
  ) external {
    euint32 val = FHE.fromExternal(
      encValue, inputProof
    );
    _count = FHE.add(_count, val);
    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);
  }

  function getCount()
    external view
    returns (euint32)
  {
    return _count;
  }
}`}
        solidityFilename="Counter.sol"
        fhevmFilename="FHECounter.sol"
        highlightLines={[4, 5, 6, 7, 9, 10, 13, 14, 15, 17, 18, 19, 20, 21, 22, 27]}
      />

      <CalloutBox type="tip" title="Migration Pattern">
        Notice how every state variable becomes an encrypted type, every
        operation uses the FHE library, and every state mutation requires
        ACL permission calls. This pattern is consistent across all FHEVM contracts.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Understanding the Imports
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The FHEVM contract needs two imports: the FHE library (which provides
        encrypted types and operations) and the network configuration (which
        connects to the FHE coprocessor):
      </p>

      <CodeBlock
        code={`// The FHE library -- provides all encrypted types and operations
import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";

// Network config -- connects to Zama's coprocessor on Sepolia
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

// Your contract inherits ZamaEthereumConfig
// This sets up the FHE gateway address automatically
contract MyContract is ZamaEthereumConfig {
  // ...
}`}
        lang="solidity"
        filename="imports.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Why ACL Matters
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The ACL (Access Control List) is the most critical concept in FHEVM.
        Every encrypted value has an invisible permission list. When you
        create or update an encrypted value, you must explicitly declare who
        can access it:
      </p>

      <div className="my-6 rounded-lg border border-border bg-card p-5">
        <ul className="space-y-3 text-text-secondary">
          <li className="flex items-start gap-2.5">
            <code className="mt-0.5 shrink-0 rounded bg-code-bg px-1.5 py-0.5 text-xs font-mono text-primary">FHE.allowThis(_count)</code>
            <span className="text-sm leading-relaxed">Grants the contract itself permission to read and operate on _count in future transactions</span>
          </li>
          <li className="flex items-start gap-2.5">
            <code className="mt-0.5 shrink-0 rounded bg-code-bg px-1.5 py-0.5 text-xs font-mono text-primary">FHE.allow(_count, msg.sender)</code>
            <span className="text-sm leading-relaxed">Grants the caller permission to decrypt _count off-chain via the frontend</span>
          </li>
        </ul>
      </div>

      <CalloutBox type="warning" title="Forgetting FHE.allowThis = Contract Loses Access">
        If you omit{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.allowThis()
        </code>{" "}
        after updating an encrypted state variable, the contract itself will not
        be able to read or operate on that value in the next transaction. This is
        the most common bug in FHEVM development.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The Input Validation Flow
      </h2>

      <p className="text-text-secondary leading-relaxed">
        When a user wants to send an encrypted value to the contract, the process
        works like this:
      </p>

      <div className="my-6 rounded-lg border border-border bg-card p-5">
        <ol className="space-y-2 text-text-secondary text-sm">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">1</span>
            <span className="leading-relaxed">
              <strong className="text-foreground">Client-side:</strong> The frontend SDK encrypts the plaintext value
              and generates a ZKPoK (Zero-Knowledge Proof of Knowledge)
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">2</span>
            <span className="leading-relaxed">
              <strong className="text-foreground">Transaction:</strong> Both the encrypted data ({" "}
              <code className="rounded bg-code-bg px-1 py-0.5 text-xs font-mono text-primary">externalEuint32</code>
              ) and the proof are sent as calldata
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">3</span>
            <span className="leading-relaxed">
              <strong className="text-foreground">Contract:</strong>{" "}
              <code className="rounded bg-code-bg px-1 py-0.5 text-xs font-mono text-primary">FHE.fromExternal()</code> validates the proof
              and returns a usable{" "}
              <code className="rounded bg-code-bg px-1 py-0.5 text-xs font-mono text-primary">euint32</code> handle
            </span>
          </li>
        </ol>
      </div>

      <Quiz
        question={{
          id: "1.4-q1",
          question:
            "Why does the FHEVM counter use `externalEuint32` instead of a regular `uint256` parameter?",
          options: [
            "It's more gas efficient than uint256",
            "It validates the encrypted input with a zero-knowledge proof",
            "It allows the value to be larger than uint256",
            "It's required by the Solidity compiler for private variables",
          ],
          correctIndex: 1,
          explanation:
            "externalEuint32 represents an encrypted value submitted by the user along with a ZKPoK (Zero-Knowledge Proof of Knowledge). FHE.fromExternal() validates the proof and converts it to a usable euint32 handle that the contract can operate on.",
        }}
      />

      <Quiz
        question={{
          id: "1.4-q2",
          question:
            "What happens if you forget to call FHE.allowThis() after updating an encrypted state variable?",
          options: [
            "The transaction reverts immediately",
            "The variable becomes zero",
            "The contract cannot access the value in future transactions",
            "Nothing -- it's optional",
          ],
          correctIndex: 2,
          explanation:
            "FHE.allowThis() grants the contract itself permission to read the encrypted value. Without it, the contract cannot perform any operations on that value in subsequent transactions. This is the most common bug in FHEVM development.",
        }}
      />

      <InstructorNotes>
        <p>
          This is the most important lesson in Week 1. Students often
          struggle with three things:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>Why ACL is needed:</strong> The contract is a separate entity from
            the user. Just because a user sent the data doesn&apos;t mean the contract
            can use it in the next transaction.
          </li>
          <li>
            <strong>externalEuint32 vs euint32:</strong> External is for user inputs
            (comes with proof), internal euint32 is for state variables (already validated).
          </li>
          <li>
            <strong>allowThis after every mutation:</strong> Every time you assign to an
            encrypted state variable, call allowThis. No exceptions.
          </li>
        </ul>
        <p className="mt-2">
          <strong>Practical exercise:</strong> Have students deliberately omit
          FHE.allowThis() and observe the error in mock mode. Then add it back
          and verify it works. This drives the lesson home better than any
          explanation.
        </p>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
