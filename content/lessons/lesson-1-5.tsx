import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson1_5Meta = {
  learningObjective:
    "Write comprehensive Hardhat tests for FHEVM contracts using fhevm test helpers for encrypted input creation and result decryption.",
}

export function Lesson1_5Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        Testing FHEVM contracts requires a fundamental paradigm shift from
        standard Solidity testing. In a normal Hardhat test, you call a
        function, get a return value, and assert on it directly. With FHEVM,
        return values are encrypted handles -- opaque bytes32 pointers to
        ciphertexts. You cannot read them, compare them, or use them in
        assertions without first creating encrypted inputs and then decrypting
        results using special test helpers provided by the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          fhevm
        </code>{" "}
        package.
      </p>

      <p className="text-text-secondary leading-relaxed">
        The testing workflow follows three steps: (1) create encrypted inputs
        using{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          createEncryptedInput
        </code>
        , (2) call contract functions with the encrypted values, and (3)
        decrypt the results using{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          userDecryptEuint
        </code>{" "}
        to verify correctness. Let&apos;s walk through this by comparing a
        standard Counter test with its FHEVM equivalent.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Test File Setup
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Before writing test cases, you need to import the FHEVM test helpers.
        These helpers provide the encryption and decryption functions that
        bridge the gap between plaintext test values and the encrypted world
        inside the contract.
      </p>

      <CodeBlock
        code={`// test/FHECounter.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import type { FHECounter } from "../typechain-types";
import type { Signer } from "ethers";
import { FhevmType } from "fhevm/types";

// Import FHEVM test helpers
import {
  createEncryptedInput,
  userDecryptEuint,
} from "fhevm/test";

describe("FHECounter", function () {
  let counter: FHECounter;
  let owner: Signer;
  let addr1: Signer;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory(
      "FHECounter"
    );
    counter = await Factory.deploy();
    await counter.waitForDeployment();
  });

  // Test cases below...
});`}
        lang="typescript"
        filename="test/FHECounter.ts"
      />

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Testing: Standard vs FHEVM
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The biggest difference is how you prepare inputs and check outputs. In
        standard tests, you pass plain numbers and compare return values. In
        FHEVM tests, you create encrypted inputs, call functions with
        ciphertext + proof, and decrypt the result to verify.
      </p>

      <CodeDiff
        solidity={`// Standard Counter Test
it("should increment", async () => {
    // Direct plaintext call
    await counter.increment(5);

    // Direct plaintext read
    const count = await counter.getCount();

    // Simple assertion
    expect(count).to.equal(5);
});

it("should decrement", async () => {
    await counter.increment(10);
    await counter.decrement(3);

    const count = await counter.getCount();
    expect(count).to.equal(7);
});`}
        fhevm={`// FHEVM Counter Test
it("should increment", async () => {
    const contractAddr =
        await counter.getAddress();
    const signerAddr =
        await owner.getAddress();

    // Create encrypted input
    const input = await createEncryptedInput(
        contractAddr, signerAddr
    );
    input.addEuint32(5);  // encrypt 5
    const { data, proof } = input.encrypt();

    // Call with encrypted value + proof
    await counter.increment(data, proof);

    // Get encrypted handle
    const handle = await counter.getCount();

    // Decrypt to verify
    const value = await userDecryptEuint(
        FhevmType.euint32,
        handle,
        contractAddr,
        owner
    );
    expect(value).to.equal(5n);
});`}
        solidityFilename="Counter.test.ts"
        fhevmFilename="FHECounter.test.ts"
        highlightLines={[3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 25, 26, 27]}
      />

      <p className="text-text-secondary leading-relaxed">
        The FHEVM test is more verbose because every interaction with encrypted
        data requires explicit encryption and decryption steps. The{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          createEncryptedInput
        </code>{" "}
        function takes the contract address and signer address to bind the
        encrypted input to a specific contract and user (preventing replay
        attacks). The{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          userDecryptEuint
        </code>{" "}
        function takes the type, handle, contract address, and signer to
        decrypt the result. Note that the expected value uses{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          5n
        </code>{" "}
        (BigInt) rather than{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          5
        </code>{" "}
        (Number) because decrypted values are returned as BigInt.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        The Handle Trap: Why Direct Comparison Fails
      </h2>

      <CalloutBox type="warning" title="Handles Are Opaque Pointers">
        Encrypted handles are NOT deterministic. Two handles pointing to the
        same plaintext value will have completely different bytes32 values. You
        can NEVER compare handles directly. This code will always fail:
        <code className="mt-2 block rounded bg-code-bg px-2 py-1 text-sm font-mono">
          expect(handle1).to.equal(handle2) // WRONG -- always fails
        </code>
        Instead, decrypt both handles and compare the plaintext values:
        <code className="mt-1 block rounded bg-code-bg px-2 py-1 text-sm font-mono">
          expect(await decrypt(handle1)).to.equal(await decrypt(handle2)) // CORRECT
        </code>
      </CalloutBox>

      <CodeDiff
        solidity={`// Standard Assertion
// Values are plaintext -- compare directly
const a = await contract.getValue();
const b = await contract.getOtherValue();

// This works: a and b are numbers
expect(a).to.equal(b);

// Equality is straightforward
if (a === b) {
    console.log("Equal!");
}`}
        fhevm={`// FHEVM Assertion
// Values are encrypted handles -- opaque
const handleA = await contract.getValue();
const handleB = await contract.getOtherValue();

// WRONG: handles are random bytes32
// expect(handleA).to.equal(handleB);

// CORRECT: decrypt then compare
const a = await userDecryptEuint(
    FhevmType.euint32,
    handleA, contractAddr, signer
);
const b = await userDecryptEuint(
    FhevmType.euint32,
    handleB, contractAddr, signer
);
expect(a).to.equal(b);`}
        solidityFilename="assertion.test.ts"
        fhevmFilename="fhe-assertion.test.ts"
        highlightLines={[6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]}
      />

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Running Tests
      </h2>

      <CodeBlock
        code={`# Run all tests (FHEVM plugin activates mock mode automatically)
npx hardhat test

# Run a specific test file
npx hardhat test test/FHECounter.ts

# Run with verbose output
npx hardhat test --verbose

# Expected output:
#   FHECounter
#     ✓ should start with zero count
#     ✓ should increment with encrypted value
#     ✓ should handle multiple increments
#     3 passing (2s)`}
        lang="shellscript"
        filename="terminal"
      />

      <p className="text-text-secondary leading-relaxed">
        Tests run slightly slower than standard Solidity tests because the mock
        contracts add overhead for simulating the FHE pipeline. On a typical
        machine, expect 1-3 seconds per test. This is still orders of magnitude
        faster than testing on testnet, where each FHE operation takes seconds
        to process on the coprocessor.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Complete Test Example
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is a more complete test suite that covers initialization, basic
        operations, and verifying the uninitialized state:
      </p>

      <CodeBlock
        code={`describe("FHECounter", function () {
  let counter: FHECounter;
  let owner: Signer;
  let contractAddr: string;
  let signerAddr: string;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("FHECounter");
    counter = await Factory.deploy();
    await counter.waitForDeployment();
    contractAddr = await counter.getAddress();
    signerAddr = await owner.getAddress();
  });

  it("should start uninitialized", async () => {
    const handle = await counter.getCount();
    // Uninitialized euint32 returns zero handle
    expect(handle).to.equal(ethers.ZeroHash);
  });

  it("should increment with encrypted value", async () => {
    const input = await createEncryptedInput(contractAddr, signerAddr);
    input.addEuint32(42);
    const { data, proof } = input.encrypt();

    await counter.increment(data, proof);

    const handle = await counter.getCount();
    const value = await userDecryptEuint(
      FhevmType.euint32, handle, contractAddr, owner
    );
    expect(value).to.equal(42n);
  });

  it("should accumulate multiple increments", async () => {
    // First increment: 10
    const input1 = await createEncryptedInput(contractAddr, signerAddr);
    input1.addEuint32(10);
    const enc1 = input1.encrypt();
    await counter.increment(enc1.data, enc1.proof);

    // Second increment: 20
    const input2 = await createEncryptedInput(contractAddr, signerAddr);
    input2.addEuint32(20);
    const enc2 = input2.encrypt();
    await counter.increment(enc2.data, enc2.proof);

    // Verify: 10 + 20 = 30
    const handle = await counter.getCount();
    const value = await userDecryptEuint(
      FhevmType.euint32, handle, contractAddr, owner
    );
    expect(value).to.equal(30n);
  });
});`}
        lang="typescript"
        filename="test/FHECounter.ts"
      />

      <Quiz
        question={{
          id: "1.5-q1",
          question:
            "Why can't you compare encrypted handles directly in test assertions?",
          options: [
            "Handles are stored in a different encoding format",
            "The testing framework does not support bytes32 comparison",
            "Handles are opaque pointers -- two handles with the same plaintext are NOT equal",
            "Encrypted handles can only be compared on-chain",
          ],
          correctIndex: 2,
          explanation:
            "Encrypted handles are non-deterministic bytes32 values. Each FHE operation produces a new, unique handle even if the underlying plaintext value is the same. You must always decrypt handles using userDecryptEuint before making assertions on their values.",
        }}
      />

      <Quiz
        question={{
          id: "1.5-q2",
          question:
            "What is the purpose of createEncryptedInput in test helpers?",
          options: [
            "It generates random test data for fuzzing",
            "It creates an encrypted value bound to a specific contract and signer, simulating what a user's browser would do",
            "It converts plaintext values to hexadecimal format",
            "It deploys a mock encryption contract for testing",
          ],
          correctIndex: 1,
          explanation:
            "createEncryptedInput simulates the client-side encryption that a user's browser would perform. It takes the contract address and signer address to bind the encrypted input to a specific context (preventing replay attacks), then encrypts the value and produces a proof. In mock mode, this is simulated; on a real network, actual encryption and ZKPoK generation occur.",
        }}
      />

      <InstructorNotes>
        <p>
          The two most common student mistakes in this lesson:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>Comparing handles directly:</strong> Students instinctively
            write{" "}
            <code>expect(handle).to.equal(expectedHandle)</code>. This always
            fails because handles are non-deterministic. Drill this into them:
            always decrypt first, then compare plaintext values.
          </li>
          <li>
            <strong>Forgetting that decrypted values are BigInt:</strong>{" "}
            Students write <code>expect(value).to.equal(5)</code> instead of{" "}
            <code>expect(value).to.equal(5n)</code>. The <code>n</code> suffix
            matters -- Chai strict equality will fail if types do not match.
          </li>
        </ul>
        <p className="mt-2">
          Important clarification for students:{" "}
          <code>userDecryptEuint</code> is a mock-mode-only test helper. On a
          real network, decryption goes through the KMS using the relayer SDK
          (covered in Week 3). The test helper exists to make the development
          workflow practical -- you would not want to interact with KMS for
          every test assertion.
        </p>
        <p className="mt-2">
          If students ask &quot;how do I test ACL permissions?&quot; -- tell
          them we will cover that in Week 2 (Lesson 2.4). For now, focus on the
          basic create-call-decrypt flow.
        </p>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
