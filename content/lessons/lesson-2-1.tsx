import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson2_1Meta = {
  learningObjective:
    "Know all FHEVM encrypted types, understand gas cost implications, and perform casting between encrypted types.",
}

export function Lesson2_1Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        FHEVM provides encrypted equivalents for most Solidity primitive types.
        Choosing the right encrypted type is one of the most impactful decisions
        you will make as an FHEVM developer -- it directly affects gas costs,
        computation time, and contract usability. In this lesson, we will
        catalog every encrypted type, learn when to use each one, and master
        the casting and trivial encryption patterns.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The Complete Encrypted Type Catalog
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Every standard Solidity unsigned integer type has an encrypted
        counterpart in FHEVM. The naming convention is simple: prefix the
        type with{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          e
        </code>
        . A{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          uint32
        </code>{" "}
        becomes an{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          euint32
        </code>
        , a{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          bool
        </code>{" "}
        becomes an{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ebool
        </code>
        , and an{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          address
        </code>{" "}
        becomes an{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          eaddress
        </code>
        .
      </p>

      <CodeBlock
        code={`// FHEVM Encrypted Type Catalog
// ─────────────────────────────────────────────────────────
// Type         | Description                | Gas Cost
// ─────────────────────────────────────────────────────────
// ebool        | Encrypted boolean          | Cheapest
// euint8       | Encrypted 8-bit uint       | Very Low
// euint16      | Encrypted 16-bit uint      | Low
// euint32      | Encrypted 32-bit uint      | Moderate
// euint64      | Encrypted 64-bit uint      | Higher
// euint128     | Encrypted 128-bit uint     | High
// euint256     | Encrypted 256-bit uint     | Highest
// eaddress     | Encrypted address          | High
// ─────────────────────────────────────────────────────────
//
// RULE: Always use the SMALLEST type that fits your data.
// Token balances? euint64. Yes/no flags? ebool.
// Small counters (0-255)? euint8.`}
        lang="solidity"
        filename="type-catalog.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Migrating Variable Declarations
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The first step in any FHEVM migration is replacing plaintext state
        variables with their encrypted counterparts. Notice how the visibility
        changes from{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          public
        </code>{" "}
        to{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          private
        </code>{" "}
        -- encrypted state should never be marked public because the raw
        ciphertext is meaningless to outside observers.
      </p>

      <CodeDiff
        solidity={`// Standard Solidity Variables
contract TokenVault {
    bool public isActive;
    uint8 public level;
    uint32 public score;
    uint64 public balance;
    address public recipient;

    mapping(address => uint64)
        public balances;
}`}
        fhevm={`// FHEVM Encrypted Variables
contract FHETokenVault
    is ZamaEthereumConfig
{
    ebool private _isActive;
    euint8 private _level;
    euint32 private _score;
    euint64 private _balance;
    eaddress private _recipient;

    mapping(address => euint64)
        private _balances;
}`}
        solidityFilename="TokenVault.sol"
        fhevmFilename="FHETokenVault.sol"
        highlightLines={[3, 4, 5, 6, 7, 9, 10]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Type Casting Between Encrypted Types
      </h2>

      <p className="text-text-secondary leading-relaxed">
        FHEVM supports casting between encrypted types using the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.asEuintXX
        </code>{" "}
        family of functions. Upcasting (smaller to larger) is always safe.
        Downcasting (larger to smaller) truncates the upper bits -- just like
        Solidity&apos;s native casting behavior.
      </p>

      <CodeDiff
        solidity={`// Standard Solidity Casting
uint8 small = 42;
uint32 medium = uint32(small);
    // Upcast: safe, value preserved

uint32 big = 300;
uint8 truncated = uint8(big);
    // Downcast: truncates to 44
    // (300 % 256 = 44)`}
        fhevm={`// FHEVM Encrypted Casting
euint8 small = FHE.asEuint8(42);
euint32 medium = FHE.asEuint32(small);
    // Upcast: safe, value preserved

euint32 big = FHE.asEuint32(300);
euint8 truncated = FHE.asEuint8(big);
    // Downcast: truncates upper bits
    // (same behavior as Solidity)`}
        solidityFilename="Casting.sol"
        fhevmFilename="FHECasting.sol"
        highlightLines={[2, 3, 6, 7]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Trivial Encryption
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Trivial encryption converts a plaintext constant into an encrypted
        value. This is essential when you need to use a known value in FHE
        operations -- for example, initializing a counter to zero or adding a
        constant. The syntax is the same as casting:{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.asEuint32(42)
        </code>{" "}
        takes the plaintext value 42 and creates an encrypted{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          euint32
        </code>{" "}
        containing it.
      </p>

      <CodeBlock
        code={`// Trivial encryption examples
euint32 zero = FHE.asEuint32(0);         // encrypted zero
euint64 initial = FHE.asEuint64(1000);   // encrypted 1000
ebool flag = FHE.asEbool(true);          // encrypted true

// Common use: initialize state in constructor
constructor() {
    _totalSupply = FHE.asEuint64(0);
    FHE.allowThis(_totalSupply);
}`}
        lang="solidity"
        filename="trivial-encryption.sol"
      />

      <CalloutBox type="tip" title="Trivial Encryption is NOT Private">
        When you write{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.asEuint32(42)
        </code>{" "}
        in your contract, the plaintext value 42 is visible in the contract
        bytecode and in transaction calldata. Trivial encryption creates a
        valid ciphertext for use in FHE operations, but the original value is
        not secret. Only values encrypted off-chain by users (via{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          externalEuintXX
        </code>
        ) are truly private.
      </CalloutBox>

      <CalloutBox type="mistake" title="Do Not Use euint256 for Everything">
        A common beginner mistake is using{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          euint256
        </code>{" "}
        for all variables because that is what Solidity developers are used to
        with{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          uint256
        </code>
        . In FHE, larger types mean exponentially more expensive operations.
        A single{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.add
        </code>{" "}
        on{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          euint256
        </code>{" "}
        costs many times more gas than the same operation on{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          euint32
        </code>
        . Always choose the smallest type that fits your data range.
      </CalloutBox>

      <Quiz
        question={{
          id: "2.1-q1",
          question:
            "Which encrypted type should you use for a yes/no vote in a governance contract?",
          options: [
            "euint8",
            "euint32",
            "ebool",
            "euint256",
          ],
          correctIndex: 2,
          explanation:
            "ebool is the correct choice for binary (yes/no) values. It is the cheapest encrypted type and perfectly represents a boolean vote. Using any larger type would waste gas.",
        }}
      />

      <Quiz
        question={{
          id: "2.1-q2",
          question:
            "What does FHE.asEuint32(42) do?",
          options: [
            "Decrypts a ciphertext to reveal the value 42",
            "Creates an encrypted euint32 containing the value 42 (trivial encryption)",
            "Casts an ebool to a euint32",
            "Validates that a ciphertext equals 42",
          ],
          correctIndex: 1,
          explanation:
            "FHE.asEuint32(42) performs trivial encryption: it converts the plaintext value 42 into an encrypted euint32 ciphertext. This is used for constants in FHE operations. Note: the value 42 is still visible in calldata -- trivial encryption is not private.",
        }}
      />

      <Quiz
        question={{
          id: "2.1-q3",
          question:
            "A contract stores an age field that will never exceed 150. Which encrypted type is most gas-efficient?",
          options: [
            "euint256 -- same as Solidity convention",
            "euint64 -- safe default for integers",
            "euint8 -- fits 0-255, smallest type for the range",
            "euint32 -- good general-purpose choice",
          ],
          correctIndex: 2,
          explanation:
            "euint8 holds values 0-255, which comfortably fits an age that will never exceed 150. Using a larger type like euint32 or euint64 would work but would cost significantly more gas for every FHE operation on that value.",
        }}
      />

      <InstructorNotes>
        <p>
          This lesson sets the foundation for all Week 2 material. Key teaching
          points:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>Interactive exercise:</strong> Present 5 data scenarios and
            ask students to pick the optimal encrypted type:
          </li>
          <li className="ml-4">A yes/no vote &rarr; ebool</li>
          <li className="ml-4">A token balance &rarr; euint64</li>
          <li className="ml-4">A hidden wallet address &rarr; eaddress</li>
          <li className="ml-4">An age verification (0-150) &rarr; euint8</li>
          <li className="ml-4">A secret key (large number) &rarr; euint256</li>
          <li>
            Emphasize that trivially encrypted values are NOT private. This
            confuses many students who assume all encrypted values are hidden.
          </li>
          <li>
            Gas cost differences are dramatic -- show concrete examples if
            available from Zama docs or benchmarks.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
