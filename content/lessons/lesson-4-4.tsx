import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson4_4Meta = {
  learningObjective:
    "Write comprehensive test suites for FHEVM contracts covering functional, permission, edge case, and integration testing categories.",
}

export function Lesson4_4Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        Testing FHEVM contracts is fundamentally different from testing standard
        Solidity. You cannot directly read encrypted state variables or compare
        encrypted values with assertions. Instead, you must decrypt values
        through the ACL system, test permission failures explicitly, and
        verify that overflow guards work correctly. This lesson covers four
        testing categories: functional, permission, edge case, and integration.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Test Categories for FHEVM
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Every FHEVM contract should have tests in these four categories:
      </p>

      <ul className="mt-3 space-y-3 text-text-secondary">
        <li className="leading-relaxed">
          <strong className="text-foreground">1. Functional Tests:</strong>{" "}
          Verify core logic works correctly -- deposits, transfers, votes, etc.
          These test the happy path with valid encrypted inputs.
        </li>
        <li className="leading-relaxed">
          <strong className="text-foreground">2. Permission Tests:</strong>{" "}
          Verify that unauthorized addresses cannot decrypt, that ACL is set
          correctly, and that only permitted parties can access encrypted data.
        </li>
        <li className="leading-relaxed">
          <strong className="text-foreground">3. Edge Case Tests:</strong>{" "}
          Verify overflow protection, zero-value handling, re-initialization
          guards, and boundary conditions on encrypted values.
        </li>
        <li className="leading-relaxed">
          <strong className="text-foreground">4. Integration Tests:</strong>{" "}
          Test multi-user scenarios, multi-transaction flows, and interactions
          between multiple contracts.
        </li>
      </ul>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Basic vs Comprehensive Test Suite
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Compare a minimal test that only checks the happy path with a
        comprehensive test suite that covers all four categories:
      </p>

      <CodeDiff
        solidity={`// BASIC: Only tests happy path
describe("Token", function () {
  it("should mint tokens", async () => {
    const tx = await token.mint(
      encryptedAmount, proof
    );
    await tx.wait();
    // No assertion on the result!
    // Just checks it didn't revert
  });

  it("should transfer", async () => {
    await token.transfer(
      addr1, encAmount, proof
    );
    // Again, no verification
    // of the encrypted balance
  });
});`}
        fhevm={`// COMPREHENSIVE: All 4 categories
describe("Token", function () {
  // FUNCTIONAL
  it("should mint tokens", async () => {
    await token.mint(encAmt, proof);
    // Decrypt and verify balance
    const bal = await decrypt(
      token, "balances", owner
    );
    expect(bal).to.equal(1000n);
  });

  // PERMISSION
  it("rejects unauthorized decrypt",
    async () => {
    await expect(
      decrypt(token, "balances", attacker)
    ).to.be.reverted;
  });

  // EDGE CASE
  it("handles overflow", async () => {
    // Transfer more than balance
    await token.transfer(
      addr1, overflowAmt, proof
    );
    // Balance unchanged (FHE.select)
    const bal = await decrypt(
      token, "balances", owner
    );
    expect(bal).to.equal(1000n);
  });

  // INTEGRATION
  it("multi-user transfer", async () => {
    await token.transfer(
      addr1, encAmt, proof
    );
    const senderBal = await decrypt(
      token, "balances", owner
    );
    const recipBal = await decrypt(
      token, "balances", addr1
    );
    expect(senderBal).to.equal(500n);
    expect(recipBal).to.equal(500n);
  });
});`}
        solidityFilename="basic.test.ts"
        fhevmFilename="comprehensive.test.ts"
        highlightLines={[7, 8, 9, 10, 14, 15, 16, 17, 18, 22, 23, 24, 25, 26, 27, 28, 29, 30, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        FHE-Specific Assertions
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The key challenge: you cannot directly assert on encrypted values. You
        must decrypt first, then compare. Here is the pattern:
      </p>

      <CodeDiff
        solidity={`// Standard Assertion
it("checks balance", async () => {
    const balance =
        await token.balanceOf(owner);
    // Direct comparison -- value is
    // a plain uint256
    expect(balance).to.equal(1000);
});`}
        fhevm={`// FHE-Specific Assertion
it("checks encrypted balance",
    async () => {
    // Step 1: Get the encrypted handle
    const handle =
        await token.balanceOf(owner);
    // Step 2: Decrypt in mock mode
    //   (uses fhevm test helpers)
    const cleartext =
        await decrypt64(handle);
    // Step 3: Assert on plaintext
    expect(cleartext).to.equal(1000n);
});`}
        solidityFilename="standard-assertion.test.ts"
        fhevmFilename="fhe-assertion.test.ts"
        highlightLines={[4, 5, 6, 7, 8, 9, 10, 11, 12]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Complete Test File
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is a complete test file for a confidential token, demonstrating all
        four test categories:
      </p>

      <CodeBlock
        code={`import { expect } from "chai";
import { ethers } from "hardhat";
import { createInstances } from "../instance";
import { getSigners } from "../signers";
import { deployTokenFixture } from "./fixtures";

describe("ConfidentialToken", function () {
  let token: any;
  let owner: any, alice: any, bob: any;
  let instances: any;

  beforeEach(async function () {
    const signers = await getSigners();
    owner = signers.alice;
    alice = signers.bob;
    bob = signers.carol;
    const deployment = await deployTokenFixture();
    token = deployment.token;
    instances = await createInstances(token, signers);
  });

  // ==========================================
  // FUNCTIONAL TESTS
  // ==========================================

  describe("Functional", function () {
    it("should mint initial supply to owner", async function () {
      const handle = await token.balanceOf(owner.address);
      const balance = await instances.alice.decrypt64(handle);
      expect(balance).to.equal(10000n);
    });

    it("should transfer tokens between accounts", async function () {
      const input = instances.alice.createEncryptedInput(
        token.target, owner.address
      );
      input.add64(500);
      const encAmount = input.encrypt();

      await token.connect(owner).transfer(
        alice.address, encAmount.handles[0], encAmount.inputProof
      );

      const aliceHandle = await token.balanceOf(alice.address);
      const aliceBalance = await instances.bob.decrypt64(aliceHandle);
      expect(aliceBalance).to.equal(500n);
    });
  });

  // ==========================================
  // PERMISSION TESTS
  // ==========================================

  describe("Permissions", function () {
    it("should allow owner to view own balance", async function () {
      const handle = await token.balanceOf(owner.address);
      // Owner has ACL permission -- decrypt succeeds
      const balance = await instances.alice.decrypt64(handle);
      expect(balance).to.be.a("bigint");
    });

    it("should reject unauthorized balance view", async function () {
      const handle = await token.balanceOf(owner.address);
      // Bob does NOT have ACL permission on owner's balance
      await expect(
        instances.carol.decrypt64(handle)
      ).to.be.reverted;
    });
  });

  // ==========================================
  // EDGE CASE TESTS
  // ==========================================

  describe("Edge Cases", function () {
    it("should handle transfer exceeding balance (overflow guard)", async function () {
      const input = instances.alice.createEncryptedInput(
        token.target, owner.address
      );
      input.add64(99999); // more than the 10000 balance
      const encAmount = input.encrypt();

      await token.connect(owner).transfer(
        alice.address, encAmount.handles[0], encAmount.inputProof
      );

      // Balance should be UNCHANGED (FHE.select guard)
      const handle = await token.balanceOf(owner.address);
      const balance = await instances.alice.decrypt64(handle);
      expect(balance).to.equal(10000n); // no deduction
    });

    it("should handle zero-value transfer", async function () {
      const input = instances.alice.createEncryptedInput(
        token.target, owner.address
      );
      input.add64(0);
      const encAmount = input.encrypt();

      await token.connect(owner).transfer(
        alice.address, encAmount.handles[0], encAmount.inputProof
      );

      const handle = await token.balanceOf(owner.address);
      const balance = await instances.alice.decrypt64(handle);
      expect(balance).to.equal(10000n); // unchanged
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe("Integration", function () {
    it("should handle multi-hop transfers", async function () {
      // Owner -> Alice -> Bob
      const input1 = instances.alice.createEncryptedInput(
        token.target, owner.address
      );
      input1.add64(1000);
      const enc1 = input1.encrypt();

      await token.connect(owner).transfer(
        alice.address, enc1.handles[0], enc1.inputProof
      );

      const input2 = instances.bob.createEncryptedInput(
        token.target, alice.address
      );
      input2.add64(300);
      const enc2 = input2.encrypt();

      await token.connect(alice).transfer(
        bob.address, enc2.handles[0], enc2.inputProof
      );

      // Verify all three balances
      const ownerBal = await instances.alice.decrypt64(
        await token.balanceOf(owner.address)
      );
      const aliceBal = await instances.bob.decrypt64(
        await token.balanceOf(alice.address)
      );
      const bobBal = await instances.carol.decrypt64(
        await token.balanceOf(bob.address)
      );

      expect(ownerBal).to.equal(9000n);
      expect(aliceBal).to.equal(700n);
      expect(bobBal).to.equal(300n);
    });
  });
});`}
        lang="typescript"
        filename="ConfidentialToken.test.ts"
      />

      <CalloutBox type="tip" title="Always Test Unauthorized Access">
        Always test what happens when ACL is wrong -- it is the most common bug
        source in FHEVM contracts. If your tests do not include at least one
        case where an unauthorized address tries to decrypt, your test suite is
        incomplete.
      </CalloutBox>

      <CalloutBox type="info" title="Mock Mode for CI/CD">
        In CI/CD pipelines, use mock mode -- it is deterministic and fast.
        Mock mode simulates FHE operations without actual encryption, so tests
        run in seconds instead of minutes. Configure your Hardhat config to use
        mock mode for automated testing, and real FHE only for manual testnet
        verification.
      </CalloutBox>

      <Quiz
        question={{
          id: "4.4-q1",
          question:
            "Why should you test with unauthorized addresses in FHEVM contracts?",
          options: [
            "To verify gas costs for different users",
            "To check that the contract compiles correctly for all addresses",
            "Because ACL misconfiguration is the most common bug -- unauthorized decrypt must fail, not succeed or return garbage",
            "To ensure the contract supports multi-chain deployment",
          ],
          correctIndex: 2,
          explanation:
            "The ACL system controls who can access encrypted data. If FHE.allow or FHE.allowThis is missing or misconfigured, unauthorized parties might access encrypted values. Testing with unauthorized addresses verifies that the permission system actually blocks unauthorized access, catching the most common category of FHEVM bugs.",
        }}
      />

      <Quiz
        question={{
          id: "4.4-q2",
          question:
            "How do you assert that an encrypted value equals an expected plaintext in a test?",
          options: [
            "Compare the encrypted handle directly with the plaintext value",
            "Use a special FHE assertion library that compares ciphertexts",
            "Decrypt the handle first using the test helper (e.g., decrypt64), then use standard expect/assert on the resulting plaintext",
            "Call FHE.eq() on-chain and check the return value",
          ],
          correctIndex: 2,
          explanation:
            "You cannot directly compare encrypted handles with plaintext values. The correct pattern is: (1) get the encrypted handle from the contract, (2) decrypt it using the test helper (decrypt64, decrypt32, etc.) in mock mode, (3) use standard assertions (expect, assert) on the decrypted plaintext value.",
        }}
      />

      <Quiz
        question={{
          id: "4.4-q3",
          question:
            "Given this test, what edge case is missing?\n\ndescribe('Vault', () => {\n  it('deposits tokens', async () => { ... });\n  it('withdraws tokens', async () => { ... });\n  it('rejects unauthorized withdraw', async () => { ... });\n});",
          options: [
            "A test for deploying the contract",
            "A test for withdrawing more than the deposited amount (overflow guard verification)",
            "A test for changing the contract owner",
            "A test for emitting events",
          ],
          correctIndex: 1,
          explanation:
            "The test suite covers functional (deposit, withdraw) and permission (unauthorized withdraw) cases, but is missing edge case testing. The most critical edge case for a vault is attempting to withdraw more than the balance -- this verifies the FHE.ge + FHE.select overflow protection works correctly and the balance remains unchanged when funds are insufficient.",
        }}
      />

      <InstructorNotes>
        <p>
          Testing FHE contracts is different from standard Solidity. The
          handle-based approach requires new mental models.
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            Start by showing the &quot;decrypt then assert&quot; pattern -- this
            is the biggest conceptual shift from standard Solidity testing.
          </li>
          <li>
            Walk through the permission test: emphasize that this is NOT testing
            if the contract reverts, but testing if the ACL actually prevents
            unauthorized decryption. These are different failure modes.
          </li>
          <li>
            The overflow guard test is critical: students must understand that
            FHE.sub will wrap (not revert!) without the FHE.ge + FHE.select
            guard. A passing overflow test proves the guard works.
          </li>
          <li>
            Mention that mock mode determinism is both a feature and a
            limitation: tests are fast and reproducible, but they do not test
            real encryption latency or gas costs. Recommend testnet runs before
            final submission.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
