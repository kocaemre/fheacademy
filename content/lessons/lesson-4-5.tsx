import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson4_5Meta = {
  learningObjective:
    "Deploy an FHEVM contract to Ethereum Sepolia testnet, configure ZamaEthereumConfig, and interact with the deployed contract.",
}

export function Lesson4_5Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        This is the culmination of the course. You have written FHEVM contracts,
        tested them in mock mode, and built frontends that interact with them.
        Now it is time to deploy to a real testnet. The good news:{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ZamaEthereumConfig
        </code>{" "}
        handles all the network configuration automatically. Deploying an FHEVM
        contract is nearly identical to deploying a standard Solidity contract.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Sepolia Testnet Setup
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Before deploying, you need a Sepolia testnet setup. Here is what you
        need:
      </p>

      <CodeBlock
        code={`// Testnet Prerequisites
// =====================

// 1. Sepolia ETH for gas fees
//    Get testnet ETH from: https://sepoliafaucet.com
//    You need ~0.1 ETH for deployment + interactions

// 2. RPC endpoint
//    Use Alchemy, Infura, or a public Sepolia RPC
//    Example: https://sepolia.infura.io/v3/YOUR_KEY

// 3. Private key for deployment
//    NEVER use a mainnet private key on testnet!
//    Create a dedicated testnet wallet

// 4. Hardhat network config
//    Add Sepolia to your hardhat.config.ts (see below)`}
        lang="typescript"
        filename="prerequisites.md"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Standard vs FHEVM Deploy Script
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The key insight:{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          ZamaEthereumConfig
        </code>{" "}
        makes FHEVM deployment nearly identical to standard Solidity. It
        configures the coprocessor, KMS address, and network parameters
        automatically based on the chain ID:
      </p>

      <CodeDiff
        solidity={`// Standard Hardhat Deploy
import { ethers } from "hardhat";

async function main() {
    const Token = await ethers.
        getContractFactory("Token");

    const token = await Token.deploy(
        "MyToken", "MTK", 1000000
    );
    await token.waitForDeployment();

    console.log(
        "Token deployed to:",
        await token.getAddress()
    );
}

main().catch(console.error);`}
        fhevm={`// FHEVM Hardhat Deploy
import { ethers } from "hardhat";

async function main() {
    const Token = await ethers.
        getContractFactory(
            "ConfidentialToken"
        );
    // Same deploy -- ZamaEthereumConfig
    // auto-configures the coprocessor!
    const token = await Token.deploy();
    await token.waitForDeployment();

    console.log(
        "Token deployed to:",
        await token.getAddress()
    );
    // That's it -- ZamaEthereumConfig
    // handles network config
}

main().catch(console.error);`}
        solidityFilename="deploy-standard.ts"
        fhevmFilename="deploy-fhevm.ts"
        highlightLines={[6, 7, 8, 9, 10, 11, 18, 19]}
      />

      <CalloutBox type="tip" title="ZamaEthereumConfig Does the Heavy Lifting">
        ZamaEthereumConfig handles all network configuration -- you just
        inherit and deploy. It automatically detects the chain ID (Sepolia,
        mainnet, or local) and configures the coprocessor address, KMS
        endpoint, and network-specific parameters. No manual setup required.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Complete Deployment Script
      </h2>

      <CodeBlock
        code={`// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ConfidentialToken to Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(
    await ethers.provider.getBalance(deployer.address)
  ), "ETH");

  // Deploy the contract
  const TokenFactory = await ethers.getContractFactory("ConfidentialToken");
  const token = await TokenFactory.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("ConfidentialToken deployed to:", address);
  console.log("Transaction hash:", token.deploymentTransaction()?.hash);

  // Wait for confirmations
  console.log("Waiting for 5 confirmations...");
  await token.deploymentTransaction()?.wait(5);
  console.log("Deployment confirmed!");

  // Verify on Etherscan (optional)
  console.log("\\nTo verify on Etherscan:");
  console.log(\`npx hardhat verify --network sepolia \${address}\`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`}
        lang="typescript"
        filename="scripts/deploy.ts"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Mock vs Testnet Interaction
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The biggest difference between mock and testnet: decryption. In mock
        mode, decryption is instant and synchronous. On testnet, decryption
        goes through the KMS and takes real time (seconds to minutes):
      </p>

      <CodeDiff
        solidity={`// Mock Mode Interaction
import { ethers } from "hardhat";
import { decrypt64 } from
    "../test/utils";

async function mockInteraction() {
    const token = await ethers.
        getContractAt(
            "ConfidentialToken",
            DEPLOYED_ADDR
        );

    // Instant -- mock returns value
    const handle = await token.
        balanceOf(owner.address);
    const balance = decrypt64(handle);
    // Available immediately
    console.log("Balance:", balance);
}`}
        fhevm={`// Testnet Interaction
import { ethers } from "hardhat";
import { createInstance } from
    "@zama-fhe/relayer-sdk";

async function testnetInteraction() {
    const token = await ethers.
        getContractAt(
            "ConfidentialToken",
            DEPLOYED_ADDR
        );

    const instance =
        await createInstance();
    // Mark for decryption on-chain
    await token.requestDecryption();
    // Wait for KMS to process
    // (takes seconds to minutes!)
    const handle = await token.
        encryptedBalance();
    const result = await instance.
        publicDecrypt([handle]);
    const balance =
        result.values[handle];
    console.log("Balance:", balance);
}`}
        solidityFilename="mock-interaction.ts"
        fhevmFilename="testnet-interaction.ts"
        highlightLines={[3, 4, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]}
      />

      <CalloutBox type="warning" title="Testnet FHE Takes Real Time">
        Testnet FHE operations take real time -- seconds to minutes for
        decryption. Plan for async patterns in your frontend. In mock mode,
        everything is instant. On testnet, you need loading states, polling
        mechanisms, and timeout handling. This is a significant difference that
        catches many developers off guard.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Post-Deployment Interaction
      </h2>

      <CodeBlock
        code={`// scripts/interact.ts
import { ethers } from "hardhat";
import { createInstance } from "@zama-fhe/relayer-sdk";

async function main() {
  const TOKEN_ADDRESS = "0x..."; // your deployed address

  const [signer] = await ethers.getSigners();
  const token = await ethers.getContractAt(
    "ConfidentialToken", TOKEN_ADDRESS, signer
  );

  console.log("Connected to token at:", TOKEN_ADDRESS);

  // 1. Create encrypted input
  const instance = await createInstance();
  const input = instance.createEncryptedInput(
    TOKEN_ADDRESS, signer.address
  );
  input.add64(100); // amount to transfer
  const encryptedInput = input.encrypt();

  // 2. Send encrypted transfer
  console.log("Sending encrypted transfer...");
  const tx = await token.transfer(
    "0xRecipientAddress",
    encryptedInput.handles[0],
    encryptedInput.inputProof
  );
  await tx.wait();
  console.log("Transfer confirmed:", tx.hash);

  // 3. Check balance (requires decryption)
  console.log("Requesting balance decryption...");
  await token.requestBalanceDecryption();

  // 4. Wait for KMS decryption (async on testnet)
  console.log("Waiting for KMS decryption...");
  const handle = await token.encryptedBalance();
  const result = await instance.publicDecrypt([handle]);
  console.log("Your balance:", result.values[handle]);

  // Congratulations -- you just interacted with
  // a confidential smart contract on testnet!
  console.log("\\nCongratulations! You have deployed and interacted");
  console.log("with a confidential smart contract on Sepolia testnet.");
  console.log("You can now build confidential dApps on FHEVM!");
}

main().catch(console.error);`}
        lang="typescript"
        filename="scripts/interact.ts"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Congratulations!
      </h2>

      <p className="text-text-secondary leading-relaxed">
        You can now deploy confidential smart contracts to a real network. From
        zero FHE knowledge to testnet deployment in four weeks -- that is a
        significant achievement. You understand encrypted types, FHE operations,
        ACL permissions, the decryption mechanism, frontend integration, gas
        optimization, security best practices, and deployment. You are ready to
        build your capstone project and contribute to the confidential computing
        ecosystem.
      </p>

      <Quiz
        question={{
          id: "4.5-q1",
          question:
            "What does ZamaEthereumConfig configure automatically when you deploy?",
          options: [
            "Only the contract's constructor arguments",
            "The coprocessor address, KMS endpoint, and network-specific parameters based on chain ID",
            "The gas price and block limit for the transaction",
            "The Etherscan verification settings",
          ],
          correctIndex: 1,
          explanation:
            "ZamaEthereumConfig is a base contract that detects the chain ID and automatically configures the FHE coprocessor address, KMS (Key Management Service) endpoint, and other network-specific parameters. This means you can deploy the same contract to Sepolia, mainnet, or local mock without changing any configuration.",
        }}
      />

      <Quiz
        question={{
          id: "4.5-q2",
          question:
            "What is the main difference between mock mode and testnet decryption?",
          options: [
            "Mock mode uses different encrypted types",
            "Testnet decryption costs more gas",
            "Mock mode decryption is instant and synchronous, while testnet decryption goes through the KMS and takes seconds to minutes",
            "There is no difference -- they behave identically",
          ],
          correctIndex: 2,
          explanation:
            "In mock mode, FHE operations are simulated without real encryption, so decryption returns results instantly. On testnet, decryption requires communication with the KMS (Key Management Service), which involves off-chain processing. This takes real time (seconds to minutes) and requires async handling in your frontend and scripts.",
        }}
      />

      <Quiz
        question={{
          id: "4.5-q3",
          question:
            "Given this deployment script, what would need to change for a mainnet deployment?\n\nconst Token = await ethers.getContractFactory('ConfidentialToken');\nconst token = await Token.deploy();\nawait token.waitForDeployment();",
          options: [
            "The contract factory name would need to change",
            "You would need to pass the mainnet coprocessor address as a constructor argument",
            "Nothing in the deploy script -- ZamaEthereumConfig auto-detects the chain. You only need to change the Hardhat network config to point to mainnet",
            "You would need to import a different config contract",
          ],
          correctIndex: 2,
          explanation:
            "ZamaEthereumConfig auto-detects the chain ID and configures itself accordingly. The deployment script itself does not change between testnet and mainnet. The only change is in hardhat.config.ts, where you would add a mainnet network configuration with the appropriate RPC URL and deployer private key.",
        }}
      />

      <InstructorNotes>
        <p>
          This is the culmination lesson. Students should feel accomplished.
          Celebrate their progress from zero FHE to testnet deployment.
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            If possible, do a live deployment demo during the lesson. Seeing a
            contract go live on Sepolia is motivating and demystifies the
            process.
          </li>
          <li>
            Emphasize the simplicity: thanks to ZamaEthereumConfig, FHEVM
            deployment is nearly identical to standard Solidity deployment. The
            complexity is in the contract logic, not the deployment pipeline.
          </li>
          <li>
            Common pitfall: students forget that testnet decryption is async.
            Their scripts work in mock mode but hang or timeout on testnet.
            Walk through the async pattern explicitly.
          </li>
          <li>
            Connect to the capstone: students who deploy their capstone project
            to testnet will use exactly this workflow. Encourage them to start
            with mock mode, get everything working, then deploy to Sepolia as
            the final step.
          </li>
          <li>
            End the lesson with genuine congratulations. Four weeks ago, these
            students had never written an FHE operation. Now they can deploy
            confidential smart contracts. That is worth celebrating.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
