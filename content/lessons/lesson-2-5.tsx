import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson2_5Meta = {
  learningObjective:
    "Apply defensive programming patterns for FHEVM including overflow protection, initialization checks, and safe transfer patterns.",
}

export function Lesson2_5Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        By now you know the FHEVM type system, operations, encrypted inputs,
        and ACL. In this lesson, we bring it all together into{" "}
        <strong>defensive programming patterns</strong> -- battle-tested
        recipes that prevent the most common bugs in confidential smart
        contracts. These patterns should become second nature. By the end of
        Week 2, you should be able to write a safe transfer function from
        memory.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Pattern 1: Overflow Protection with FHE.select
      </h2>

      <p className="text-text-secondary leading-relaxed">
        In standard Solidity (0.8+), arithmetic overflow reverts the
        transaction. In FHEVM, you cannot use{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          require
        </code>{" "}
        with encrypted values because the comparison result (
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ebool
        </code>
        ) is encrypted. Instead, you use{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        to conditionally apply the operation -- if the condition is not met,
        the original value is preserved unchanged.
      </p>

      <CodeDiff
        solidity={`// Unsafe Transfer: no overflow check
function transfer(
    address to,
    uint64 amount
) external {
    // Solidity 0.8+ auto-reverts on
    // underflow, but in FHEVM we can't
    // use require with encrypted values
    balances[msg.sender] -= amount;
    balances[to] += amount;
}`}
        fhevm={`// Safe Transfer: FHE.select guard
function transfer(
    address to,
    externalEuint64 calldata encAmount,
    bytes calldata inputProof
) external {
    euint64 amount = FHE.fromExternal(
        encAmount, inputProof
    );
    // Check: does sender have enough?
    ebool hasEnough = FHE.ge(
        _balances[msg.sender], amount
    );
    // Deduct only if sufficient balance
    _balances[msg.sender] = FHE.select(
        hasEnough,
        FHE.sub(_balances[msg.sender],amount),
        _balances[msg.sender]
    );
    // Credit only if deduction happened
    _balances[to] = FHE.select(
        hasEnough,
        FHE.add(_balances[to], amount),
        _balances[to]
    );
    // ACL for both new handles
    FHE.allowThis(_balances[msg.sender]);
    FHE.allow(
        _balances[msg.sender], msg.sender
    );
    FHE.allowThis(_balances[to]);
    FHE.allow(_balances[to], to);
}`}
        solidityFilename="UnsafeTransfer.sol"
        fhevmFilename="SafeTransfer.sol"
        highlightLines={[11, 12, 13, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Complete Safe Transfer Pattern
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is the complete safe transfer pattern with all ACL calls. This is
        the pattern you will use in the Week 2 homework (Confidential ERC-20)
        and in nearly every FHEVM contract that moves value between addresses.
      </p>

      <CodeBlock
        code={`// The Complete Safe Transfer Pattern
// Use this as your template for any value transfer

function _safeTransfer(
    address from,
    address to,
    euint64 amount
) internal {
    // Step 1: Check balance
    ebool hasEnough = FHE.ge(_balances[from], amount);

    // Step 2: Conditionally deduct from sender
    _balances[from] = FHE.select(
        hasEnough,
        FHE.sub(_balances[from], amount),
        _balances[from]  // no change if insufficient
    );

    // Step 3: Conditionally credit to recipient
    _balances[to] = FHE.select(
        hasEnough,
        FHE.add(_balances[to], amount),
        _balances[to]  // no change if insufficient
    );

    // Step 4: Set ACL for new sender balance
    FHE.allowThis(_balances[from]);
    FHE.allow(_balances[from], from);

    // Step 5: Set ACL for new recipient balance
    FHE.allowThis(_balances[to]);
    FHE.allow(_balances[to], to);
}`}
        lang="solidity"
        filename="safe-transfer-pattern.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Pattern 2: Initialization Checks
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Encrypted variables default to an uninitialized state (not zero). Before
        performing operations on an encrypted variable, you should verify it has
        been properly initialized using{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.isInitialized
        </code>
        . This is especially important for mapping values that may not have been
        set yet.
      </p>

      <CodeBlock
        code={`// Initialization Check Pattern

// In constructor: initialize known state
constructor() {
    _totalSupply = FHE.asEuint64(0);
    FHE.allowThis(_totalSupply);
}

// In functions: check before operating
function getBalance(address user) external view returns (euint64) {
    require(
        FHE.isInitialized(_balances[user]),
        "Balance not initialized"
    );
    return _balances[user];
}

// Safe mint with initialization handling
function mint(
    externalEuint64 calldata encAmount,
    bytes calldata inputProof
) external {
    euint64 amount = FHE.fromExternal(encAmount, inputProof);

    // If balance not initialized, treat as zero
    if (!FHE.isInitialized(_balances[msg.sender])) {
        _balances[msg.sender] = amount;
    } else {
        _balances[msg.sender] = FHE.add(
            _balances[msg.sender], amount
        );
    }
    FHE.allowThis(_balances[msg.sender]);
    FHE.allow(_balances[msg.sender], msg.sender);
}`}
        lang="solidity"
        filename="initialization-pattern.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The 5 Defensive Programming Rules
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Every FHEVM contract you write should follow these five rules. They
        prevent the vast majority of bugs and security issues in confidential
        smart contracts.
      </p>

      <CalloutBox type="tip" title="The 5 Defensive Programming Rules for FHEVM">
        <ol className="mt-2 ml-4 list-decimal space-y-2">
          <li>
            <strong>Always check initialization</strong> before operating on
            encrypted variables. Use{" "}
            <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
              FHE.isInitialized()
            </code>{" "}
            for mapping values and constructor-init for known state.
          </li>
          <li>
            <strong>Always use FHE.select</strong> for conditional logic on
            encrypted values. Never attempt{" "}
            <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
              if(ebool)
            </code>{" "}
            -- it will not compile.
          </li>
          <li>
            <strong>Always set ACL after every state change.</strong> Call{" "}
            <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
              FHE.allowThis()
            </code>{" "}
            + relevant{" "}
            <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
              FHE.allow()
            </code>{" "}
            for every new ciphertext handle.
          </li>
          <li>
            <strong>Use the smallest encrypted type possible.</strong> Gas costs
            scale dramatically with type size. euint8 for small values, euint64
            for token amounts.
          </li>
          <li>
            <strong>Minimize FHE operations per transaction.</strong> Each FHE
            operation is expensive. Batch work, avoid redundant computations,
            and prefer fewer operations over more readable code when gas is
            critical.
          </li>
        </ol>
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Putting It All Together
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is a summary of how all Week 2 concepts combine in a real
        contract. Every line in this pattern references a specific lesson:
      </p>

      <CodeBlock
        code={`// Complete Week 2 Pattern Summary
// ─────────────────────────────────────────────────────

// Lesson 2.1: Choose the right encrypted type
euint64 private _balance;         // euint64 for token amounts

// Lesson 2.2: Use FHE operations, not native operators
_balance = FHE.add(_balance, amount);  // not: _balance += amount

// Lesson 2.2: Use FHE.select, not if/else
ebool ok = FHE.ge(_balance, cost);
_balance = FHE.select(ok,
    FHE.sub(_balance, cost),       // if sufficient
    _balance                        // if insufficient
);

// Lesson 2.3: Validate encrypted inputs
euint64 val = FHE.fromExternal(encVal, inputProof);

// Lesson 2.4: Set ACL after every mutation
FHE.allowThis(_balance);           // contract can use it
FHE.allow(_balance, msg.sender);   // user can decrypt it

// Lesson 2.5: Check initialization
require(FHE.isInitialized(_balance), "Not initialized");`}
        lang="solidity"
        filename="week-2-summary.sol"
      />

      <Quiz
        question={{
          id: "2.5-q1",
          question:
            "How does FHE.select prevent overflow in a transfer function?",
          options: [
            "It reverts the transaction if the balance is insufficient",
            "It checks the balance and only applies the subtraction if sufficient -- otherwise returns the original balance unchanged",
            "It automatically clamps the transfer amount to the available balance",
            "It uses a try/catch block to handle the overflow error",
          ],
          correctIndex: 1,
          explanation:
            "FHE.select(hasEnough, FHE.sub(balance, amount), balance) computes both branches but returns only the appropriate one. If hasEnough is true, the subtraction result is used. If false, the original balance is returned unchanged -- no subtraction occurs, preventing underflow.",
        }}
      />

      <Quiz
        question={{
          id: "2.5-q2",
          question:
            "Given the safe transfer pattern, what happens when a user tries to transfer more tokens than they have?",
          options: [
            "The transaction reverts with an error message",
            "The sender's balance goes negative (underflow)",
            "Both sender and recipient balances remain unchanged -- the transfer silently fails",
            "The transfer amount is automatically reduced to the sender's balance",
          ],
          correctIndex: 2,
          explanation:
            "Because FHE.select returns the original balance when hasEnough is false, neither the sender's nor the recipient's balance changes. The transaction succeeds (does not revert) but has no effect. This is by design -- reverting would leak information about the encrypted balance.",
        }}
      />

      <Quiz
        question={{
          id: "2.5-q3",
          question:
            "Why is FHE.isInitialized() important for mapping values?",
          options: [
            "It prevents gas estimation errors",
            "Uninitialized encrypted variables are not zero -- operating on them can cause undefined behavior",
            "It is required by the Solidity compiler for encrypted types",
            "It improves the gas efficiency of subsequent operations",
          ],
          correctIndex: 1,
          explanation:
            "Unlike Solidity where uninitialized uint values default to 0, encrypted variables in FHEVM default to an uninitialized state. Performing FHE operations on uninitialized handles can produce unexpected results. FHE.isInitialized() lets you check whether a handle has been properly set before using it.",
        }}
      />

      <InstructorNotes>
        <p>
          This is a consolidation lesson. By the end, students should be able to
          write a complete safe transfer function from memory. Recommended
          exercises:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>Memory exercise:</strong> Close all references. Ask students
            to write the safe transfer pattern from scratch, including all ACL
            calls. Compare with the reference.
          </li>
          <li>
            <strong>Bug hunt:</strong> Present 3 contracts with subtle ACL or
            overflow bugs. Students identify and fix each one.
          </li>
          <li>
            Emphasize that the silent failure of insufficient-balance transfers
            is a <strong>feature, not a bug</strong>. Reverting on encrypted
            conditions would leak information about the hidden balances.
          </li>
          <li>
            The 5 rules should become a mental checklist. After every line that
            modifies encrypted state: &quot;Did I allowThis? Did I allow the
            owner?&quot;
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
