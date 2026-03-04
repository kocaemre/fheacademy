import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson1_1Meta = {
  learningObjective:
    "Understand why public blockchains have a privacy problem and how FHE compares to other privacy solutions like TEE and ZKP.",
}

export function Lesson1_1Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        Every balance, every transfer, every swap amount on a public blockchain
        is visible to anyone with an internet connection. While transparency is
        a feature for trust and auditing, it comes at a steep cost: users have
        zero financial privacy. Imagine if your bank account balance, salary
        deposits, and every purchase were publicly searchable. That is the
        reality of using Ethereum, Arbitrum, or any EVM-compatible chain today.
      </p>

      <p className="text-text-secondary leading-relaxed">
        This lack of privacy has real consequences far beyond personal
        embarrassment. MEV (Maximal Extractable Value) bots monitor the public
        mempool and extract hundreds of millions of dollars annually from
        traders through front-running and sandwich attacks. Competitors can
        monitor treasury wallets to gain unfair business intelligence. And for
        regulated industries, the tension between GDPR&apos;s right to data
        privacy and the blockchain&apos;s inherent transparency creates an
        impossible compliance situation. To bring the next wave of enterprise
        adoption and protect everyday users, blockchains need a way to keep
        data confidential while still enabling computation and verification.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        The Transparency Problem
      </h2>

      <p className="text-text-secondary leading-relaxed">
        On Ethereum, every state variable in every deployed contract is
        readable. Even variables marked{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          private
        </code>{" "}
        in Solidity are not actually private -- they simply lack a generated
        getter function. Anyone can read the raw storage slots using{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          eth_getStorageAt
        </code>
        . The{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          private
        </code>{" "}
        keyword in Solidity is an access control mechanism for other contracts,
        not a privacy feature. Consider a standard ERC-20 token: the balance
        mapping is fully visible to the entire world.
      </p>

      <CodeDiff
        solidity={`// Standard ERC-20 Transfer
// Every balance is PUBLIC on-chain
mapping(address => uint256) public balances;

function transfer(
    address to,
    uint256 amount
) external {
    require(
        balances[msg.sender] >= amount,
        "Insufficient balance"
    );
    balances[msg.sender] -= amount;
    balances[to] += amount;
}

// Anyone can call:
// balances(0xAlice) -> 10,000 USDC
// balances(0xBob)   -> 500 USDC
// Entire history on Etherscan`}
        fhevm={`// Confidential ERC-20 Transfer
// Balances are ENCRYPTED on-chain
mapping(address => euint64) private balances;

function transfer(
    address to,
    externalEuint64 encAmount,
    bytes calldata inputProof
) external {
    euint64 amount = FHE.fromExternal(
        encAmount, inputProof
    );
    // Encrypted comparison + transfer
    ebool hasEnough = FHE.ge(
        balances[msg.sender], amount
    );
    // Both branches always execute
    euint64 newSender = FHE.select(
        hasEnough,
        FHE.sub(balances[msg.sender], amount),
        balances[msg.sender]
    );
    euint64 newReceiver = FHE.select(
        hasEnough,
        FHE.add(balances[to], amount),
        balances[to]
    );
    balances[msg.sender] = newSender;
    balances[to] = newReceiver;
    FHE.allowThis(balances[msg.sender]);
    FHE.allow(balances[msg.sender], msg.sender);
    FHE.allowThis(balances[to]);
    FHE.allow(balances[to], to);
}

// balances(0xAlice) -> 0x7f3a... (handle)
// Nobody can read the actual amounts`}
        solidityFilename="ERC20.sol"
        fhevmFilename="ConfidentialERC20.sol"
      />

      <p className="text-text-secondary leading-relaxed">
        Notice the fundamental shift: in the standard version, balances are
        public integers anyone can query. In the FHEVM version, balances are
        encrypted handles -- opaque pointers to ciphertexts that only
        authorized parties can decrypt. The transfer logic itself operates
        entirely on encrypted data using{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        instead of{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          require
        </code>{" "}
        for overflow protection, because encrypted booleans cannot be evaluated
        in{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          if
        </code>{" "}
        statements.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Real-World Impact: MEV and Front-Running
      </h2>

      <p className="text-text-secondary leading-relaxed">
        MEV bots are the most visible consequence of on-chain transparency.
        These automated programs scan the mempool (the queue of pending
        transactions) and exploit the information they find. When a user
        submits a large swap on a DEX, a bot can see the pending transaction,
        place a buy order before it (front-running), let the user&apos;s trade push
        the price up, and then sell at the higher price (back-running). This
        &quot;sandwich attack&quot; happens in milliseconds and costs the user
        money on every trade. In 2023 alone, MEV bots extracted over $900
        million from Ethereum users. With encrypted transactions, the mempool
        becomes opaque -- bots cannot see what you are trading, at what price,
        or in what amount.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-semibold text-text-primary">
        Privacy Solution Comparison: TEE vs ZKP vs FHE
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Three main approaches exist for adding privacy to blockchains, each
        with different trade-offs:
      </p>

      <CodeBlock
        code={`Privacy Solutions Comparison:

TEE (Trusted Execution Environments)
  Example:     Secret Network, Oasis
  Trust model: Hardware-based (Intel SGX, ARM TrustZone)
  Strength:    Fast execution, mature tooling
  Weakness:    Hardware vulnerabilities (Spectre, Meltdown, Plundervolt)
  Risk:        Single point of hardware trust

ZKP (Zero-Knowledge Proofs)
  Example:     Zcash, Aztec, zkSync
  Trust model: Mathematical (no hardware dependency)
  Strength:    Proves statements without revealing data
  Weakness:    Cannot compute on encrypted data -- only prove facts
  Best for:    Proving eligibility, identity, compliance

FHE (Fully Homomorphic Encryption)
  Example:     Zama FHEVM
  Trust model: Mathematical (lattice-based cryptography)
  Strength:    Compute directly on encrypted data
  Weakness:    Higher computational overhead (improving rapidly)
  Best for:    Confidential DeFi, private voting, sealed auctions
  Bonus:       Quantum-resistant by design`}
        lang="typescript"
        filename="privacy-comparison.txt"
      />

      <p className="text-text-secondary leading-relaxed">
        The key distinction is this: ZKP proves statements <em>about</em> data
        without revealing the data. FHE computes <em>on</em> encrypted data
        without ever decrypting it. Both are mathematically secured (no
        hardware trust needed), but they solve different problems. ZKP answers
        &quot;can you prove X is true without showing me X?&quot; while FHE
        answers &quot;can you compute f(X) without ever seeing X?&quot; For
        building confidential smart contracts -- where the contract itself must
        operate on private data -- FHE is the natural fit.
      </p>

      <CalloutBox type="tip" title="HTTPS for Blockchain">
        Zama&apos;s vision is that FHE will do for blockchain what HTTPS did for the
        internet. Before HTTPS, sending a credit card number online was
        unthinkable. HTTPS made e-commerce possible by encrypting data in
        transit. Similarly, FHE makes confidential DeFi possible by encrypting
        data at rest and during computation. Just as you do not think about
        HTTPS when shopping online, the goal is for FHE to become invisible
        infrastructure that &quot;just works.&quot;
      </CalloutBox>

      <Quiz
        question={{
          id: "1.1-q1",
          question:
            "What is the main difference between ZKP and FHE?",
          options: [
            "ZKP is faster than FHE",
            "ZKP proves statements without revealing data; FHE allows computation on encrypted data",
            "FHE requires hardware trust; ZKP does not",
            "ZKP works on-chain; FHE only works off-chain",
          ],
          correctIndex: 1,
          explanation:
            "ZKP (Zero-Knowledge Proofs) lets you prove that a statement is true without revealing the underlying data. FHE (Fully Homomorphic Encryption) goes further: it allows actual computation on encrypted data without ever decrypting it. Both are mathematically secured, but they serve different purposes.",
        }}
      />

      <Quiz
        question={{
          id: "1.1-q2",
          question:
            "Why can't traditional encryption (like AES) solve blockchain privacy?",
          options: [
            "Traditional encryption is too slow for blockchains",
            "Traditional encryption requires a trusted third party",
            "Traditional encryption requires decryption before any computation can happen",
            "Traditional encryption does not work with Solidity",
          ],
          correctIndex: 2,
          explanation:
            "With traditional encryption schemes like AES, data must be decrypted before it can be processed. This means smart contracts would need access to the decryption key, defeating the purpose of encryption. FHE solves this by allowing computation directly on ciphertexts -- the contract never sees the plaintext.",
        }}
      />

      <Quiz
        question={{
          id: "1.1-q3",
          question:
            "What real-world problem does MEV cause for DeFi users?",
          options: [
            "It makes gas fees higher",
            "It prevents smart contracts from deploying",
            "Front-running and sandwich attacks extract value from traders",
            "It slows down block production",
          ],
          correctIndex: 2,
          explanation:
            "MEV bots monitor the public mempool and exploit the visibility of pending transactions. In sandwich attacks, a bot places trades before and after a user's swap to profit from the price movement, directly extracting value from the user. Encrypted transactions make this impossible because bots cannot see the trade details.",
        }}
      />

      <InstructorNotes>
        <p>
          Start this lesson with a live demo: go to Etherscan, pick a random
          wallet address, and show the class its entire transaction history,
          token balances, and NFT holdings. Ask: &quot;Would you want your bank
          account to be this public?&quot; This visceral demonstration makes the
          privacy problem real.
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            The TEE vs ZKP vs FHE comparison is where students get confused.
            Emphasize: ZKP proves things <em>about</em> data, FHE computes{" "}
            <em>on</em> encrypted data. Both are useful but for different
            purposes.
          </li>
          <li>
            Students often ask &quot;why not just use Tornado Cash-style
            mixing?&quot; Explain that mixing hides <em>identity</em> (who sent
            to whom), not the <em>data</em> itself (amounts, contract state).
            FHE hides the data while allowing computation on it.
          </li>
          <li>
            For the GDPR angle: mention that European regulations require the
            ability to delete personal data. On a public blockchain, data is
            immutable and visible forever -- a direct conflict. FHE sidesteps
            this because the data is encrypted and useless without decryption
            keys.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
