import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson2_4Meta = {
  learningObjective:
    "Master the FHEVM ACL system -- the most critical concept for building secure confidential smart contracts.",
}

export function Lesson2_4Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        In standard Solidity, all data stored on-chain is publicly readable by
        anyone. In FHEVM, data is encrypted -- but encryption alone is not
        enough. You need a system to control{" "}
        <strong>who can use and who can decrypt</strong> each encrypted value.
        This is what the <strong>Access Control List (ACL)</strong> system does.
        Every ciphertext in FHEVM has an ACL that tracks which addresses have
        permission to operate on it. Getting ACL right is the difference
        between a working FHEVM contract and one that silently fails.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Core Concept: Every Ciphertext Has an ACL
      </h2>

      <p className="text-text-secondary leading-relaxed">
        When an FHE operation creates a new ciphertext handle (e.g.,{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.add(a, b)
        </code>{" "}
        returns a new handle), that handle starts with an{" "}
        <strong>empty ACL</strong>. No one -- not even the contract itself --
        has permission to use it in future transactions. You must explicitly
        grant permissions using{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.allowThis
        </code>{" "}
        and{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.allow
        </code>
        .
      </p>

      <CodeBlock
        code={`// ACL Permission Functions
//
// FHE.allowThis(handle)
//   Grant the current contract access to this ciphertext.
//   MUST be called after every state mutation.
//   Without this, the contract cannot use the value
//   in the next transaction.
//
// FHE.allow(handle, address)
//   Grant a specific address permanent access.
//   Typically used to let the caller decrypt their data.
//   Permission persists across transactions.
//
// FHE.allowTransient(handle, address)
//   Grant temporary access (current transaction only).
//   Useful for cross-contract calls within the same tx.`}
        lang="solidity"
        filename="acl-functions.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Token Transfer: Complete ACL Flow
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The token transfer pattern is where ACL becomes critical. In standard
        Solidity, you simply update two balance mappings. In FHEVM, every new
        ciphertext handle produced by the balance updates needs ACL permissions
        for both the contract (to use the balance later) and the respective
        owner (to decrypt and view their balance).
      </p>

      <CodeDiff
        solidity={`// Standard ERC-20 Transfer
// No ACL needed -- data is public
function transfer(
    address to,
    uint256 amount
) external returns (bool) {
    require(
        balances[msg.sender] >= amount,
        "Insufficient balance"
    );
    balances[msg.sender] -= amount;
    balances[to] += amount;
    return true;
    // Anyone can read both balances
}`}
        fhevm={`// Confidential Transfer with ACL
// Every new handle needs permissions
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
    // Update sender balance
    _balances[msg.sender] = FHE.select(
        hasEnough,
        FHE.sub(_balances[msg.sender], amount),
        _balances[msg.sender]
    );
    // ACL for sender's new balance
    FHE.allowThis(_balances[msg.sender]);
    FHE.allow(
        _balances[msg.sender], msg.sender
    );
    // Update recipient balance
    _balances[to] = FHE.select(
        hasEnough,
        FHE.add(_balances[to], amount),
        _balances[to]
    );
    // ACL for recipient's new balance
    FHE.allowThis(_balances[to]);
    FHE.allow(_balances[to], to);
}`}
        solidityFilename="ERC20.sol"
        fhevmFilename="ConfidentialERC20.sol"
        highlightLines={[21, 22, 23, 24, 31, 32]}
      />

      <CalloutBox type="warning" title="Forgetting FHE.allowThis = Contract Loses Access">
        If you update an encrypted state variable (e.g.,{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          _balances[msg.sender] = FHE.sub(...)
        </code>
        ) but forget to call{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.allowThis(_balances[msg.sender])
        </code>
        , the contract will not be able to read or operate on that balance in
        the next transaction. The value is still stored encrypted on-chain, but
        the contract has no permission to use it -- effectively making it
        permanently inaccessible.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Multi-Party Permission: Escrow Contract
      </h2>

      <p className="text-text-secondary leading-relaxed">
        In scenarios where multiple parties need access to the same encrypted
        data, you grant{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.allow
        </code>{" "}
        to each party. In this escrow example, both the buyer and the seller
        need to see the escrowed amount.
      </p>

      <CodeDiff
        solidity={`// Standard Escrow: data is public
contract Escrow {
    uint64 public amount;
    address public buyer;
    address public seller;

    function deposit(uint64 amt) external {
        amount = amt;
        // Both parties can read 'amount'
        // because it is public
    }

    function release() external {
        payable(seller).transfer(amount);
    }
}`}
        fhevm={`// Confidential Escrow: ACL controls
contract FHEEscrow
    is ZamaEthereumConfig
{
    euint64 private _amount;
    address public buyer;
    address public seller;

    function deposit(
        externalEuint64 calldata encAmt,
        bytes calldata inputProof
    ) external {
        _amount = FHE.fromExternal(
            encAmt, inputProof
        );
        // Contract can use the amount
        FHE.allowThis(_amount);
        // Buyer can verify their deposit
        FHE.allow(_amount, buyer);
        // Seller can see what is escrowed
        FHE.allow(_amount, seller);
    }
}`}
        solidityFilename="Escrow.sol"
        fhevmFilename="FHEEscrow.sol"
        highlightLines={[17, 19, 21]}
      />

      <CalloutBox type="mistake" title="Old Handle Permissions Do NOT Transfer to New Handles">
        When you perform an FHE operation like{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          _balance = FHE.add(_balance, amount)
        </code>
        , the result is a <strong>new ciphertext handle</strong>. The old
        handle&apos;s permissions are gone. You must re-grant permissions on the
        new handle. This is the most common source of ACL bugs -- developers
        assume permissions carry over, but they do not.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Complete ACL Function Reference
      </h2>

      <CodeBlock
        code={`// FHE ACL Functions -- Complete Reference

// 1. Grant contract access (REQUIRED after every mutation)
FHE.allowThis(handle);

// 2. Grant permanent access to a specific address
FHE.allow(handle, address);

// 3. Grant temporary access (current tx only)
FHE.allowTransient(handle, address);

// 4. Mark for public decryption (anyone can decrypt)
FHE.makePubliclyDecryptable(handle);

// Method chaining syntax (with "using FHE for *;")
handle.allowThis().allow(msg.sender);
handle.allow(buyer).allow(seller);`}
        lang="solidity"
        filename="acl-reference.sol"
      />

      <Quiz
        question={{
          id: "2.4-q1",
          question:
            "What happens if you forget to call FHE.allowThis() after updating an encrypted state variable?",
          options: [
            "The transaction reverts immediately",
            "The value is automatically set to zero",
            "The contract cannot access the value in future transactions -- it becomes effectively locked",
            "Nothing -- FHE.allowThis is optional",
          ],
          correctIndex: 2,
          explanation:
            "Without FHE.allowThis(), the contract loses permission to operate on the new ciphertext handle. The value is still stored on-chain, but the contract cannot read, compute on, or transfer it in subsequent transactions. This is effectively a permanent lock-out.",
        }}
      />

      <Quiz
        question={{
          id: "2.4-q2",
          question:
            "In a transfer function, after computing: _balances[to] = FHE.add(_balances[to], amount), which ACL calls are needed?",
          options: [
            "Only FHE.allowThis(_balances[to]) -- the recipient already had access",
            "Only FHE.allow(_balances[to], to) -- the contract can always access its own storage",
            "Both FHE.allowThis(_balances[to]) and FHE.allow(_balances[to], to) -- the new handle has an empty ACL",
            "No ACL calls needed -- FHE.add preserves the existing permissions",
          ],
          correctIndex: 2,
          explanation:
            "FHE.add creates a NEW ciphertext handle with an EMPTY ACL. The old handle's permissions do not transfer. You must call FHE.allowThis() so the contract can use the balance in future operations, and FHE.allow(handle, to) so the recipient can decrypt and view their balance.",
        }}
      />

      <Quiz
        question={{
          id: "2.4-q3",
          question:
            "When should you use FHE.allow(handle, address) versus FHE.allowThis(handle)?",
          options: [
            "FHE.allow is for read access, FHE.allowThis is for write access",
            "FHE.allowThis grants the contract itself permission; FHE.allow grants a specific external address permission",
            "FHE.allow is permanent, FHE.allowThis is temporary",
            "They are interchangeable -- use either one",
          ],
          correctIndex: 1,
          explanation:
            "FHE.allowThis(handle) grants the current contract permission to use the ciphertext in future operations. FHE.allow(handle, address) grants a specific external address (like a user) permission to decrypt or use the ciphertext. Both are permanent. You almost always need both after a state mutation.",
        }}
      />

      <InstructorNotes>
        <p>
          <strong>ACL is the #1 source of bugs in FHEVM contracts.</strong>{" "}
          Dedicate extra time to this lesson. Here is a recommended interactive
          exercise:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            Draw a table with 3 columns:{" "}
            <strong>Ciphertext Handle | Contract Can Use? | User Can Decrypt?</strong>
          </li>
          <li>
            Walk through a{" "}
            <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
              transfer()
            </code>{" "}
            function step by step:
          </li>
          <li className="ml-4">
            Step 1: FHE.fromExternal creates amount handle &rarr; empty ACL
          </li>
          <li className="ml-4">
            Step 2: FHE.sub creates new sender balance &rarr; empty ACL
          </li>
          <li className="ml-4">
            Step 3: FHE.allowThis(senderBal) &rarr; contract: YES
          </li>
          <li className="ml-4">
            Step 4: FHE.allow(senderBal, sender) &rarr; sender: YES
          </li>
          <li className="ml-4">
            Step 5: FHE.add creates new recipient balance &rarr; empty ACL
          </li>
          <li className="ml-4">
            Step 6: FHE.allowThis(recipientBal) &rarr; contract: YES
          </li>
          <li className="ml-4">
            Step 7: FHE.allow(recipientBal, recipient) &rarr; recipient: YES
          </li>
          <li>
            Have students deliberately omit one allow call and predict what
            breaks.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
