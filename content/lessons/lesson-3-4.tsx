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
        client-side, sends them to an FHEVM contract, reads encrypted results,
        and decrypts them for display. We will use Next.js with Wagmi and
        Zama&apos;s official fhevmjs SDK.
      </p>

      <CalloutBox type="tip" title="Official Starter Template">
        Zama provides an official{" "}
        <a href="https://github.com/zama-ai/fhevm-react-template" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
          fhevm-react-template
        </a>{" "}
        on GitHub with a complete monorepo setup: Hardhat contracts, fhevmjs SDK,
        and a Next.js frontend with Wagmi. Clone it to get started quickly, or
        follow along below to understand each piece.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The Full-Stack FHEVM Flow
      </h2>

      <p className="text-text-secondary leading-relaxed">
        A complete FHEVM dApp interaction follows this flow: (1) user connects
        wallet via Wagmi, (2) user inputs a plaintext value, (3) fhevmjs encrypts it
        client-side with the network&apos;s FHE public key, (4) the encrypted value + ZKPoK
        proof is sent as a transaction, (5) the contract processes encrypted data,
        (6) the user reads an encrypted handle, (7) fhevmjs decrypts it for display.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Project Setup with Next.js
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Start by installing the required packages. The key dependency is{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          fhevmjs
        </code>{" "}
        which provides client-side encryption and decryption. We use Wagmi for
        wallet connection and contract interaction:
      </p>

      <CodeBlock
        code={`# Install dependencies
npm install fhevmjs wagmi viem @tanstack/react-query

# Project structure
app/
  layout.tsx          # Wagmi + QueryClient providers
  page.tsx            # Main dApp page
  providers.tsx       # Provider wrapper (client component)
hooks/
  useFHEEncryption.ts # Custom hook for encryption
  useFHEDecrypt.ts    # Custom hook for decryption
lib/
  fhevm.ts            # fhevmjs instance configuration
  contracts.ts        # Contract ABIs and addresses`}
        lang="shellscript"
        filename="setup"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Configuring the fhevmjs Instance
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The fhevmjs SDK needs to be initialized with the network&apos;s FHE
        public key. This singleton instance is reused across your app:
      </p>

      <CodeBlock
        code={`// lib/fhevm.ts
import { createInstance, FhevmInstance } from "fhevmjs";

let instance: FhevmInstance | null = null;

export async function getFhevmInstance(): Promise<FhevmInstance> {
  if (instance) return instance;

  // Initialize with network config
  instance = await createInstance({
    chainId: 11155111,  // Sepolia
    networkUrl: "https://rpc.sepolia.org",
  });

  return instance;
}

// Helper: create encrypted input bound to
// a specific contract + user pair
export function createInput(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string
) {
  return instance.createEncryptedInput(
    contractAddress,
    userAddress
  );
}`}
        lang="typescript"
        filename="lib/fhevm.ts"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Wagmi Provider Setup
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Wrap your Next.js app with Wagmi and React Query providers. Since these
        use React context, they must be in a client component:
      </p>

      <CodeBlock
        code={`// app/providers.tsx
"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";

const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],  // MetaMask
  transports: {
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html><body>
      <Providers>{children}</Providers>
    </body></html>
  );
}`}
        lang="typescript"
        filename="app/providers.tsx + layout.tsx"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Creating Encrypted Inputs
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The core difference from standard dApps: instead of passing plaintext
        values, you encrypt them client-side before sending. Here is the
        comparison:
      </p>

      <CodeDiff
        solidity={`// Standard: Plaintext Call
import { useWriteContract } from "wagmi";

function IncrementButton({ value }) {
  const { writeContract } = useWriteContract();

  function handleClick() {
    writeContract({
      address: CONTRACT_ADDR,
      abi: counterABI,
      functionName: "increment",
      args: [value],
      // value is visible in calldata
    });
  }

  return (
    <button onClick={handleClick}>
      Increment by {value}
    </button>
  );
}`}
        fhevm={`// FHEVM: Encrypted Call
import { useWriteContract, useAccount }
  from "wagmi";
import { getFhevmInstance }
  from "@/lib/fhevm";

function IncrementButton({ value }) {
  const { writeContract } = useWriteContract();
  const { address } = useAccount();

  async function handleClick() {
    const fhevm = await getFhevmInstance();
    // Create input bound to contract+user
    const input = fhevm.createEncryptedInput(
      CONTRACT_ADDR, address
    );
    input.add32(value);
    const enc = await input.encrypt();

    writeContract({
      address: CONTRACT_ADDR,
      abi: counterABI,
      functionName: "increment",
      args: [enc.handles[0], enc.inputProof],
    });
  }

  return (
    <button onClick={handleClick}>
      Increment (encrypted)
    </button>
  );
}`}
        solidityFilename="standard-wagmi.tsx"
        fhevmFilename="fhevm-wagmi.tsx"
        highlightLines={[2, 3, 9, 10, 11, 15, 22]}
      />

      <CalloutBox type="info" title="Encryption Type Methods">
        fhevmjs provides encryption methods for all FHEVM types:{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          encryptBool()
        </code>
        ,{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          encryptUint8()
        </code>
        ,{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          encryptUint32()
        </code>
        ,{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          encryptUint64()
        </code>
        , and more. Each returns the encrypted data and a ZKPoK proof.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Reading and Decrypting Results
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Reading from an FHEVM contract returns an encrypted handle, not a
        plaintext value. You then decrypt it off-chain via fhevmjs:
      </p>

      <CodeDiff
        solidity={`// Standard: Direct Reading
import { useReadContract } from "wagmi";

function BalanceDisplay({ user }) {
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDR,
    abi: tokenABI,
    functionName: "balanceOf",
    args: [user],
  });

  return <p>Balance: {balance?.toString()}</p>;
}`}
        fhevm={`// FHEVM: Read Handle + Decrypt
import { useReadContract } from "wagmi";
import { getFhevmInstance } from "@/lib/fhevm";
import { useState, useEffect } from "react";

function BalanceDisplay({ user }) {
  const { data: handle } = useReadContract({
    address: CONTRACT_ADDR,
    abi: tokenABI,
    functionName: "balanceOf",
    args: [user],
  });

  const [balance, setBalance] = useState("...");

  useEffect(() => {
    if (!handle) return;
    (async () => {
      const fhevm = await getFhevmInstance();
      const result =
        await fhevm.publicDecrypt([handle]);
      setBalance(
        result.values[handle].toString()
      );
    })();
  }, [handle]);

  return <p>Balance: {balance}</p>;
}`}
        solidityFilename="standard-read.tsx"
        fhevmFilename="fhevm-read.tsx"
        highlightLines={[2, 3, 14, 16, 17, 18, 19, 20, 21, 22, 23]}
      />

      <CalloutBox type="warning" title="ACL Permission Required for Decryption">
        The contract must call{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          TFHE.allow(handle, userAddress)
        </code>{" "}
        for the user to decrypt their data. Without this, publicDecrypt will fail
        with a permission error. This is by design -- privacy means explicit
        access control.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Custom Hook: useFHEEncryption
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Zama&apos;s official template uses custom hooks to encapsulate encryption
        logic. Here is a simplified version you can use in any Next.js project:
      </p>

      <CodeBlock
        code={`// hooks/useFHEEncryption.ts
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { getFhevmInstance } from "@/lib/fhevm";

export function useFHEEncryption(contractAddress: string) {
  const { address } = useAccount();

  const encrypt = useCallback(
    async (values: { type: string; value: number | boolean }[]) => {
      const fhevm = await getFhevmInstance();
      const input = fhevm.createEncryptedInput(contractAddress, address!);

      // Add values by type
      for (const v of values) {
        switch (v.type) {
          case "bool":    input.addBool(!!v.value); break;
          case "uint8":   input.add8(Number(v.value)); break;
          case "uint32":  input.add32(Number(v.value)); break;
          case "uint64":  input.add64(Number(v.value)); break;
          case "address": input.addAddress(String(v.value)); break;
        }
      }

      return input.encrypt();
      // Returns: { handles: bytes32[], inputProof: bytes }
    },
    [contractAddress, address]
  );

  return { encrypt };
}

// Usage:
function TransferForm() {
  const { encrypt } = useFHEEncryption(TOKEN_ADDR);
  const { writeContract } = useWriteContract();

  async function handleTransfer(amount: number) {
    const enc = await encrypt([{ type: "uint64", value: amount }]);
    writeContract({
      address: TOKEN_ADDR,
      abi: tokenABI,
      functionName: "transfer",
      args: [recipient, enc.handles[0], enc.inputProof],
    });
  }
}`}
        lang="typescript"
        filename="hooks/useFHEEncryption.ts"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Complete Next.js Page Component
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is a complete Next.js page that ties everything together -- wallet
        connection with Wagmi, encrypted inputs, and decrypted display:
      </p>

      <CodeBlock
        code={`// app/counter/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useReadContract, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { getFhevmInstance } from "@/lib/fhevm";
import { counterABI, COUNTER_ADDRESS } from "@/lib/contracts";

export default function CounterPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { writeContract, isPending } = useWriteContract();

  const [decryptedCount, setDecryptedCount] = useState<string>("--");
  const [inputValue, setInputValue] = useState("");

  // Read encrypted handle from contract
  const { data: encryptedHandle, refetch } = useReadContract({
    address: COUNTER_ADDRESS,
    abi: counterABI,
    functionName: "getCount",
  });

  // Decrypt whenever handle changes
  useEffect(() => {
    if (!encryptedHandle) return;
    (async () => {
      try {
        const fhevm = await getFhevmInstance();
        const result = await fhevm.publicDecrypt([encryptedHandle]);
        setDecryptedCount(result.clearValues[encryptedHandle].toString());
      } catch (err) {
        console.error("Decryption failed:", err);
        setDecryptedCount("No permission");
      }
    })();
  }, [encryptedHandle]);

  // Encrypt and send increment transaction
  async function handleIncrement() {
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) return;

    const fhevm = await getFhevmInstance();
    const input = fhevm.createEncryptedInput(COUNTER_ADDRESS, address!);
    input.add32(value);
    const enc = await input.encrypt();

    writeContract(
      {
        address: COUNTER_ADDRESS,
        abi: counterABI,
        functionName: "increment",
        args: [enc.handles[0], enc.inputProof],
      },
      {
        onSuccess: () => {
          setInputValue("");
          // Refetch after tx confirms
          setTimeout(() => refetch(), 5000);
        },
      }
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <h1 className="text-2xl font-bold">FHE Counter</h1>
        <button
          onClick={() => connect({ connector: injected() })}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Connect MetaMask
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold">FHE Counter</h1>
      <p className="text-sm text-gray-500">Connected: {address}</p>

      <div className="rounded-xl border p-6 text-center">
        <p className="text-4xl font-bold">{decryptedCount}</p>
        <p className="text-sm text-gray-400">Encrypted on-chain, decrypted for you</p>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Value to add"
          className="rounded border px-3 py-2"
        />
        <button
          onClick={handleIncrement}
          disabled={isPending || !inputValue}
          className="rounded bg-yellow-500 px-4 py-2 font-medium text-black disabled:opacity-50"
        >
          {isPending ? "Encrypting..." : "Increment"}
        </button>
      </div>
    </div>
  );
}`}
        lang="typescript"
        filename="app/counter/page.tsx"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Error Handling Patterns
      </h2>

      <p className="text-text-secondary leading-relaxed">
        FHEVM frontends have unique failure modes. Here are the patterns you
        should always implement:
      </p>

      <CodeBlock
        code={`// Common FHEVM frontend error patterns

// 1. ACL permission denied
async function safeDecrypt(handle: string) {
  try {
    const fhevm = await getFhevmInstance();
    const result = await fhevm.publicDecrypt([handle]);
    return result.values[handle];
  } catch (error: any) {
    if (error.message?.includes("permission")) {
      return null; // User not authorized to decrypt
    }
    throw error;
  }
}

// 2. Encryption input validation
function validateBeforeEncrypt(value: number, type: string) {
  if (type === "uint8" && (value < 0 || value > 255)) {
    throw new Error("uint8 must be 0-255");
  }
  if (type === "uint32" && (value < 0 || value > 4294967295)) {
    throw new Error("uint32 overflow");
  }
  // fhevmjs will also reject invalid values
}

// 3. Loading states -- decryption is async
function DecryptedValue({ handle }: { handle: string | undefined }) {
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) return;
    safeDecrypt(handle)
      .then(v => setValue(v?.toString() ?? null))
      .catch(() => setError("Decryption failed"));
  }, [handle]);

  if (error) return <span className="text-red-400">{error}</span>;
  if (value === null) return <span className="animate-pulse">Decrypting...</span>;
  return <span>{value}</span>;
}`}
        lang="typescript"
        filename="error-patterns.ts"
      />

      <CalloutBox type="tip" title="Mock Mode vs Mainnet">
        In mock mode (local Hardhat), decryption is instant and synchronous.
        On Sepolia or mainnet, it requires KMS (Key Management Service)
        round-trips and can take several seconds. Always design your UI with
        loading states for decryption.
      </CalloutBox>

      <Quiz
        question={{
          id: "3.4-q1",
          question:
            "What does fhevmjs do when you call encryptUint32(value)?",
          options: [
            "Sends the value to the contract for on-chain encryption",
            "Fetches the FHE public key, encrypts locally, and generates a ZKPoK proof",
            "Stores the value in browser localStorage for later use",
            "Hashes the value using keccak256 for privacy",
          ],
          correctIndex: 1,
          explanation:
            "fhevmjs handles all encryption client-side. It fetches the network's FHE public key, encrypts the plaintext value, and generates a Zero-Knowledge Proof of Knowledge (ZKPoK). Both the encrypted data and proof are returned for use in the contract call.",
        }}
      />

      <Quiz
        question={{
          id: "3.4-q2",
          question:
            "In a Next.js FHEVM dApp, where should you initialize the fhevmjs instance?",
          options: [
            "In a server component during SSR",
            "In a client-side singleton module, lazily initialized",
            "In the Wagmi config alongside the transport",
            "In the contract's constructor function",
          ],
          correctIndex: 1,
          explanation:
            "fhevmjs must be initialized client-side because it needs browser APIs for encryption. A singleton pattern (like lib/fhevm.ts) ensures the instance is created once and reused. Server components cannot use fhevmjs because encryption requires client-side execution.",
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
            "If the user's address was not granted access via TFHE.allow(handle, userAddress) in the contract, decryption will fail with a permission error. The contract must explicitly grant each user access to their own encrypted data. This is by design for privacy.",
        }}
      />

      <InstructorNotes>
        <p>
          This is where the full stack comes together. Key teaching points:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>Start with Zama&apos;s official template:</strong> Have
            students clone{" "}
            <a href="https://github.com/zama-ai/fhevm-react-template" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              fhevm-react-template
            </a>{" "}
            and run the counter example first. Then build their own page.
          </li>
          <li>
            The most confusing part is the asymmetry: encryption
            happens in the send path, decryption happens in the read path. Draw
            the flow diagram on the board.
          </li>
          <li>
            Common pitfall: students forget that{" "}
            <code className="text-sm">TFHE.allow(handle, msg.sender)</code> must
            be called in the contract for the frontend to decrypt. If they get
            permission errors, check the contract ACL calls first.
          </li>
          <li>
            Wagmi&apos;s useWriteContract and useReadContract work identically
            for FHEVM -- the only difference is that args contain encrypted data
            instead of plaintext. This makes migration intuitive.
          </li>
          <li>
            In mock mode, decryption is synchronous and fast. On Sepolia, it
            requires KMS round-trips. Design the UI to handle loading states.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
