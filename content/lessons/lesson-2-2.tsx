import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson2_2Meta = {
  learningObjective:
    "Use all arithmetic, comparison, and bitwise FHE operations, and understand the critical paradigm shift from if/else to FHE.select.",
}

export function Lesson2_2Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        In standard Solidity, operations on data are straightforward:{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          a + b
        </code>
        ,{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          a &gt; b
        </code>
        ,{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          if (condition)
        </code>
        . In FHEVM, all of these must go through the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE
        </code>{" "}
        library because data is encrypted -- the EVM cannot natively process
        ciphertexts. This lesson covers every operation available in FHEVM and
        introduces the most critical paradigm shift in encrypted programming:
        replacing{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          if/else
        </code>{" "}
        with{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>
        .
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Arithmetic Operations
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Every arithmetic operator you use in Solidity has an FHE equivalent.
        The key difference is that FHE operations work on encrypted values --
        neither the operands nor the result are ever revealed on-chain.
      </p>

      <CodeDiff
        solidity={`// Standard Solidity Arithmetic
uint64 balance = 1000;
uint64 amount = 250;

uint64 sum = balance + amount;
uint64 diff = balance - amount;
uint64 product = balance * amount;
uint64 quotient = balance / 4;
uint64 remainder = balance % 3;
uint64 smaller = balance < amount
    ? amount : balance;
uint64 bigger = balance > amount
    ? balance : amount;`}
        fhevm={`// FHEVM Encrypted Arithmetic
euint64 balance = FHE.asEuint64(1000);
euint64 amount = FHE.asEuint64(250);

euint64 sum = FHE.add(balance, amount);
euint64 diff = FHE.sub(balance, amount);
euint64 product = FHE.mul(balance, amount);
euint64 quotient = FHE.div(balance, 4);
euint64 remainder = FHE.rem(balance, 3);
euint64 smaller = FHE.min(balance, amount);

euint64 bigger = FHE.max(balance, amount);
`}
        solidityFilename="Arithmetic.sol"
        fhevmFilename="FHEArithmetic.sol"
        highlightLines={[5, 6, 7, 8, 9, 10, 12]}
      />

      <CalloutBox type="mistake" title="Division Only Supports Plaintext Divisors">
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.div(a, b)
        </code>{" "}
        and{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.rem(a, b)
        </code>{" "}
        only accept a <strong>plaintext</strong> second operand. You cannot
        divide by an encrypted value. This is a fundamental limitation of
        current FHE schemes. If you need to divide by a value that comes from
        user input, you will need to redesign your logic to avoid encrypted
        division.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Comparison Operations
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Comparison operations in FHEVM return{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ebool
        </code>{" "}
        -- an <strong>encrypted boolean</strong>. This is fundamentally
        different from Solidity where comparisons return a plaintext{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          bool
        </code>{" "}
        that can be used in{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          if
        </code>{" "}
        statements and{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          require
        </code>{" "}
        guards.
      </p>

      <CodeDiff
        solidity={`// Standard Comparisons with require()
function withdraw(uint64 amount) external {
    // Returns plaintext bool
    require(
        balances[msg.sender] >= amount,
        "Insufficient balance"
    );
    // require() works because
    // the condition is plaintext
    balances[msg.sender] -= amount;
}`}
        fhevm={`// FHE Comparisons return ebool
function withdraw(
    externalEuint64 calldata encAmount,
    bytes calldata inputProof
) external {
    euint64 amount = FHE.fromExternal(
        encAmount, inputProof
    );
    // FHE.ge returns ebool, NOT bool
    // Cannot use in require()!
    ebool hasEnough = FHE.ge(
        _balances[msg.sender], amount
    );
    // Must use FHE.select instead...
}`}
        solidityFilename="Withdraw.sol"
        fhevmFilename="FHEWithdraw.sol"
        highlightLines={[9, 10, 11, 12, 13, 14]}
      />

      <CodeBlock
        code={`// All FHE Comparison Operations
// Each returns ebool (encrypted boolean)

FHE.eq(a, b)   // a == b (equal)
FHE.ne(a, b)   // a != b (not equal)
FHE.lt(a, b)   // a < b  (less than)
FHE.le(a, b)   // a <= b (less than or equal)
FHE.gt(a, b)   // a > b  (greater than)
FHE.ge(a, b)   // a >= b (greater than or equal)`}
        lang="solidity"
        filename="comparisons.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The Critical Paradigm Shift: FHE.select
      </h2>

      <p className="text-text-secondary leading-relaxed">
        This is <strong>the most important concept in FHEVM programming</strong>
        . In Solidity, you use{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          if/else
        </code>{" "}
        for conditional logic. In FHEVM, encrypted booleans cannot be
        evaluated by the EVM -- their value is hidden inside the ciphertext.
        Instead, you must use{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select(condition, ifTrue, ifFalse)
        </code>
        , which acts like an encrypted ternary operator.
      </p>

      <CodeDiff
        solidity={`// Standard Solidity: if/else
function transfer(
    address to,
    uint64 amount
) external {
    if (balances[msg.sender] >= amount) {
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
    // If insufficient: nothing happens
}`}
        fhevm={`// FHEVM: FHE.select replaces if/else
function transfer(
    address to,
    externalEuint64 calldata encAmount,
    bytes calldata inputProof
) external {
    euint64 amount = FHE.fromExternal(
        encAmount, inputProof
    );
    ebool hasEnough = FHE.ge(
        _balances[msg.sender], amount
    );
    // Both branches ALWAYS execute
    _balances[msg.sender] = FHE.select(
        hasEnough,
        FHE.sub(_balances[msg.sender], amount),
        _balances[msg.sender]
    );
    _balances[to] = FHE.select(
        hasEnough,
        FHE.add(_balances[to], amount),
        _balances[to]
    );
    // ACL permissions required
    FHE.allowThis(_balances[msg.sender]);
    FHE.allow(
        _balances[msg.sender], msg.sender
    );
    FHE.allowThis(_balances[to]);
    FHE.allow(_balances[to], to);
}`}
        solidityFilename="Transfer.sol"
        fhevmFilename="FHETransfer.sol"
        highlightLines={[10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]}
      />

      <CalloutBox type="warning" title="Both Branches of FHE.select Are ALWAYS Computed">
        Unlike{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          if/else
        </code>{" "}
        which only executes one branch, both the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ifTrue
        </code>{" "}
        and{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ifFalse
        </code>{" "}
        values in{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        are always evaluated. This means both{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.sub
        </code>{" "}
        and the identity expression execute regardless of the condition. This
        is a fundamental property of FHE -- the computation must not leak which
        branch was taken, because that would reveal the encrypted condition.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Bitwise Operations
      </h2>

      <p className="text-text-secondary leading-relaxed">
        FHEVM also supports bitwise operations on encrypted integers. These
        are useful for flag manipulation, masking, and certain cryptographic
        patterns.
      </p>

      <CodeBlock
        code={`// Bitwise Operations on Encrypted Values
FHE.and(a, b)     // bitwise AND
FHE.or(a, b)      // bitwise OR
FHE.xor(a, b)     // bitwise XOR
FHE.not(a)        // bitwise NOT
FHE.shl(a, b)     // shift left
FHE.shr(a, b)     // shift right
FHE.rotl(a, b)    // rotate left
FHE.rotr(a, b)    // rotate right

// Note: Shift amount is modular.
// FHE.shr(euint64Value, 70) is the same as
// FHE.shr(euint64Value, 6) because 70 % 64 = 6`}
        lang="solidity"
        filename="bitwise-ops.sol"
      />

      <Quiz
        question={{
          id: "2.2-q1",
          question:
            "Why can't you use if(ebool) in FHEVM?",
          options: [
            "The Solidity compiler does not support ebool in if statements",
            "ebool is encrypted -- its value is hidden and cannot be evaluated by the EVM at runtime",
            "ebool only works with FHE.eq, not with if statements",
            "You can use if(ebool), but it is slower than FHE.select",
          ],
          correctIndex: 1,
          explanation:
            "An ebool is an encrypted boolean -- its true/false value is hidden inside a ciphertext. The EVM cannot 'see' whether it is true or false, so it cannot decide which branch of an if statement to execute. FHE.select computes both branches and returns the correct one without revealing the condition.",
        }}
      />

      <Quiz
        question={{
          id: "2.2-q2",
          question:
            "Given the following code, what value does 'result' contain when balance is 500 and amount is 300?\n\nebool hasEnough = FHE.ge(balance, amount);\neuint64 result = FHE.select(hasEnough, FHE.sub(balance, amount), balance);",
          options: [
            "500 (the original balance, unchanged)",
            "200 (balance minus amount, since 500 >= 300)",
            "300 (the amount value)",
            "0 (the subtraction underflowed)",
          ],
          correctIndex: 1,
          explanation:
            "Since balance (500) >= amount (300), FHE.ge returns encrypted true. FHE.select returns the ifTrue branch: FHE.sub(500, 300) = 200. Note that both FHE.sub(balance, amount) and balance are computed, but only the FHE.sub result is returned.",
        }}
      />

      <Quiz
        question={{
          id: "2.2-q3",
          question: "What type does FHE.gt(a, b) return?",
          options: [
            "bool -- a plaintext boolean",
            "uint256 -- 0 for false, 1 for true",
            "ebool -- an encrypted boolean",
            "euint8 -- encrypted 0 or 1",
          ],
          correctIndex: 2,
          explanation:
            "All FHE comparison operations (eq, ne, lt, le, gt, ge) return ebool -- an encrypted boolean. The result cannot be used in if statements or require guards. Use FHE.select for conditional logic based on ebool values.",
        }}
      />

      <InstructorNotes>
        <p>
          This is arguably the most important lesson in the entire curriculum.
          The shift from imperative (if/else) to functional-style branching
          (FHE.select) is the hardest mental model change for students.
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            Spend extra time on the FHE.select paradigm. Most students will try
            to use if/else on their first attempt.
          </li>
          <li>
            Emphasize that both branches always execute -- this has performance
            implications. Every FHE operation in both branches costs gas.
          </li>
          <li>
            The shift operator modulo behavior is a subtle gotcha:{" "}
            <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
              FHE.shr(euint64, 70)
            </code>{" "}
            shifts by 6 (70 % 64), not 70. This catches students off guard.
          </li>
          <li>
            Draw the analogy: FHE.select is like a MUX (multiplexer) in
            hardware -- it selects one of two inputs based on a control signal,
            but both inputs are always present.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
