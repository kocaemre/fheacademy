import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson3_4Meta = {
  learningObjective:
    "Build a React frontend that creates encrypted inputs, sends transactions to FHEVM contracts, and decrypts results for display.",
}

export function Lesson3_4Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        Until now we have focused on the smart contract side. In this lesson,
        we connect the full stack: a React frontend that encrypts user inputs
        with the relayer SDK, sends them to an FHEVM contract, reads encrypted
        results, and decrypts them for display. This is where everything comes
        together into a complete dApp.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The Full-Stack FHEVM Flow
      </h2>

      <p className="text-text-secondary leading-relaxed">
        A complete FHEVM dApp interaction follows this flow: (1) user connects
        wallet, (2) user inputs a plaintext value, (3) the SDK encrypts it
        client-side, (4) the encrypted value + proof is sent as a transaction,
        (5) the contract processes it on encrypted data, (6) the user reads
        encrypted results, (7) the SDK decrypts them for display.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Creating Encrypted Inputs
      </h2>

      <p className="text-text-secondary leading-relaxed">
        In standard dApps, you pass plaintext values directly to contract
        functions. In FHEVM, the SDK encrypts the value client-side and produces
        a ciphertext + ZKPoK proof pair that the contract validates:
      </p>

      <CodeDiff
        solidity={`// Standard: Plaintext Contract Call
import { ethers } from "ethers";

async function increment(value: number) {
  const tx = await contract.increment(
    value
  );
  await tx.wait();
  // Value sent as plaintext calldata
  // Anyone watching the mempool
  // can see the value
}`}
        fhevm={`// FHEVM: Encrypted Contract Call
import { createInstance }
  from "@zama-fhe/relayer-sdk";

async function increment(value: number) {
  const instance = await createInstance();
  // Encrypt the value client-side
  const { data, proof } =
    await instance.encryptUint32(value);
  const tx = await contract.increment(
    data, proof
  );
  await tx.wait();
  // Value is encrypted in calldata
}`}
        solidityFilename="standard-call.ts"
        fhevmFilename="fhevm-call.ts"
        highlightLines={[2, 3, 6, 8, 9, 11]}
      />

      <CalloutBox type="info" title="The SDK Handles All FHE Key Management">
        The relayer SDK manages the FHE public key internally. When you call{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          instance.encryptUint32(value)
        </code>
        , it fetches the network&apos;s FHE public key, encrypts the value,
        generates the ZKPoK proof, and returns both. You just provide the
        plaintext value and get the encrypted input back.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Reading and Decrypting Results
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Reading results from an FHEVM contract is a two-step process: first you
        read the encrypted handle from the contract, then you decrypt it
        off-chain via the relayer SDK:
      </p>

      <CodeDiff
        solidity={`// Standard: Direct Result Reading
async function getBalance() {
  const balance =
    await contract.balanceOf(
      userAddress
    );
  // balance is a plain number
  setBalance(balance.toString());
}`}
        fhevm={`// FHEVM: Decrypt for Display
async function getBalance() {
  const handle =
    await contract.balanceOf(
      userAddress
    );
  // handle is an encrypted reference
  const instance =
    await createInstance();
  const results =
    await instance.publicDecrypt(
      [handle]
    );
  const balance =
    results.values[handle];
  setBalance(balance.toString());
}`}
        solidityFilename="standard-read.ts"
        fhevmFilename="fhevm-read.ts"
        highlightLines={[7, 8, 9, 10, 11, 12, 14, 15]}
      />

      <CalloutBox type="warning" title="ACL Permission Required">
        If a user does not have ACL permission on the ciphertext (granted via{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.allow(handle, userAddress)
        </code>{" "}
        in the contract), decryption will fail. Always check permissions first.
        The contract must explicitly grant the user access to their own data
        before they can decrypt it.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Complete React Component
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is a complete React component that interacts with the FHECounter
        contract from Lesson 1.4. It demonstrates the full flow: encrypt input,
        send transaction, read result, and decrypt for display:
      </p>

      <CodeBlock
        code={`// TypeScript React component for FHECounter
import { useState } from "react";
import { createInstance } from "@zama-fhe/relayer-sdk";
import { useContract, useWallet } from "./hooks";

export function FHECounterApp() {
  const { address, signer } = useWallet();
  const contract = useContract("FHECounter", signer);
  const [count, setCount] = useState<string>("encrypted");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Encrypt input and send increment transaction
  async function handleIncrement() {
    if (!contract || !inputValue) return;
    setLoading(true);
    try {
      const instance = await createInstance();
      const value = parseInt(inputValue, 10);

      // 1. Encrypt the value client-side
      const { data, proof } = await instance.encryptUint32(value);

      // 2. Send encrypted value + proof to contract
      const tx = await contract.increment(data, proof);
      await tx.wait();

      // 3. Read and decrypt the updated count
      await refreshCount();
    } finally {
      setLoading(false);
    }
  }

  // Read encrypted count and decrypt for display
  async function refreshCount() {
    if (!contract) return;
    const handle = await contract.getCount();
    const instance = await createInstance();
    const results = await instance.publicDecrypt([handle]);
    setCount(results.values[handle].toString());
  }

  return (
    <div>
      <h2>FHE Counter: {count}</h2>
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter value to add"
      />
      <button onClick={handleIncrement} disabled={loading}>
        {loading ? "Encrypting..." : "Increment"}
      </button>
      <button onClick={refreshCount}>Refresh Count</button>
      <p>Connected: {address}</p>
    </div>
  );
}`}
        lang="typescript"
        filename="FHECounterApp.tsx"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Error Handling
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The most common error in FHEVM frontends is attempting to decrypt data
        without proper ACL permissions. Always wrap decrypt calls in try/catch
        and provide clear error messages:
      </p>

      <CodeBlock
        code={`// Error handling for FHEVM operations
async function safeDecrypt(handle: string) {
  try {
    const instance = await createInstance();
    const results = await instance.publicDecrypt([handle]);
    return results.values[handle];
  } catch (error) {
    if (error.message.includes("permission")) {
      console.error("ACL permission denied -- user not authorized to decrypt");
      // Show user-friendly message
      return null;
    }
    throw error; // Re-throw unexpected errors
  }
}`}
        lang="typescript"
        filename="safe-decrypt.ts"
      />

      <Quiz
        question={{
          id: "3.4-q1",
          question:
            "What does the relayer SDK do on the client side when you call encryptUint32(value)?",
          options: [
            "It sends the value to the contract for on-chain encryption",
            "It fetches the FHE public key, encrypts the value locally, and generates a ZKPoK proof",
            "It stores the value in browser local storage for later use",
            "It hashes the value using keccak256 for privacy",
          ],
          correctIndex: 1,
          explanation:
            "The relayer SDK handles all encryption client-side. It fetches the network's FHE public key, encrypts the plaintext value using that key, and generates a Zero-Knowledge Proof of Knowledge (ZKPoK) that proves the caller created the ciphertext. Both the encrypted data and proof are returned for use in the contract call.",
        }}
      />

      <Quiz
        question={{
          id: "3.4-q2",
          question:
            "In the React component above, where does the encryption happen?",
          options: [
            "In the smart contract's increment function",
            "On the blockchain when the transaction is mined",
            "Client-side in handleIncrement, via instance.encryptUint32(value)",
            "In the refreshCount function when reading the result",
          ],
          correctIndex: 2,
          explanation:
            "Encryption happens client-side in the handleIncrement function. The line 'instance.encryptUint32(value)' encrypts the plaintext value before it is sent to the contract. The contract receives already-encrypted data and validates it with FHE.fromExternal. The refreshCount function does the opposite -- it decrypts.",
        }}
      />

      <Quiz
        question={{
          id: "3.4-q3",
          question:
            "What happens if you try to decrypt a value without ACL permission?",
          options: [
            "The SDK returns zero as a default value",
            "The transaction reverts on-chain",
            "The decryption fails with a permission error",
            "The SDK automatically requests permission from the contract",
          ],
          correctIndex: 2,
          explanation:
            "If the user's address was not granted access via FHE.allow(handle, userAddress) in the contract, the decryption request will fail with a permission error. The contract must explicitly grant each user access to their own encrypted data. There is no automatic permission -- this is by design for privacy.",
        }}
      />

      <InstructorNotes>
        <p>
          This is where the full stack comes together. Key teaching points:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>Run through the complete flow step by step:</strong> Connect
            wallet, enter value, encrypt, send tx, wait for confirmation, read
            handle, decrypt, display. Each step should be visible in the UI.
          </li>
          <li>
            The most confusing part for students is the asymmetry: encryption
            happens in the send path, decryption happens in the read path. Draw
            the flow diagram on the board.
          </li>
          <li>
            Common pitfall: students forget that{" "}
            <code className="text-sm">FHE.allow(handle, msg.sender)</code> must
            be called in the contract for the frontend to decrypt. If they get
            permission errors, check the contract ACL calls first.
          </li>
          <li>
            In mock mode, decryption is synchronous and fast. On mainnet, it
            requires KMS round-trips. Design the UI to handle loading states.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
