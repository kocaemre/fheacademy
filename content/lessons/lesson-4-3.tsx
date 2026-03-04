import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson4_3Meta = {
  learningObjective:
    "Design confidential DeFi protocols using FHEVM primitives, including encrypted AMMs, lending protocols, and order books.",
}

export function Lesson4_3Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        Confidential DeFi is an entirely new design space enabled by FHE. It is
        not just &quot;adding privacy&quot; to existing DeFi protocols -- it
        fundamentally changes what is possible. Encrypted AMMs are immune to
        front-running. Encrypted order books prevent sandwich attacks. Private
        lending hides collateral ratios. These are capabilities that are{" "}
        <strong>impossible</strong> with ZKP alone, because ZKP can prove things
        about data but cannot compute on encrypted data on-chain.
      </p>

      <CalloutBox type="info" title="A New Design Space">
        Confidential DeFi is an entirely new design space -- not just
        &quot;adding privacy&quot; to existing DeFi. When you can compute on
        encrypted data, you can build protocols that were previously impossible:
        front-running-immune AMMs, hidden collateral lending, encrypted order
        matching. Think of this as the next evolution of DeFi.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Confidential AMM: Front-Running Immune Swaps
      </h2>

      <p className="text-text-secondary leading-relaxed">
        In a standard AMM, reserves are public. MEV bots can see pending
        transactions and front-run them by inserting their own swap before
        yours, profiting from the price impact. With a confidential AMM,
        reserves are encrypted -- no one can see the pool state, making
        front-running impossible because there is nothing to front-run.
      </p>

      <CodeDiff
        solidity={`// Standard AMM (Public Reserves)
contract PublicAMM {
    uint256 public reserveA;
    uint256 public reserveB;

    function swap(
        uint256 amountIn
    ) external {
        // Public reserves -- MEV bots
        // can see and front-run
        uint256 amountOut =
            (amountIn * reserveB)
            / (reserveA + amountIn);

        // Everyone sees the price
        // impact before it executes
        reserveA += amountIn;
        reserveB -= amountOut;
    }
}`}
        fhevm={`// Confidential AMM (Encrypted)
contract ConfidentialAMM
    is ZamaEthereumConfig
{
    euint64 private _reserveA;
    euint64 private _reserveB;

    function swap(
        externalEuint64 calldata encIn,
        bytes calldata proof
    ) external {
        euint64 amountIn =
            FHE.fromExternal(encIn, proof);
        // Encrypted reserves -- nobody
        // can see pool state
        euint64 amountOut = FHE.div(
            FHE.mul(amountIn, _reserveB),
            FHE.add(_reserveA, amountIn)
        );
        // Front-running impossible:
        // no visible price impact
        _reserveA = FHE.add(
            _reserveA, amountIn
        );
        _reserveB = FHE.sub(
            _reserveB, amountOut
        );
        FHE.allowThis(_reserveA);
        FHE.allowThis(_reserveB);
    }
}`}
        solidityFilename="PublicAMM.sol"
        fhevmFilename="ConfidentialAMM.sol"
        highlightLines={[5, 6, 9, 10, 11, 13, 14, 17, 18, 19, 20, 23, 24, 25, 26, 27, 28, 29, 30]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Encrypted Order Book
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Traditional order books expose all limit orders, enabling predatory
        strategies like spoofing, layering, and sandwich attacks. An encrypted
        order book keeps order prices and sizes encrypted. The matching engine
        runs on encrypted data, revealing only matched trades:
      </p>

      <CodeBlock
        code={`// Encrypted Order Book (Pseudocode)
// ==================================

contract EncryptedOrderBook is ZamaEthereumConfig {
    struct Order {
        address trader;
        euint64 price;    // encrypted limit price
        euint64 amount;   // encrypted order size
        ebool isBuy;      // encrypted side (buy/sell)
    }

    Order[] private orders;

    function placeOrder(
        externalEuint64 calldata encPrice,
        externalEuint64 calldata encAmount,
        externalEbool calldata encIsBuy,
        bytes calldata proof
    ) external {
        euint64 price = FHE.fromExternal(encPrice, proof);
        euint64 amount = FHE.fromExternal(encAmount, proof);
        ebool isBuy = FHE.fromExternal(encIsBuy, proof);

        orders.push(Order(msg.sender, price, amount, isBuy));
        // ACL: contract can match, trader can view own order
        FHE.allowThis(price);
        FHE.allowThis(amount);
        FHE.allowThis(isBuy);
        FHE.allow(price, msg.sender);
        FHE.allow(amount, msg.sender);
    }

    function matchOrders(uint256 buyIdx, uint256 sellIdx) external {
        Order storage buy = orders[buyIdx];
        Order storage sell = orders[sellIdx];

        // Encrypted matching: buy price >= sell price
        ebool priceMatch = FHE.ge(buy.price, sell.price);
        euint64 fillAmount = FHE.min(buy.amount, sell.amount);

        // Only fill if prices match (encrypted conditional)
        euint64 actualFill = FHE.select(
            priceMatch,
            fillAmount,
            FHE.asEuint64(0) // no fill if prices don't match
        );

        // Update remaining amounts
        buy.amount = FHE.sub(buy.amount, actualFill);
        sell.amount = FHE.sub(sell.amount, actualFill);
        FHE.allowThis(buy.amount);
        FHE.allowThis(sell.amount);
    }
}`}
        lang="solidity"
        filename="EncryptedOrderBook.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Other Confidential DeFi Concepts
      </h2>

      <p className="text-text-secondary leading-relaxed">
        The design space extends far beyond AMMs and order books:
      </p>

      <ul className="mt-3 space-y-3 text-text-secondary">
        <li className="leading-relaxed">
          <strong className="text-foreground">Confidential Lending:</strong>{" "}
          Hide collateral ratios so liquidators cannot target positions. The
          protocol can still enforce collateralization requirements using
          encrypted comparisons (FHE.ge on collateral vs debt).
        </li>
        <li className="leading-relaxed">
          <strong className="text-foreground">Private Stablecoins:</strong>{" "}
          Encrypted balances with regulatory compliance via selective
          disclosure. Auditors can receive ACL permission to view balances
          without making them public.
        </li>
        <li className="leading-relaxed">
          <strong className="text-foreground">Dark Pools:</strong>{" "}
          Institutional-grade trading where large orders are matched without
          revealing size or price to the market, eliminating information leakage.
        </li>
      </ul>

      <CalloutBox type="tip" title="FHE vs ZKP for DeFi">
        The key insight: FHE enables computation on encrypted data. ZKP can
        prove things about data but cannot compute on it. A ZKP-based AMM
        would require someone to decrypt the reserves, compute the swap
        off-chain, and submit a proof that the computation was correct. With
        FHE, the swap computation happens on-chain, on encrypted reserves,
        with no trusted party needed.
      </CalloutBox>

      <Quiz
        question={{
          id: "4.3-q1",
          question:
            "How does an encrypted AMM prevent front-running?",
          options: [
            "It uses a time-lock mechanism to delay transactions",
            "It hides the mempool from MEV bots",
            "Pool reserves are encrypted, so no one can see the price impact of a pending swap -- there is nothing to front-run",
            "It requires all swaps to go through a trusted relayer",
          ],
          correctIndex: 2,
          explanation:
            "Front-running requires knowing the current state (reserves) and the pending transaction's impact on price. With encrypted reserves, MEV bots cannot see the pool state, calculate price impact, or profitably insert a transaction ahead of the user. The information asymmetry that enables front-running is eliminated.",
        }}
      />

      <Quiz
        question={{
          id: "4.3-q2",
          question:
            "Why can't ZKP alone enable a confidential AMM?",
          options: [
            "ZKP is too slow for real-time trading",
            "ZKP can prove a computation was done correctly, but the computation itself must happen off-chain on decrypted data -- requiring a trusted party",
            "ZKP does not support mathematical operations",
            "ZKP is only available on specific blockchains",
          ],
          correctIndex: 1,
          explanation:
            "ZKP (Zero-Knowledge Proofs) can prove that a swap was computed correctly without revealing the inputs, but someone still needs to see the plaintext reserves to perform the computation. That party becomes a trust assumption. FHE eliminates this: the computation happens on-chain, on encrypted data, with no party ever seeing the reserves.",
        }}
      />

      <Quiz
        question={{
          id: "4.3-q3",
          question:
            "What advantage do encrypted order books have over traditional (public) ones?",
          options: [
            "Faster order execution",
            "Lower gas costs",
            "Orders cannot be spoofed, sandwiched, or front-run because prices and sizes are encrypted until matched",
            "They support more trading pairs",
          ],
          correctIndex: 2,
          explanation:
            "In a traditional order book, all limit orders are visible. This enables spoofing (placing fake orders to manipulate price), sandwich attacks (inserting orders around a target), and front-running. Encrypted order books hide order details, making these predatory strategies impossible because attackers cannot see the orders they would need to exploit.",
        }}
      />

      <InstructorNotes>
        <p>
          These are cutting-edge concepts. Students should understand the design
          space, not memorize implementations. This is about inspiring future
          projects.
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            Emphasize that confidential DeFi is a research frontier -- the
            pseudocode shown is conceptual. Real implementations would need
            careful gas optimization (Lesson 4.1) and security review (Lesson
            4.2).
          </li>
          <li>
            The AMM example simplifies several concerns (slippage protection,
            liquidity provision, fee collection). In practice, these would all
            use FHE operations.
          </li>
          <li>
            Ask students: &quot;What existing DeFi protocol would benefit most
            from confidential computation?&quot; This prompts thinking about the
            capstone project categories.
          </li>
          <li>
            Connect to the capstone: students choosing the &quot;Private Token
            Swap&quot; category will build on concepts from this lesson.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
