import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson2_3Meta = {
  learningObjective:
    "Understand the complete encrypted input lifecycle and implement functions that securely accept encrypted user inputs with ZKPoK validation.",
}

export function Lesson2_3Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        When a user interacts with a confidential smart contract, they need to
        send encrypted values as function arguments. But how does the contract
        know the ciphertext is valid? How does it prevent someone from
        replaying another user&apos;s encrypted input? The answer is the{" "}
        <strong>Zero-Knowledge Proof of Knowledge (ZKPoK)</strong> system. In
        this lesson, we will trace the complete lifecycle of an encrypted input
        -- from client-side encryption to on-chain validation.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The Encrypted Input Lifecycle
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Every encrypted input goes through four stages: client-side encryption,
        ZKPoK generation, transaction submission, and on-chain verification.
        Understanding this lifecycle is essential for writing correct FHEVM
        contracts.
      </p>

      <CodeBlock
        code={`// The 4-Stage Encrypted Input Lifecycle
//
// Stage 1: CLIENT encrypts plaintext value
//   User: "I want to send 100 tokens"
//   SDK:  encrypt(100) -> externalEuint64 ciphertext
//
// Stage 2: CLIENT generates ZKPoK (inputProof)
//   SDK:  prove(ciphertext, contractAddress, senderAddress)
//   Proof binds ciphertext to THIS contract and THIS sender
//
// Stage 3: TRANSACTION sent to blockchain
//   calldata: { externalEuint64, bytes inputProof }
//   Both ciphertext and proof travel together
//
// Stage 4: ON-CHAIN verification + conversion
//   FHE.fromExternal(externalEuint64, inputProof)
//   -> Verifies ZKPoK
//   -> Converts to euint64 (on-chain type)
//   -> Ready for FHE operations`}
        lang="solidity"
        filename="lifecycle.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Single Encrypted Input
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The simplest case is a function that accepts one encrypted value. The
        parameter uses an{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          external
        </code>
        -prefixed type (
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          externalEuint64
        </code>
        ), and a companion{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          bytes calldata inputProof
        </code>{" "}
        parameter carries the ZKPoK.
      </p>

      <CodeDiff
        solidity={`// Standard: plaintext parameter
function deposit(
    uint64 amount
) external {
    require(amount > 0, "Zero amount");
    balances[msg.sender] += amount;
}`}
        fhevm={`// FHEVM: encrypted input + ZKPoK
function deposit(
    externalEuint64 calldata encAmount,
    bytes calldata inputProof
) external {
    // Verify proof + convert to euint64
    euint64 amount = FHE.fromExternal(
        encAmount, inputProof
    );
    _balances[msg.sender] = FHE.add(
        _balances[msg.sender], amount
    );
    FHE.allowThis(_balances[msg.sender]);
    FHE.allow(
        _balances[msg.sender], msg.sender
    );
}`}
        solidityFilename="Deposit.sol"
        fhevmFilename="FHEDeposit.sol"
        highlightLines={[3, 4, 7, 8, 9]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Multiple Encrypted Inputs
      </h2>

      <p className="text-text-secondary leading-relaxed">
        When a function needs multiple encrypted parameters, each gets its own{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          externalEuintXX
        </code>{" "}
        parameter, but they all share a <strong>single</strong>{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          inputProof
        </code>
        . The SDK batches all encrypted values into one proof for efficiency.
      </p>

      <CodeDiff
        solidity={`// Standard: multiple plaintext params
function createOrder(
    uint64 price,
    uint32 quantity
) external {
    require(price > 0, "No price");
    require(quantity > 0, "No qty");
    orders[msg.sender] = Order(
        price, quantity
    );
}`}
        fhevm={`// FHEVM: multiple encrypted inputs
// share ONE inputProof
function createOrder(
    externalEuint64 calldata encPrice,
    externalEuint32 calldata encQty,
    bytes calldata inputProof
) external {
    euint64 price = FHE.fromExternal(
        encPrice, inputProof
    );
    euint32 quantity = FHE.fromExternal(
        encQty, inputProof
    );
    _orders[msg.sender] = EncOrder(
        price, quantity
    );
    FHE.allowThis(price);
    FHE.allowThis(quantity);
}`}
        solidityFilename="Order.sol"
        fhevmFilename="FHEOrder.sol"
        highlightLines={[4, 5, 6, 8, 9, 10, 11, 12, 13]}
      />

      <CalloutBox type="info" title="ZKPoK Binds Ciphertext to Contract and Sender">
        The ZKPoK (inputProof) proves three things: (1) the sender knows the
        plaintext value inside the ciphertext, (2) the ciphertext is intended
        for <strong>this specific contract address</strong>, and (3) it was
        created by <strong>this specific sender</strong>. This prevents replay
        attacks -- you cannot take someone else&apos;s encrypted bid and submit
        it as your own, because the proof would fail verification.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Client-Side SDK Code
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is what the client-side code looks like when creating encrypted
        inputs using the FHEVM SDK. The SDK handles encryption and ZKPoK
        generation automatically.
      </p>

      <CodeBlock
        code={`// TypeScript -- Client-side encrypted input creation
import { createInstance } from "@zama-fhe/relayer-sdk";

const instance = await createInstance();

// Create an encrypted input builder
const input = instance.createEncryptedInput(
  contractAddress,   // target contract
  signerAddress      // sender address
);

// Add values to encrypt (batched into one proof)
input.addUint64(1000);     // encrypt the amount: 1000
input.addUint32(5);        // encrypt the quantity: 5

// Encrypt + generate ZKPoK
const encrypted = await input.encrypt();

// Send transaction with encrypted values
await contract.createOrder(
  encrypted.handles[0],    // externalEuint64
  encrypted.handles[1],    // externalEuint32
  encrypted.inputProof     // single proof for all values
);`}
        lang="typescript"
        filename="client-input.ts"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Common Error: Missing inputProof
      </h2>

      <p className="text-text-secondary leading-relaxed">
        One of the most common mistakes is forgetting the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          inputProof
        </code>{" "}
        parameter. Without it,{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.fromExternal
        </code>{" "}
        cannot verify the ciphertext, and the transaction will revert.
      </p>

      <CodeBlock
        code={`// WRONG: Missing inputProof parameter
function deposit(
    externalEuint64 calldata encAmount
    // Missing: bytes calldata inputProof
) external {
    // This will NOT compile or will fail at runtime
    euint64 amount = FHE.fromExternal(encAmount, ???);
}

// CORRECT: Always include inputProof
function deposit(
    externalEuint64 calldata encAmount,
    bytes calldata inputProof
) external {
    euint64 amount = FHE.fromExternal(encAmount, inputProof);
    // ... proceed with FHE operations
}`}
        lang="solidity"
        filename="input-proof-error.sol"
      />

      <Quiz
        question={{
          id: "2.3-q1",
          question:
            "What does FHE.fromExternal(externalEuint32Input, inputProof) do?",
          options: [
            "Encrypts a plaintext value and stores it on-chain",
            "Verifies the ZKPoK proof, then converts the external ciphertext to an on-chain euint32",
            "Decrypts the ciphertext and returns the plaintext value",
            "Sends the encrypted value to the KMS for processing",
          ],
          correctIndex: 1,
          explanation:
            "FHE.fromExternal performs two critical operations: (1) it verifies the ZKPoK (inputProof) to ensure the ciphertext is valid and was created by the sender for this contract, and (2) it converts the external type (externalEuint32) to an on-chain type (euint32) that can be used in FHE operations.",
        }}
      />

      <Quiz
        question={{
          id: "2.3-q2",
          question:
            "Why can't you reuse someone else's encrypted ciphertext in your own transaction?",
          options: [
            "The ciphertext expires after one block",
            "The ZKPoK binds the ciphertext to a specific contract address and sender -- proof verification would fail",
            "Encrypted values can only be used once",
            "The contract keeps a nonce that prevents reuse",
          ],
          correctIndex: 1,
          explanation:
            "The ZKPoK (inputProof) cryptographically binds the ciphertext to the specific contract address and the specific sender address. If you try to submit someone else's ciphertext, the proof verification in FHE.fromExternal will fail because the sender address does not match.",
        }}
      />

      <Quiz
        question={{
          id: "2.3-q3",
          question:
            "A function accepts three encrypted inputs (externalEuint64, externalEuint32, externalEbool). How many inputProof parameters does it need?",
          options: [
            "Three -- one proof per encrypted input",
            "One -- all encrypted inputs share a single inputProof",
            "Zero -- the proof is generated automatically on-chain",
            "Two -- one for the integers and one for the boolean",
          ],
          correctIndex: 1,
          explanation:
            "All encrypted inputs in a single function call share one inputProof. The client SDK batches all values into a single encrypted input and generates one proof that covers all of them. This is more gas-efficient than separate proofs.",
        }}
      />

      <InstructorNotes>
        <p>
          Students often confuse{" "}
          <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
            externalEuint32
          </code>{" "}
          with{" "}
          <code className="rounded bg-code-bg px-1 py-0.5 text-sm font-mono text-primary">
            euint32
          </code>
          . Clarify the distinction:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>externalEuintXX</strong>: User-supplied encrypted input
            (arrives via calldata, needs proof verification)
          </li>
          <li>
            <strong>euintXX</strong>: On-chain encrypted state (created by
            FHE.fromExternal, FHE.asEuintXX, or FHE operations)
          </li>
          <li>
            Think of it like this: externalEuint is a &quot;package at the
            door&quot; that needs to be verified before bringing it inside.
            euint is data already &quot;inside the house&quot; that the contract
            can freely use.
          </li>
          <li>
            Show the client SDK code to demystify what happens off-chain. Many
            students only see the Solidity side and find the input flow
            confusing.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
