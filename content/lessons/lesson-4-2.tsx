import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson4_2Meta = {
  learningObjective:
    "Conduct security reviews of FHEVM contracts using a comprehensive audit checklist and identify common vulnerability patterns.",
}

export function Lesson4_2Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        Security in FHEVM contracts requires a different mindset than standard
        Solidity. Beyond the usual reentrancy and access control concerns, FHE
        introduces new vulnerability categories: missing ACL permissions, leaky
        events, side-channel attacks through transaction patterns, and
        uninitialized encrypted variables. This lesson provides a comprehensive
        security checklist for auditing FHEVM contracts.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        FHEVM Security Checklist
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Use this checklist when reviewing any FHEVM contract. Each item
        addresses a category of vulnerability specific to encrypted computation:
      </p>

      <CodeBlock
        code={`// FHEVM Security Audit Checklist
// ================================

// 1. ACL on EVERY state change
//    After every operation that creates a new ciphertext handle,
//    call FHE.allowThis() and FHE.allow() for authorized parties.
//    Missing ACL = contract loses access to its own data.

// 2. Overflow protection with FHE.select
//    You CANNOT use require() on encrypted values.
//    Use FHE.ge() + FHE.select() to guard against underflow/overflow.
//    Example: deduct only if balance >= amount.

// 3. FHE.isInitialized() checks
//    Encrypted variables default to an uninitialized handle (not zero).
//    Operating on uninitialized handles causes undefined behavior.
//    Always check FHE.isInitialized() before first use.

// 4. Proper externalEuint usage
//    User inputs MUST use externalEuintXX + FHE.fromExternal().
//    This validates the ZKPoK proving the user knows the plaintext.
//    Skipping this allows malicious ciphertext injection.

// 5. Secure decryption handling
//    Only decrypt what is absolutely necessary.
//    Use FHE.makePubliclyDecryptable() only for data meant to be public.
//    Verify decryption proofs with FHE.checkSignatures().

// 6. No sensitive data in events or revert strings
//    Encrypted handles in events are visible -- they leak metadata.
//    Transaction patterns around events reveal timing information.
//    Revert strings should not mention encrypted values.`}
        lang="solidity"
        filename="security-checklist.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Insecure vs Secure Contract
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The following comparison shows a contract with multiple security
        vulnerabilities alongside its corrected version:
      </p>

      <CodeDiff
        solidity={`// INSECURE: Multiple Vulnerabilities
contract InsecureVault
    is ZamaEthereumConfig
{
    mapping(address => euint64) balances;

    // NO overflow protection!
    function withdraw(
        externalEuint64 calldata amt,
        bytes calldata proof
    ) external {
        euint64 a = FHE.fromExternal(
            amt, proof
        );
        // Deducts even if insufficient
        balances[msg.sender] =
            FHE.sub(balances[msg.sender], a);
        // MISSING: FHE.allowThis!
        // Leaks handle in event!
        emit Withdrawal(msg.sender, a);
    }

    // BAD: emits encrypted handle
    event Withdrawal(
        address user,
        euint64 amount
    );
}`}
        fhevm={`// SECURE: All Checks In Place
contract SecureVault
    is ZamaEthereumConfig
{
    mapping(address => euint64) balances;

    function withdraw(
        externalEuint64 calldata amt,
        bytes calldata proof
    ) external {
        euint64 a = FHE.fromExternal(
            amt, proof
        );
        // Overflow protection
        ebool hasEnough = FHE.ge(
            balances[msg.sender], a
        );
        balances[msg.sender] =
            FHE.select(
                hasEnough,
                FHE.sub(
                    balances[msg.sender], a
                ),
                balances[msg.sender]
            );
        // ACL: contract + user access
        FHE.allowThis(
            balances[msg.sender]
        );
        FHE.allow(
            balances[msg.sender],
            msg.sender
        );
        // Safe event: no encrypted data
        emit Withdrawal(msg.sender);
    }
    // SAFE: no encrypted data in event
    event Withdrawal(address user);
}`}
        solidityFilename="InsecureVault.sol"
        fhevmFilename="SecureVault.sol"
        highlightLines={[15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]}
      />

      <CalloutBox type="mistake" title="Emitting Events with Encrypted Values">
        Emitting events with encrypted values is dangerous. The ciphertext
        handle is visible on-chain, and transaction patterns (when withdrawals
        happen, how frequently, from which addresses) reveal information even if
        the amounts are encrypted. Never include encrypted handles in events.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Side-Channel Considerations
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Even with perfectly encrypted data, metadata leaks information. These
        side-channel attacks do not break FHE encryption directly, but they
        reduce the effective privacy:
      </p>

      <CalloutBox type="warning" title="Side-Channel: Transaction Patterns Reveal Information">
        Even if data is encrypted, transaction frequency, gas usage patterns,
        and timing can reveal information. For example: if a user always
        withdraws right after a large deposit event, an observer can correlate
        the actions. If gas varies significantly between code paths, the gas
        cost itself reveals which branch was taken. Design contracts to minimize
        observable differences between code paths.
      </CalloutBox>

      <CodeBlock
        code={`// Side-Channel Mitigation Strategies
// ====================================

// 1. CONSTANT-TIME PATTERNS
//    FHE.select executes both branches -- this is actually a feature!
//    Both paths always run, so gas is constant regardless of condition.
//    Use FHE.select instead of if/else for encrypted conditions.

// 2. AVOID CONDITIONAL EVENTS
//    Bad:  if (decryptedCondition) { emit HighValue(); }
//    Good: Always emit the same event structure.

// 3. BATCH TRANSACTIONS
//    Process multiple operations in one tx to obscure individual actions.
//    A transfer of 1 token looks the same as 1000 tokens.

// 4. UNIFORM FUNCTION SIGNATURES
//    Don't create separate functions for different value ranges.
//    One function for all cases -- the encrypted computation handles the rest.`}
        lang="solidity"
        filename="side-channels.sol"
      />

      <Quiz
        question={{
          id: "4.2-q1",
          question:
            "Why is emitting events with encrypted data dangerous in an FHEVM contract?",
          options: [
            "Events cannot contain encrypted types",
            "The ciphertext handle is visible, and transaction patterns around events reveal timing information that reduces privacy",
            "Events decrypt the data automatically",
            "It causes the transaction to revert",
          ],
          correctIndex: 1,
          explanation:
            "While the actual encrypted value cannot be read from the event, the ciphertext handle is visible on-chain. More importantly, the pattern of when events are emitted, from which addresses, and how frequently creates metadata that an observer can analyze to infer information about the encrypted values.",
        }}
      />

      <Quiz
        question={{
          id: "4.2-q2",
          question:
            "Given this contract, identify all security issues:\n\ncontract Token is ZamaEthereumConfig {\n    mapping(address => euint64) balances;\n    function transfer(address to, externalEuint64 calldata amt, bytes calldata proof) external {\n        euint64 a = FHE.fromExternal(amt, proof);\n        balances[msg.sender] = FHE.sub(balances[msg.sender], a);\n        balances[to] = FHE.add(balances[to], a);\n        emit Transfer(msg.sender, to, a);\n    }\n    event Transfer(address from, address to, euint64 amount);\n}",
          options: [
            "The only issue is the missing constructor",
            "Missing FHE.isInitialized check only",
            "Missing overflow protection (FHE.ge + FHE.select), missing ACL (FHE.allowThis + FHE.allow) on both balances, and encrypted handle leaked in Transfer event",
            "The contract is secure -- all FHE operations are correct",
          ],
          correctIndex: 2,
          explanation:
            "Three security issues: (1) No overflow protection -- FHE.sub will underflow if sender has insufficient balance. Must use FHE.ge + FHE.select guard. (2) Missing ACL -- neither FHE.allowThis nor FHE.allow is called after updating balances, so the contract and users lose access. (3) The Transfer event includes an encrypted handle (euint64 amount), leaking metadata.",
        }}
      />

      <Quiz
        question={{
          id: "4.2-q3",
          question: "What does FHE.isInitialized() prevent?",
          options: [
            "It prevents the contract from being deployed twice",
            "It prevents operations on uninitialized encrypted handles, which would cause undefined behavior",
            "It checks if the FHE library is installed correctly",
            "It verifies that the user has a valid wallet connection",
          ],
          correctIndex: 1,
          explanation:
            "Encrypted state variables start as uninitialized handles (not zero). Performing FHE operations on uninitialized handles leads to undefined behavior. FHE.isInitialized() checks whether a handle has been assigned a value, allowing you to guard against operating on unset variables.",
        }}
      />

      <InstructorNotes>
        <p>
          Frame this as a real audit exercise. Have students review each
          other&apos;s Week 2 homework (confidential ERC-20) for security
          issues.
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            Create a peer review session: each student audits another
            student&apos;s ERC-20 token using the security checklist above.
          </li>
          <li>
            Most common issues found: missing FHE.allowThis after updates,
            no overflow protection on transfer, encrypted handles in events.
          </li>
          <li>
            Discuss the philosophical difference: in standard Solidity, data is
            public so security is about access control and logic correctness. In
            FHEVM, security also includes metadata leakage and side-channels --
            the attack surface is fundamentally different.
          </li>
          <li>
            Side-channels are advanced material. Ensure students understand the
            basics (ACL, overflow, events) before diving into timing attacks.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
