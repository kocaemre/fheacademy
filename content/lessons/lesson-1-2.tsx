import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson1_2Meta = {
  learningObjective:
    "Map out Zama's technology stack and understand how FHEVM's symbolic execution model enables encrypted computation on public blockchains.",
}

export function Lesson1_2Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        Zama is the company behind FHEVM, but FHEVM is just one layer in a
        comprehensive technology stack designed to bring Fully Homomorphic
        Encryption to every developer. Understanding how the pieces fit
        together will help you reason about what happens when your contract
        calls{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.add(a, b)
        </code>{" "}
        and why confidential smart contracts are possible without modifying the
        EVM itself.
      </p>

      <p className="text-text-secondary leading-relaxed">
        At the foundation of everything is <strong>TFHE-rs</strong> -- Zama&apos;s
        Rust implementation of the TFHE (Torus Fully Homomorphic Encryption)
        scheme. This is the cryptographic engine that performs the actual
        encrypted computation. On top of TFHE-rs sits <strong>FHEVM</strong> --
        the Solidity library that gives smart contract developers a familiar
        API for working with encrypted types and operations. FHEVM is what you
        will use throughout this course. Zama also offers{" "}
        <strong>Concrete ML</strong> for privacy-preserving machine learning,
        but that is outside our scope. Finally, the{" "}
        <strong>Zama Protocol</strong> is the production infrastructure:
        coprocessor nodes, the Key Management System (KMS), and network
        configuration.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        How FHEVM Works: Symbolic Execution
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is the key architectural insight that makes FHEVM possible: the
        EVM itself never performs FHE computation. When your contract calls{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.add(a, b)
        </code>
        , the host chain does not add two ciphertexts together. Instead, it
        works with <strong>handles</strong> -- opaque pointers (similar to
        bytes32 values) that reference ciphertexts stored off-chain. The EVM
        produces a new handle for the result and emits an event. Coprocessor
        nodes pick up this event, perform the actual FHE computation on the
        ciphertexts, and store the result. The handle now points to the
        computed ciphertext. This is called <strong>symbolic execution</strong>{" "}
        because the EVM manipulates symbols (handles) rather than the actual
        encrypted data.
      </p>

      <CalloutBox type="info" title="Symbolic Execution">
        The EVM works with handles, not ciphertexts. Think of handles as
        pointers or references to encrypted data stored on coprocessor nodes.
        When you see{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          euint32
        </code>{" "}
        in Solidity, it is actually a bytes32 handle under the hood. The
        coprocessor does the heavy lifting of FHE computation, allowing the
        host chain to run at normal EVM speeds.
      </CalloutBox>

      <CodeDiff
        solidity={`// Standard Solidity Contract
pragma solidity ^0.8.24;

// No special imports needed

contract MyContract {
    uint32 private _value;

    function setValue(uint32 v) external {
        _value = v;
    }

    function getValue()
        external view
        returns (uint32)
    {
        return _value;
    }
}`}
        fhevm={`// FHEVM Contract Structure
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 }
    from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig }
    from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyContract is ZamaEthereumConfig {
    euint32 private _value;

    function setValue(
        externalEuint32 input,
        bytes calldata inputProof
    ) external {
        euint32 v = FHE.fromExternal(
            input, inputProof
        );
        _value = v;
        FHE.allowThis(_value);
        FHE.allow(_value, msg.sender);
    }

    function getValue()
        external view
        returns (euint32)
    {
        return _value;
    }
}`}
        solidityFilename="MyContract.sol"
        fhevmFilename="MyFHEContract.sol"
      />

      <p className="text-text-secondary leading-relaxed">
        The structural differences between a standard Solidity contract and an
        FHEVM contract are consistent and predictable. You always: (1) import
        the FHE library and types, (2) inherit from{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ZamaEthereumConfig
        </code>{" "}
        for automatic coprocessor configuration, (3) replace plaintext types
        with encrypted equivalents, (4) use{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.fromExternal
        </code>{" "}
        to validate encrypted inputs, and (5) set ACL permissions after every
        state mutation. This pattern is what we call the{" "}
        <strong>Migration Mindset</strong> -- you will apply it to every
        contract you build in this course.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        FHEVM Contract Boilerplate
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Every FHEVM contract starts with the same boilerplate. The{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ZamaEthereumConfig
        </code>{" "}
        base contract automatically configures the coprocessor connection and
        network settings based on the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          chainId
        </code>
        . You do not need to manually specify addresses or endpoints -- just
        inherit and you are ready to go.
      </p>

      <CodeBlock
        code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Import FHE library and specific encrypted types
import { FHE, euint32, externalEuint32 }
    from "@fhevm/solidity/lib/FHE.sol";

// Auto-configures coprocessor + network settings
import { ZamaEthereumConfig }
    from "@fhevm/solidity/config/ZamaConfig.sol";

// Inherit ZamaEthereumConfig -- this sets up everything
contract MyContract is ZamaEthereumConfig {
    // Your encrypted state and logic here
}`}
        lang="solidity"
        filename="boilerplate.sol"
      />

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Key Management System (KMS)
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Decryption in FHEVM is handled by the Key Management System (KMS),
        which uses threshold decryption via Multi-Party Computation (MPC). No
        single party -- not even Zama -- can decrypt data alone. Decryption
        requires cooperation of multiple KMS nodes. Currently, there are 13 MPC
        nodes running in AWS Nitro Enclaves. This design eliminates single
        points of trust and ensures that encrypted data remains confidential
        even if some nodes are compromised. In FHEVM v0.9, decryption follows
        a self-relaying model: the user fetches the ciphertext handle, requests
        decryption from the KMS via the relayer SDK, and receives the plaintext
        along with a cryptographic proof that the decryption was performed
        correctly.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Performance Roadmap
      </h2>

      <p className="text-text-secondary leading-relaxed">
        FHE computation is more expensive than plaintext computation, but
        performance is improving rapidly. The current FHEVM coprocessor handles
        approximately 20 transactions per second. Zama&apos;s roadmap targets 1,000
        TPS by 2026 through software optimizations and GPU acceleration, and
        10,000+ TPS with dedicated FHE ASICs (application-specific integrated
        circuits) in the longer term. For reference, most DeFi protocols on
        Ethereum mainnet process fewer than 15 TPS during normal conditions,
        so FHEVM is already approaching practical throughput levels for many
        use cases.
      </p>

      <Quiz
        question={{
          id: "1.2-q1",
          question:
            "When your contract calls FHE.add(a, b), where does the actual FHE computation happen?",
          options: [
            "On the host chain's EVM directly",
            "On coprocessor nodes that pick up events from the host chain",
            "In the user's browser",
            "On a separate Layer 2 rollup chain",
          ],
          correctIndex: 1,
          explanation:
            "The host chain's EVM uses symbolic execution -- it manipulates handles (pointers), not ciphertexts. When FHE.add(a, b) is called, the EVM produces a new handle and emits an event. Coprocessor nodes pick up the event and perform the actual FHE computation off-chain, storing the result where the handle points.",
        }}
      />

      <Quiz
        question={{
          id: "1.2-q2",
          question:
            "Why does the KMS use multiple nodes for decryption instead of a single server?",
          options: [
            "To increase decryption speed through parallelism",
            "Because a single server cannot handle the computational load",
            "Threshold decryption via MPC -- no single point of trust or failure",
            "To comply with data residency regulations",
          ],
          correctIndex: 2,
          explanation:
            "The KMS uses threshold decryption via Multi-Party Computation (MPC). Decryption requires cooperation of multiple nodes -- no single party (not even Zama) can decrypt data alone. This eliminates single points of trust and ensures data confidentiality even if some nodes are compromised.",
        }}
      />

      <InstructorNotes>
        <p>
          The symbolic execution concept is the most important architectural
          insight in this lesson. Draw a diagram on the board:
        </p>
        <ol className="mt-2 ml-4 list-decimal space-y-1">
          <li>
            <strong>User</strong> sends encrypted input to the contract
          </li>
          <li>
            <strong>Host Chain (EVM)</strong> processes handles, emits events
          </li>
          <li>
            <strong>Coprocessor</strong> performs actual FHE computation
          </li>
          <li>
            <strong>KMS</strong> handles threshold decryption when needed
          </li>
        </ol>
        <p className="mt-2">
          Students may confuse the coprocessor model with Layer 2 solutions.
          Clarify: the coprocessor is NOT a separate chain. It is a computation
          service that extends the host chain&apos;s capabilities, similar to
          how a GPU extends a CPU. The host chain remains the source of truth
          for all state.
        </p>
        <p className="mt-2">
          A common student question: &quot;If the coprocessor does the real
          computation, isn&apos;t it centralized?&quot; Answer: the coprocessor
          network is operated by multiple independent nodes, and the KMS uses
          threshold cryptography. The trust model is distributed, not
          centralized.
        </p>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
