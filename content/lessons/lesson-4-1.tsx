import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson4_1Meta = {
  learningObjective:
    "Understand FHE operation costs relative to standard EVM operations and apply optimization strategies to reduce gas consumption.",
}

export function Lesson4_1Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        FHE operations are <strong>significantly more expensive</strong> than
        standard Solidity operations. A single{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.add
        </code>{" "}
        on encrypted values costs orders of magnitude more gas than a standard{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          +
        </code>{" "}
        on plaintext. This lesson covers the cost hierarchy across encrypted
        types and operations, and teaches you strategies to minimize gas
        consumption in production FHEVM contracts.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Gas Cost Hierarchy
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Gas costs in FHEVM scale with two factors: the <strong>type size</strong>{" "}
        (smaller types are cheaper) and the <strong>operation complexity</strong>{" "}
        (addition is cheaper than multiplication). Here is the relative cost
        reference:
      </p>

      <CodeBlock
        code={`// Relative Gas Cost Reference (approximate)
// ============================================

// By Type (cheapest to most expensive):
// ebool    -- cheapest (smallest ciphertext)
// euint8   -- very low
// euint16  -- low
// euint32  -- moderate (good default)
// euint64  -- higher (use for token amounts)
// euint128 -- high
// euint256 -- highest (avoid unless necessary)

// By Operation (cheapest to most expensive):
// FHE.not          -- cheapest (unary bitwise)
// FHE.and/or/xor   -- low (bitwise)
// FHE.add/sub      -- moderate
// FHE.eq/ne/lt/gt  -- moderate (comparison)
// FHE.select       -- moderate-high (encrypted ternary)
// FHE.mul          -- expensive (encrypted multiply)
// FHE.div/rem      -- expensive (plaintext divisor only)
// FHE.shl/shr      -- moderate-high (shift)

// Combined effect example:
// FHE.add(euint8, euint8)   ~= base cost
// FHE.add(euint64, euint64) ~= 4-8x base cost
// FHE.mul(euint64, euint64) ~= 16-32x base cost`}
        lang="solidity"
        filename="gas-cost-reference.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Optimization Strategy: Use Plaintext Operands
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The most impactful optimization is using <strong>plaintext</strong>{" "}
        operands wherever possible. Most FHE operations accept a mix of
        encrypted and plaintext arguments. When one operand is a known constant,
        pass it as plaintext instead of encrypting it first.
      </p>

      <CalloutBox type="tip" title="Use Plaintext Constants">
        Use plaintext constants where possible --{" "}
        <code className="text-sm font-mono">FHE.add(encrypted, 1)</code> is
        cheaper than{" "}
        <code className="text-sm font-mono">
          FHE.add(encrypted, FHE.asEuint32(1))
        </code>
        . The plaintext operand avoids creating and operating on an unnecessary
        ciphertext.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Unoptimized vs Optimized Contract
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Let us see these optimization strategies applied to a real contract. The
        unoptimized version uses the largest type, redundant operations, and
        encrypts constants unnecessarily:
      </p>

      <CodeDiff
        solidity={`// UNOPTIMIZED: Wasteful FHE Usage
contract BadRewards
    is ZamaEthereumConfig
{
    // Using euint256 -- way too large!
    euint256 private _points;
    euint256 private _bonus;

    function addPoints(
        externalEuint256 calldata pts,
        bytes calldata proof
    ) external {
        euint256 p = FHE.fromExternal(
            pts, proof
        );
        // Encrypts constant unnecessarily
        euint256 one = FHE.asEuint256(1);
        _points = FHE.add(_points, p);
        // Redundant: re-computes bonus
        _bonus = FHE.mul(
            _points, FHE.asEuint256(2)
        );
        FHE.allowThis(_points);
        FHE.allowThis(_bonus);
    }
}`}
        fhevm={`// OPTIMIZED: Efficient FHE Usage
contract GoodRewards
    is ZamaEthereumConfig
{
    // euint32 is sufficient for points
    euint32 private _points;
    euint32 private _bonus;

    function addPoints(
        externalEuint32 calldata pts,
        bytes calldata proof
    ) external {
        euint32 p = FHE.fromExternal(
            pts, proof
        );
        // Plaintext constant -- no extra
        // ciphertext created
        _points = FHE.add(_points, p);
        // Only update bonus when needed
        _bonus = FHE.mul(_points, 2);
        // Plaintext 2 instead of
        // FHE.asEuint32(2)
        FHE.allowThis(_points);
        FHE.allowThis(_bonus);
    }
}`}
        solidityFilename="BadRewards.sol"
        fhevmFilename="GoodRewards.sol"
        highlightLines={[5, 6, 7, 10, 11, 12, 14, 15, 19, 20, 21, 22]}
      />

      <CalloutBox type="warning" title="Every FHE Operation Has Significant Gas Cost">
        Every FHE operation consumes significant gas -- think carefully before
        adding operations. Ask yourself: does this value truly need to be
        encrypted? Can I combine multiple operations into fewer steps? Can I use
        a smaller type? These questions save gas and money.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Optimization Checklist
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Apply these rules when writing production FHEVM contracts:
      </p>

      <CodeBlock
        code={`// FHE Gas Optimization Checklist
// ==============================

// 1. USE THE SMALLEST TYPE THAT FITS
//    Bad:  euint256 for a counter (0-1000)
//    Good: euint16  for a counter (0-1000)

// 2. USE PLAINTEXT OPERANDS FOR CONSTANTS
//    Bad:  FHE.add(balance, FHE.asEuint64(fee))
//    Good: FHE.add(balance, fee)  // fee is uint64

// 3. MINIMIZE THE NUMBER OF FHE OPERATIONS
//    Bad:  temp = FHE.add(a, b); result = FHE.add(temp, c);
//    Consider: Can you restructure logic to use fewer ops?

// 4. ENCRYPT ONLY WHAT NEEDS PRIVACY
//    Bad:  euint32 private _totalUsers; (just a count!)
//    Good: uint256 public totalUsers; (no privacy needed)

// 5. AVOID RE-ENCRYPTION IN LOOPS
//    Bad:  for each user: FHE.asEuint32(amount)
//    Good: euint32 eAmount = FHE.asEuint32(amount); // once
//          then reuse eAmount for all users

// 6. BATCH RELATED OPERATIONS
//    Do all FHE work in one transaction where possible
//    Each transaction has fixed overhead for FHE context`}
        lang="solidity"
        filename="optimization-checklist.sol"
      />

      <Quiz
        question={{
          id: "4.1-q1",
          question:
            "Which encrypted type has the lowest gas cost for FHE operations?",
          options: [
            "euint32 -- it is the default type",
            "euint256 -- it has the most capacity",
            "euint8 -- smaller ciphertexts cost less to operate on",
            "ebool -- it is optimized for boolean logic",
          ],
          correctIndex: 2,
          explanation:
            "Gas costs scale with type size. euint8 has the smallest ciphertext (after ebool, which is limited to boolean values), making all arithmetic and comparison operations on it the cheapest among the integer types.",
        }}
      />

      <Quiz
        question={{
          id: "4.1-q2",
          question:
            "Why is FHE.add(x, 1) cheaper than FHE.add(x, FHE.asEuint32(1))?",
          options: [
            "The number 1 is a special case in FHE",
            "FHE.add with a plaintext operand avoids creating an unnecessary ciphertext, reducing computation",
            "The compiler optimizes small numbers automatically",
            "There is no difference -- they cost the same",
          ],
          correctIndex: 1,
          explanation:
            "When you pass a plaintext operand, the FHE library handles the encryption internally in an optimized way. Calling FHE.asEuint32(1) first creates a separate ciphertext (trivial encryption), which then requires a full encrypted-encrypted addition instead of the cheaper encrypted-plaintext path.",
        }}
      />

      <Quiz
        question={{
          id: "4.1-q3",
          question:
            "Look at this code. What is the gas optimization opportunity?\n\neuint256 private _score;\n\nfunction addScore(uint256 points) external {\n    euint256 enc = FHE.asEuint256(points);\n    _score = FHE.add(_score, enc);\n    FHE.allowThis(_score);\n}",
          options: [
            "The function should be internal instead of external",
            "FHE.allowThis is unnecessary here",
            "Use euint32 instead of euint256 (scores do not need 256-bit range) and pass points as plaintext instead of encrypting it first",
            "The function needs an inputProof parameter",
          ],
          correctIndex: 2,
          explanation:
            "Two optimizations: (1) euint256 is massive overkill for a score -- euint32 handles values up to ~4 billion, which is more than enough. (2) Since points is already a plaintext uint256 parameter, you can pass it directly: FHE.add(_score, points) instead of encrypting it first with FHE.asEuint256.",
        }}
      />

      <InstructorNotes>
        <p>
          Students often over-encrypt. The key insight: encrypt ONLY what needs
          privacy, leave everything else as plaintext.
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            Walk through the gas cost reference table and emphasize the
            multiplicative effect: type size x operation complexity
          </li>
          <li>
            Common mistake: using euint256 for everything because it is the
            &quot;safe&quot; choice. In FHE, safe = expensive. Right-size your
            types.
          </li>
          <li>
            Have students audit their Week 2 homework (confidential ERC-20) for
            optimization opportunities. Can they reduce gas by switching to
            plaintext operands or smaller types?
          </li>
          <li>
            Emphasize that gas optimization is not premature optimization in FHE
            -- it is a requirement. FHE operations can cost 100-1000x standard
            Solidity ops.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
