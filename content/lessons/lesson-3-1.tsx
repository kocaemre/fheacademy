import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson3_1Meta = {
  learningObjective:
    "Understand the v0.9 self-relaying decryption mechanism and know when to decrypt vs keep data encrypted.",
}

export function Lesson3_1Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        So far, every value in our FHEVM contracts has stayed encrypted. But
        there are moments when encrypted data must become visible -- when a user
        checks their own balance, when an auction reveals its winner, or when
        vote totals are published. In FHEVM v0.9, decryption uses a{" "}
        <strong>self-relaying</strong> model: the contract marks data as
        decryptable, and a user (or relayer) fetches the plaintext off-chain via
        the KMS, then optionally submits it back on-chain with a proof.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Data Stays Encrypted by Default
      </h2>

      <p className="text-text-secondary leading-relaxed">
        This is the foundational principle of FHEVM: encrypted values never
        become plaintext automatically. Unlike standard Solidity where any{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          public
        </code>{" "}
        variable is readable by anyone, FHEVM ciphertexts are opaque even to
        validators. Decryption is a <strong>conscious design decision</strong>{" "}
        that your contract must explicitly initiate.
      </p>

      <CalloutBox type="warning" title="Decryption is Irreversible">
        Once a value is decrypted and stored on-chain as plaintext, it is public
        forever. There is no way to re-encrypt it. Treat every decryption as a
        one-way door -- only decrypt when the business logic requires it.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The v0.9 Decryption Model
      </h2>

      <p className="text-text-secondary leading-relaxed">
        FHEVM v0.9 uses a self-relaying decryption flow. There is no Oracle or
        Gateway -- the user drives the entire process. The flow has three
        stages: (1) the contract marks a ciphertext as publicly decryptable,
        (2) the user decrypts off-chain via the relayer SDK and KMS, and (3) the
        user submits the cleartext with a KMS proof back to the contract for
        verification and storage.
      </p>

      <CodeDiff
        solidity={`// Standard Solidity: Return Plaintext
contract StandardVault {
    uint64 public result;

    function getResult()
        external view
        returns (uint64)
    {
        // Value is always public
        return result;
    }
}`}
        fhevm={`// FHEVM v0.9: Decryption Request
contract FHEVault is ZamaEthereumConfig {
    euint64 private encResult;
    uint64 public decryptedResult;

    function requestDecryption() external {
        // Mark for off-chain decryption
        FHE.makePubliclyDecryptable(
            encResult
        );
    }
    // Decrypted value arrives via
    // callback after off-chain relay
}`}
        solidityFilename="StandardVault.sol"
        fhevmFilename="FHEVault.sol"
        highlightLines={[4, 7, 8, 9, 10]}
      />

      <p className="text-text-secondary leading-relaxed">
        Notice the fundamental difference: standard Solidity returns the value
        directly in a{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          view
        </code>{" "}
        function. FHEVM separates the request (marking data as decryptable) from
        the result (receiving the decrypted value in a callback). The decrypted
        value is stored in a separate plaintext variable.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Receiving the Decrypted Value
      </h2>

      <p className="text-text-secondary leading-relaxed">
        After the relayer SDK decrypts the value off-chain, it submits the
        cleartext along with a KMS proof back to the contract. The contract
        verifies the proof and stores the result:
      </p>

      <CodeDiff
        solidity={`// Standard Solidity: Direct Read
function getBalance()
    external view
    returns (uint64)
{
    return _balance;
    // Caller reads immediately
}`}
        fhevm={`// FHEVM v0.9: Verified Callback
function callbackResult(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) public {
    FHE.checkSignatures(
        requestId,
        cleartexts,
        decryptionProof
    );
    decryptedResult =
        abi.decode(cleartexts, (uint64));
}`}
        solidityFilename="DirectRead.sol"
        fhevmFilename="VerifiedCallback.sol"
        highlightLines={[2, 3, 4, 7, 8, 9, 10, 12, 13]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Off-chain: The Relayer SDK
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The client-side code uses the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          @zama-fhe/relayer-sdk
        </code>{" "}
        to perform the actual decryption. The SDK communicates with the KMS
        (Key Management Service) to decrypt the ciphertext and returns both the
        plaintext value and a proof that the decryption was performed correctly.
      </p>

      <CodeBlock
        code={`// TypeScript -- client-side decryption
import { createInstance } from "@zama-fhe/relayer-sdk";

const instance = await createInstance();

// 1. Fetch the ciphertext handle from the contract
const handle = await contract.encryptedResult();

// 2. Decrypt off-chain via KMS
const results = await instance.publicDecrypt([handle]);
const clearValue = results.values[handle];   // decrypted plaintext
const proof = results.decryptionProof;        // KMS proof

// 3. Submit cleartext + proof back to contract
await contract.callbackResult(requestId, clearValue, proof);`}
        lang="typescript"
        filename="decrypt-client.ts"
      />

      <CalloutBox type="info" title="Mock Mode vs Mainnet">
        In mock mode (local development), decryption is synchronous -- the value
        is available immediately. On mainnet, decryption takes a few blocks
        because the KMS must process the request. Always design your contracts
        to handle the asynchronous case with a callback pattern.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        When to Decrypt vs Keep Encrypted
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The decision of when to decrypt is the most important design choice in
        FHEVM development. Here are the guidelines:
      </p>

      <p className="mt-4 text-text-secondary leading-relaxed">
        <strong>Decrypt when:</strong> a user needs to see their own balance, an
        auction ends and the winner must be revealed, vote totals need to be
        published after voting closes, or a game round ends and the result must
        be shown.
      </p>

      <p className="mt-3 text-text-secondary leading-relaxed">
        <strong>Keep encrypted when:</strong> data is still being computed on
        (intermediate values), other users should not see the value (individual
        bids, individual votes), the value is used as input to future FHE
        operations, or decrypting would leak strategic information (a player&apos;s
        hand in a card game).
      </p>

      <Quiz
        question={{
          id: "3.1-q1",
          question:
            "What does FHE.makePubliclyDecryptable(handle) do?",
          options: [
            "It immediately decrypts the value and returns the plaintext",
            "It marks the ciphertext so it can be decrypted off-chain via the relayer SDK",
            "It sends the value to the Gateway Oracle for decryption",
            "It converts the encrypted value back to a Solidity uint type",
          ],
          correctIndex: 1,
          explanation:
            "FHE.makePubliclyDecryptable marks a ciphertext handle so that anyone can decrypt it off-chain using the relayer SDK and KMS. It does NOT perform decryption itself -- the actual decryption happens off-chain, and the result is submitted back to the contract via a callback.",
        }}
      />

      <Quiz
        question={{
          id: "3.1-q2",
          question:
            "In which scenario should you NOT decrypt data?",
          options: [
            "When a user wants to check their own token balance",
            "When the auction is still open and bids are being compared",
            "When vote totals need to be published after voting ends",
            "When a game round ends and the winner is announced",
          ],
          correctIndex: 1,
          explanation:
            "While an auction is still open, bids should remain encrypted so no one can see competitors' amounts. Decrypting during active computation would leak sensitive information. Decrypt only when the business logic requires the value to be public (e.g., after the auction closes).",
        }}
      />

      <Quiz
        question={{
          id: "3.1-q3",
          question:
            "Given this contract, what happens when callbackResult is called?",
          options: [
            "The contract decrypts encResult using FHE operations",
            "The contract verifies the KMS proof with FHE.checkSignatures and stores the plaintext in decryptedResult",
            "The contract sends encResult to the Gateway for decryption",
            "The contract re-encrypts the value with a new key",
          ],
          correctIndex: 1,
          explanation:
            "The callbackResult function receives the cleartext and a decryption proof from the relayer. It calls FHE.checkSignatures to verify the KMS proof is valid, then decodes the cleartext and stores it in the decryptedResult state variable. The decryption itself happened off-chain.",
        }}
      />

      <InstructorNotes>
        <p>
          This is the most critical lesson in Week 3. Key teaching points:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>v0.9 self-relaying model:</strong> This replaces the old
            Gateway/Oracle pattern from earlier FHEVM versions. Students may find
            online resources referencing{" "}
            <code className="text-sm">Gateway.requestDecryption</code> -- tell them
            that is <strong>deprecated</strong> in v0.9.
          </li>
          <li>
            The mental model is: contract marks data as decryptable, user
            decrypts off-chain, user submits proof back. Three steps, not one.
          </li>
          <li>
            Emphasize the irreversibility of decryption. Draw the analogy:
            decryption is like publishing a secret -- you cannot un-publish it.
          </li>
          <li>
            Mock mode makes decryption synchronous, which can mislead students
            into thinking it is always instant. Explicitly demonstrate the async
            callback pattern.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
