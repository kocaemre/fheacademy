import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson3_2Meta = {
  learningObjective:
    "Implement complex business logic using encrypted branching with FHE.select, including nested conditions and multi-path selection.",
}

export function Lesson3_2Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        In Lesson 2.2 we introduced{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        as the replacement for{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          if/else
        </code>
        . Now we go deeper: chaining multiple{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        calls to implement tiered pricing, nested conditions, and conditional
        execution without reverting. These patterns are the backbone of every
        real-world FHEVM dApp.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Tiered Pricing with Chained FHE.select
      </h2>

      <p className="text-text-secondary leading-relaxed">
        In standard Solidity, tiered pricing uses{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          if/else if/else
        </code>{" "}
        chains. In FHEVM, we chain{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        calls -- each one narrows the range. The key insight is that all
        branches are always evaluated, so every possible outcome is computed
        regardless of which path is taken.
      </p>

      <CodeDiff
        solidity={`// Standard Solidity Tiered Pricing
function getDiscount(uint64 amount)
    external pure returns (uint64)
{
    if (amount >= 1000) {
        return amount * 80 / 100;
        // 20% discount
    } else if (amount >= 500) {
        return amount * 90 / 100;
        // 10% discount
    } else {
        return amount;
        // no discount
    }
}`}
        fhevm={`// FHEVM Chained FHE.select
function getDiscount(euint64 amount)
    internal returns (euint64)
{
    ebool isLarge = FHE.ge(
        amount, FHE.asEuint64(1000)
    );
    ebool isMedium = FHE.ge(
        amount, FHE.asEuint64(500)
    );
    euint64 tier1 = FHE.div(
        FHE.mul(amount, FHE.asEuint64(80)),
        100
    );
    euint64 tier2 = FHE.div(
        FHE.mul(amount, FHE.asEuint64(90)),
        100
    );
    // Chain: large -> medium -> base
    euint64 result = FHE.select(
        isLarge, tier1,
        FHE.select(isMedium, tier2, amount)
    );
    return result;
}`}
        solidityFilename="TieredPricing.sol"
        fhevmFilename="FHETieredPricing.sol"
        highlightLines={[5, 6, 8, 9, 11, 12, 13, 15, 16, 17, 20, 21, 22]}
      />

      <CalloutBox type="tip" title="Think Multiplexer, Not If/Else">
        Think of{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        as a hardware multiplexer: it picks one of two pre-computed values based
        on a selector signal. Both inputs are always fully computed before the
        selection happens. There is no short-circuit evaluation -- both branches
        cost gas regardless of which path is taken.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Replacing require() Guards
      </h2>

      <p className="text-text-secondary leading-relaxed">
        In standard Solidity,{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          require()
        </code>{" "}
        guards revert the transaction when a condition fails. In FHEVM, we
        cannot evaluate encrypted conditions in{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          require()
        </code>{" "}
        because the condition is an{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ebool
        </code>
        . Instead, we use{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        to make the operation a no-op when the condition fails:
      </p>

      <CodeDiff
        solidity={`// Standard Solidity Guard
function transfer(
    address to,
    uint64 amount
) external {
    require(
        balances[msg.sender] >= amount,
        "Insufficient balance"
    );
    balances[msg.sender] -= amount;
    balances[to] += amount;
}`}
        fhevm={`// FHEVM Select Guard (no revert)
function transfer(
    address to,
    euint64 amount
) internal {
    ebool hasEnough = FHE.ge(
        _balances[msg.sender], amount
    );
    // If insufficient: balances unchanged
    euint64 newSender = FHE.select(
        hasEnough,
        FHE.sub(_balances[msg.sender], amount),
        _balances[msg.sender]
    );
    euint64 newRecipient = FHE.select(
        hasEnough,
        FHE.add(_balances[to], amount),
        _balances[to]
    );
    _balances[msg.sender] = newSender;
    _balances[to] = newRecipient;
    FHE.allowThis(newSender);
    FHE.allow(newSender, msg.sender);
    FHE.allowThis(newRecipient);
    FHE.allow(newRecipient, to);
}`}
        solidityFilename="GuardTransfer.sol"
        fhevmFilename="FHEGuardTransfer.sol"
        highlightLines={[6, 7, 10, 11, 12, 13, 15, 16, 17, 18, 22, 23, 24, 25]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Complete Conditional Transfer Pattern
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is the complete conditional transfer pattern that combines input
        validation, balance checking, and ACL management. This is the canonical
        pattern you will use in every token contract:
      </p>

      <CodeBlock
        code={`// Complete conditional transfer with encrypted input
function transfer(
    address to,
    externalEuint64 calldata encAmount,
    bytes calldata inputProof
) external {
    euint64 amount = FHE.fromExternal(encAmount, inputProof);

    // Check: does sender have enough?
    ebool hasEnough = FHE.ge(_balances[msg.sender], amount);

    // Conditional update: if insufficient, balances stay the same
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

    // ACL: contract + each party
    FHE.allowThis(_balances[msg.sender]);
    FHE.allow(_balances[msg.sender], msg.sender);
    FHE.allowThis(_balances[to]);
    FHE.allow(_balances[to], to);
}`}
        lang="solidity"
        filename="ConditionalTransfer.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Min/Max Clamping
      </h2>

      <p className="text-text-secondary leading-relaxed">
        FHEVM provides{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.min
        </code>{" "}
        and{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.max
        </code>{" "}
        as shortcuts for common clamping patterns. Instead of writing a{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        with a comparison, you can use these directly:
      </p>

      <CodeBlock
        code={`// Clamping patterns
// Cap a value at a maximum (e.g., max withdrawal of 1000)
euint64 capped = FHE.min(requestedAmount, FHE.asEuint64(1000));

// Ensure a minimum value (e.g., minimum bid of 100)
euint64 floored = FHE.max(bidAmount, FHE.asEuint64(100));

// Equivalent FHE.select (what FHE.min does internally):
// ebool isOverMax = FHE.gt(requestedAmount, FHE.asEuint64(1000));
// euint64 capped = FHE.select(isOverMax, FHE.asEuint64(1000), requestedAmount);`}
        lang="solidity"
        filename="MinMaxClamping.sol"
      />

      <CalloutBox type="tip" title="Performance: Both Branches Always Computed">
        Because both branches of{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        are always evaluated, gas cost is the sum of both branches plus the
        select operation itself. When designing deeply nested selects, be aware
        that each level doubles the number of computed expressions. Keep nesting
        depth to 3-4 levels maximum.
      </CalloutBox>

      <Quiz
        question={{
          id: "3.2-q1",
          question:
            "Why are both branches of FHE.select always computed?",
          options: [
            "It is a Solidity compiler optimization for gas savings",
            "Because the condition is encrypted -- the contract cannot know which branch to skip",
            "To prevent reentrancy attacks",
            "Because FHEVM does not support lazy evaluation syntax",
          ],
          correctIndex: 1,
          explanation:
            "Since the condition (ebool) is encrypted, the contract has no way to know which branch is 'true' at execution time. Both branches must be fully computed, and FHE.select picks the correct result based on the encrypted condition. This is fundamentally different from if/else, which can skip one branch.",
        }}
      />

      <Quiz
        question={{
          id: "3.2-q2",
          question:
            "Given nested FHE.select: FHE.select(isLarge, tier1, FHE.select(isMedium, tier2, amount)). If isLarge=true and isMedium=false, what is returned?",
          options: [
            "amount (the base price)",
            "tier2 (the medium discount)",
            "tier1 (the large discount)",
            "An error because nested select is not supported",
          ],
          correctIndex: 2,
          explanation:
            "When isLarge is true, the outer FHE.select returns tier1 regardless of the inner select's result. The inner FHE.select (which would return 'amount' since isMedium is false) is still computed but its result is not used. tier1 is the correct answer.",
        }}
      />

      <Quiz
        question={{
          id: "3.2-q3",
          question:
            "How does FHE.select replace require() guards in FHEVM?",
          options: [
            "FHE.select reverts the transaction when the condition is false",
            "FHE.select skips the function body when the condition is false",
            "FHE.select makes the operation a no-op by returning the original value when the condition fails",
            "FHE.select throws an encrypted error message",
          ],
          correctIndex: 2,
          explanation:
            "Instead of reverting (which would leak information about the encrypted condition), FHE.select returns the original unchanged value when the condition is false. For example, if a transfer fails the balance check, FHE.select returns the original balance -- making the operation a silent no-op rather than a revert.",
        }}
      />

      <InstructorNotes>
        <p>
          This is the most important programming pattern shift in the entire
          curriculum. Key teaching points:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            Students coming from Solidity instinctively reach for{" "}
            <code className="text-sm">if/else</code>. The hardest mental shift
            is accepting that both branches always execute.
          </li>
          <li>
            <strong>Exercise:</strong> Give students a standard Solidity function
            with 3 tiers of logic and have them convert it to chained
            FHE.select. Common mistake: forgetting that the inner select is
            always evaluated.
          </li>
          <li>
            The require() replacement is subtle -- the transaction does not
            revert, it silently does nothing. This is intentional: reverting
            would reveal information about the encrypted condition (e.g.,
            &quot;insufficient balance&quot; confirms the balance is below the transfer
            amount).
          </li>
          <li>
            Performance warning: each level of nesting doubles computations.
            Real-world contracts rarely need more than 3-4 levels.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
