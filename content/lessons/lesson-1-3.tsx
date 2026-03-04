import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson1_3Meta = {
  learningObjective:
    "Set up a complete FHEVM development environment with Hardhat, fhevm plugin, and mock mode for local testing.",
}

export function Lesson1_3Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        Before writing your first FHEVM contract, you need a properly
        configured development environment. FHEVM development uses Hardhat --
        the same tool you already know from standard Solidity development --
        with Zama&apos;s FHEVM plugin that adds support for encrypted types,
        operations, and mock mode testing. By the end of this lesson, you will
        have a working project that can compile and test FHEVM contracts
        locally without any connection to external networks.
      </p>

      <p className="text-text-secondary leading-relaxed">
        The single most important concept in this lesson is{" "}
        <strong>mock mode</strong>. Real FHE computation requires connection to
        Zama&apos;s coprocessor network, which is slow (each operation takes
        seconds) and requires testnet ETH. Mock mode simulates all FHE
        operations locally using plaintext values under the hood, but exposes
        the exact same Solidity API. This means code you write and test in
        mock mode works identically on testnet and mainnet -- zero code changes
        required. Zama recommends developing in mock mode for 99% of your
        workflow and only deploying to testnet for final validation.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Prerequisites
      </h2>

      <CodeBlock
        code={`# Check your environment
node --version    # Must be v18 or higher (v20 recommended)
npm --version     # v9+ recommended
npx hardhat --version  # Optional: verify Hardhat is accessible

# If Node.js is outdated, install via nvm:
nvm install 20
nvm use 20`}
        lang="shellscript"
        filename="terminal"
      />

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Project Initialization
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Let&apos;s create a new Hardhat project and install the FHEVM
        dependencies. The{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          fhevm
        </code>{" "}
        package includes the Solidity library with all encrypted types and
        operations, plus the Hardhat plugin for mock mode testing.
      </p>

      <CodeBlock
        code={`# Create project directory
mkdir fhe-academy-week1 && cd fhe-academy-week1

# Initialize Hardhat (choose TypeScript project)
npx hardhat init
# Select: "Create a TypeScript project"
# Accept defaults for all prompts

# Install FHEVM dependencies
npm install fhevm

# Your project structure:
# fhe-academy-week1/
#   contracts/       <- Solidity contracts go here
#   test/            <- Test files go here
#   hardhat.config.ts
#   package.json`}
        lang="shellscript"
        filename="terminal"
      />

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Hardhat Configuration
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The most critical step is configuring Hardhat to use the FHEVM plugin.
        Compare the standard Hardhat config with the FHEVM-enabled version:
      </p>

      <CodeDiff
        solidity={`// Standard hardhat.config.ts
import { HardhatUserConfig }
    from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.8.24",
};

export default config;`}
        fhevm={`// FHEVM hardhat.config.ts
import { HardhatUserConfig }
    from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "fhevm/hardhat";  // FHEVM plugin

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            evmVersion: "cancun",
        },
    },
};

export default config;`}
        solidityFilename="hardhat.config.ts"
        fhevmFilename="hardhat.config.ts (FHEVM)"
        highlightLines={[4, 7, 8, 9, 10, 11]}
      />

      <p className="text-text-secondary leading-relaxed">
        Two key changes: the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          fhevm/hardhat
        </code>{" "}
        import activates the FHEVM plugin which overrides the local Hardhat
        network to include mock FHE operations, and the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          evmVersion: &quot;cancun&quot;
        </code>{" "}
        setting ensures compatibility with the latest EVM opcodes that FHEVM
        relies on.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Your First FHEVM Contract
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Now let&apos;s verify the setup works by creating a minimal FHEVM
        contract. Compare the imports and structure:
      </p>

      <CodeDiff
        solidity={`// Standard Solidity import
// contracts/SimpleStorage.sol
pragma solidity ^0.8.24;

contract SimpleStorage {
    uint32 private _value;

    function store(uint32 v) external {
        _value = v;
    }

    function retrieve()
        external view
        returns (uint32)
    {
        return _value;
    }
}`}
        fhevm={`// FHEVM import with ZamaEthereumConfig
// contracts/FHESimpleStorage.sol
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 }
    from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig }
    from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHESimpleStorage
    is ZamaEthereumConfig
{
    euint32 private _value;

    function store(
        externalEuint32 input,
        bytes calldata inputProof
    ) external {
        _value = FHE.fromExternal(
            input, inputProof
        );
        FHE.allowThis(_value);
        FHE.allow(_value, msg.sender);
    }

    function retrieve()
        external view
        returns (euint32)
    {
        return _value;
    }
}`}
        solidityFilename="SimpleStorage.sol"
        fhevmFilename="FHESimpleStorage.sol"
        highlightLines={[5, 6, 7, 8, 10, 11, 13, 15, 16, 17, 19, 20, 22, 23]}
      />

      <CodeBlock
        code={`# Compile the contract to verify everything works
npx hardhat compile

# Expected output:
# Compiled 1 Solidity file successfully
# (with FHEVM plugin, mock contracts are also compiled)`}
        lang="shellscript"
        filename="terminal"
      />

      <CalloutBox type="tip" title="Mock Mode is NOT Fake">
        Mock mode is not a &quot;fake&quot; or simplified version of FHEVM. It
        implements the exact same Solidity API -- every function signature,
        every type, every operation is identical. The only difference is that
        mock mode uses plaintext arithmetic under the hood instead of actual
        FHE computation. Code written in mock mode deploys to testnet or
        mainnet without any changes. Think of it like testing with an in-memory
        database instead of PostgreSQL -- same interface, different backend.
      </CalloutBox>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Understanding Mock Mode
      </h2>

      <p className="text-text-secondary leading-relaxed">
        When you run{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          npx hardhat test
        </code>{" "}
        locally, the FHEVM plugin replaces the FHE coprocessor with mock
        contracts that simulate all operations in plaintext. Here is what
        happens under the hood:
      </p>

      <CodeBlock
        code={`Mock Mode Behavior:

FHE.add(a, b)          -> Plaintext: a + b (instant)
FHE.mul(a, b)          -> Plaintext: a * b (instant)
FHE.fromExternal(...)  -> Extracts value from input (no ZKPoK verification)
FHE.allowThis(handle)  -> Records permission (no cryptographic ACL)
FHE.allow(handle, addr)-> Records permission (no cryptographic ACL)

Real Network Behavior:

FHE.add(a, b)          -> Coprocessor FHE computation (~1-3 seconds)
FHE.mul(a, b)          -> Coprocessor FHE computation (~2-5 seconds)
FHE.fromExternal(...)  -> Verifies ZKPoK + converts ciphertext
FHE.allowThis(handle)  -> Cryptographic ACL on coprocessor
FHE.allow(handle, addr)-> Cryptographic ACL on coprocessor

Key insight: YOUR CODE IS IDENTICAL in both environments.
Only the backend implementation changes.`}
        lang="typescript"
        filename="mock-vs-real.txt"
      />

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        VS Code Extensions
      </h2>

      <p className="text-text-secondary leading-relaxed">
        For the best development experience, install these VS Code extensions:
        <strong> Solidity</strong> (by Nomic Foundation) for syntax
        highlighting and inline error checking,{" "}
        <strong>Hardhat Solidity</strong> for navigation and autocompletion
        in Hardhat projects, and <strong>Even Better TOML</strong> if you use{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          foundry.toml
        </code>{" "}
        configs. The Solidity extension will recognize FHEVM types like{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          euint32
        </code>{" "}
        and{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          externalEuint32
        </code>{" "}
        as long as the{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          fhevm
        </code>{" "}
        package is installed in your project.
      </p>

      <Quiz
        question={{
          id: "1.3-q1",
          question:
            "Why do we develop in mock mode instead of directly on testnet?",
          options: [
            "Mock mode supports more features than testnet",
            "Testnet is only available during business hours",
            "Faster development, no gas costs, same API -- code works identically on mainnet",
            "Mock mode provides better error messages",
          ],
          correctIndex: 2,
          explanation:
            "Mock mode simulates all FHE operations locally with instant results and zero gas costs. Crucially, it implements the exact same Solidity API as the production network, so code written in mock mode deploys to testnet or mainnet without any changes. This is Zama's recommended development workflow.",
        }}
      />

      <Quiz
        question={{
          id: "1.3-q2",
          question:
            "What does fhevm-mocks simulate in the local Hardhat environment?",
          options: [
            "Only the encrypted type system, not the operations",
            "All FHE operations: encryption, computation, and decryption -- using plaintext under the hood",
            "Only the ACL permission system",
            "A simplified version of FHE with reduced security",
          ],
          correctIndex: 1,
          explanation:
            "fhevm-mocks simulates the complete FHEVM stack locally: all encrypted types, all FHE operations (add, mul, select, etc.), input validation, and ACL permissions. Under the hood, it uses plaintext arithmetic for instant results, but the Solidity interface is identical to the production environment.",
        }}
      />

      <InstructorNotes>
        <p>
          This lesson is where students will encounter their first setup issues.
          Common problems and solutions:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>Wrong Node.js version:</strong> FHEVM requires Node 18+.
            Most issues come from students running Node 16 or earlier. Have them
            use <code>nvm</code> to switch versions.
          </li>
          <li>
            <strong>npm permission errors:</strong> On macOS/Linux, students may
            need <code>sudo</code> or should configure npm to use a user-level
            directory.
          </li>
          <li>
            <strong>Hardhat version conflicts:</strong> If students have an
            older global Hardhat installation, it may conflict with the project
            version. Solution: <code>npx hardhat</code> always uses the local
            version.
          </li>
          <li>
            <strong>Compilation errors:</strong> If{" "}
            <code>npx hardhat compile</code> fails, the most common cause is
            missing the <code>fhevm</code> npm package or forgetting to add{" "}
            <code>import &quot;fhevm/hardhat&quot;</code> to the config.
          </li>
        </ul>
        <p className="mt-2">
          Emphasize repeatedly: mock mode fidelity is what makes FHEVM
          development practical. Without it, every iteration cycle would take
          minutes instead of milliseconds. If running as a cohort, do this
          lesson as a live coding session and have students follow along.
        </p>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
