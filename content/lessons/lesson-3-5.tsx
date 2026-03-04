import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson3_5Meta = {
  learningObjective:
    "Design and implement sealed-bid auction and private voting patterns using FHEVM encrypted operations and ACL.",
}

export function Lesson3_5Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        This lesson brings together everything from Week 3 into two powerful
        real-world patterns: sealed-bid auctions and private voting. These
        patterns demonstrate capabilities that are <strong>impossible</strong>{" "}
        with ZKP alone -- they require the ability to compute on encrypted data,
        which only FHE provides. By the end of this lesson, you will understand
        how to build applications where sensitive data stays private even during
        computation.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Pattern 1: Sealed-Bid Auction
      </h2>

      <p className="text-text-secondary leading-relaxed">
        In a standard auction, all bids are public -- everyone can see what
        others bid and adjust accordingly. A sealed-bid auction keeps all bids
        encrypted until the auction ends. The contract compares encrypted bids
        using{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.gt
        </code>{" "}
        and{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        to find the winner without ever seeing any bid amount.
      </p>

      <CodeDiff
        solidity={`// Standard Open Auction
contract OpenAuction {
    mapping(address => uint64) public bids;
    address public highestBidder;
    uint64 public highestBid;

    function bid() external payable {
        require(
            msg.value > highestBid,
            "Bid too low"
        );
        // Everyone sees all bids
        bids[msg.sender] = uint64(msg.value);
        highestBidder = msg.sender;
        highestBid = uint64(msg.value);
    }
}`}
        fhevm={`// Sealed-Bid Auction
contract SealedAuction
    is ZamaEthereumConfig
{
    mapping(address => euint64)
        private _bids;
    euint64 private _highestBid;
    eaddress private _highestBidder;

    function placeBid(
        externalEuint64 calldata encBid,
        bytes calldata inputProof
    ) external {
        euint64 bid = FHE.fromExternal(
            encBid, inputProof
        );
        _bids[msg.sender] = bid;
        // Nobody sees the bid amount
        FHE.allowThis(bid);
        FHE.allow(bid, msg.sender);
    }
}`}
        solidityFilename="OpenAuction.sol"
        fhevmFilename="SealedAuction.sol"
        highlightLines={[5, 6, 7, 8, 10, 11, 12, 14, 15, 19, 20]}
      />

      <p className="text-text-secondary leading-relaxed">
        The key difference: in the open auction, bids are public mappings and
        the contract uses{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          require(msg.value &gt; highestBid)
        </code>{" "}
        to enforce ordering. In the sealed auction, bids are encrypted and the
        contract uses{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.gt
        </code>{" "}
        +{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.select
        </code>{" "}
        to compare bids without revealing them.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Complete Sealed-Bid Auction Contract
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is a complete sealed-bid auction contract showing bid submission,
        encrypted comparison to find the winner, and the decryption flow to
        reveal the result:
      </p>

      <CodeBlock
        code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SealedBidAuction is ZamaEthereumConfig {
    address public owner;
    bool public auctionEnded;
    uint64 public decryptedWinningBid;
    address public decryptedWinner;

    euint64 private _highestBid;
    eaddress private _highestBidder;
    mapping(address => euint64) private _bids;
    address[] private _bidders;

    constructor() {
        owner = msg.sender;
        _highestBid = FHE.asEuint64(0);
        FHE.allowThis(_highestBid);
    }

    /// @notice Submit an encrypted bid
    function placeBid(
        externalEuint64 calldata encBid,
        bytes calldata inputProof
    ) external {
        require(!auctionEnded, "Auction ended");
        euint64 bid = FHE.fromExternal(encBid, inputProof);

        _bids[msg.sender] = bid;
        _bidders.push(msg.sender);

        // Compare with current highest (encrypted comparison)
        ebool isHigher = FHE.gt(bid, _highestBid);
        _highestBid = FHE.select(isHigher, bid, _highestBid);
        _highestBidder = FHE.select(
            isHigher,
            FHE.asEaddress(msg.sender),
            _highestBidder
        );

        FHE.allowThis(_highestBid);
        FHE.allowThis(_highestBidder);
        FHE.allowThis(_bids[msg.sender]);
        FHE.allow(_bids[msg.sender], msg.sender);
    }

    /// @notice End auction and mark winner for decryption
    function endAuction() external {
        require(msg.sender == owner, "Only owner");
        require(!auctionEnded, "Already ended");
        auctionEnded = true;

        // Mark winning bid + address for public decryption
        FHE.makePubliclyDecryptable(_highestBid);
        FHE.makePubliclyDecryptable(_highestBidder);
        // Losing bids remain encrypted forever
    }

    /// @notice Callback: receive decrypted winner via relayer
    function callbackWinner(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) public {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        (uint64 winBid, address winner) = abi.decode(
            cleartexts, (uint64, address)
        );
        decryptedWinningBid = winBid;
        decryptedWinner = winner;
    }
}`}
        lang="solidity"
        filename="SealedBidAuction.sol"
      />

      <CalloutBox type="tip" title="Losing Bids Remain Encrypted Forever">
        Only the winning bid and winner address are ever decrypted. All other
        bids remain encrypted on-chain permanently. Bidders can verify their own
        bid (they have ACL permission), but no one else can see losing bid
        amounts. This is true privacy -- not just hiding data temporarily.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Pattern 2: Private Voting
      </h2>

      <p className="text-text-secondary leading-relaxed">
        In a standard voting system, votes are either public (everyone sees who
        voted for what) or require complex ZKP schemes. With FHEVM, votes are
        encrypted and tallied using{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          FHE.add
        </code>{" "}
        -- the contract accumulates encrypted votes without ever seeing
        individual choices. Only the final totals are decrypted.
      </p>

      <CodeDiff
        solidity={`// Standard Public Voting
contract PublicVoting {
    mapping(address => bool) hasVoted;
    uint64 public yesVotes;
    uint64 public noVotes;

    function vote(bool support) external {
        require(!hasVoted[msg.sender]);
        hasVoted[msg.sender] = true;
        // Everyone sees each vote
        if (support) {
            yesVotes++;
        } else {
            noVotes++;
        }
    }
}`}
        fhevm={`// Private Encrypted Voting
contract PrivateVoting
    is ZamaEthereumConfig
{
    mapping(address => bool) hasVoted;
    euint64 private encYesVotes;
    euint64 private encNoVotes;

    function vote(
        externalEbool support,
        bytes memory inputProof
    ) external {
        require(!hasVoted[msg.sender]);
        hasVoted[msg.sender] = true;
        ebool s = FHE.fromExternal(
            support, inputProof
        );
        // Nobody sees the vote
        encYesVotes = FHE.select(s,
            FHE.add(encYesVotes,
                FHE.asEuint64(1)),
            encYesVotes);
        encNoVotes = FHE.select(s,
            encNoVotes,
            FHE.add(encNoVotes,
                FHE.asEuint64(1)));
        FHE.allowThis(encYesVotes);
        FHE.allowThis(encNoVotes);
    }
}`}
        solidityFilename="PublicVoting.sol"
        fhevmFilename="PrivateVoting.sol"
        highlightLines={[6, 7, 9, 10, 11, 15, 16, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]}
      />

      <CalloutBox type="info" title="Why Private Voting Prevents Vote Buying">
        Private voting prevents vote buying and coercion because nobody can
        prove how they voted -- not even the voter themselves after the fact. If
        a voter cannot prove their choice, there is no way for a bribe-giver to
        verify compliance. This is a fundamental property that FHE provides and
        standard blockchains cannot.
      </CalloutBox>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Hiding Data vs Hiding Computation
      </h2>

      <p className="text-text-secondary leading-relaxed">
        It is important to understand the distinction between hiding data and
        hiding computation. Zero-Knowledge Proofs (ZKPs) can prove that you
        performed a computation correctly without revealing the inputs -- but the
        computation itself must happen off-chain. FHE allows computation directly
        on encrypted data on-chain. This means the contract can compare bids,
        tally votes, and determine winners without any party ever seeing the
        underlying values.
      </p>

      <p className="mt-3 text-text-secondary leading-relaxed">
        A sealed-bid auction with ZKPs would require a trusted party to open the
        bids, compare them, and publish a ZKP of the result. With FHE, the
        comparison happens on-chain on encrypted data -- no trusted party is
        needed. The same applies to voting: ZKP voting requires off-chain
        tallying, while FHE voting tallies encrypted votes directly on-chain.
      </p>

      <Quiz
        question={{
          id: "3.5-q1",
          question:
            "How does the sealed-bid auction contract find the highest bid without seeing any amounts?",
          options: [
            "It decrypts each bid temporarily during comparison",
            "It uses FHE.gt to compare encrypted bids and FHE.select to update the highest, all on encrypted data",
            "It sends all bids to an off-chain oracle for comparison",
            "It requires bidders to submit hash commitments first",
          ],
          correctIndex: 1,
          explanation:
            "The contract uses FHE.gt(bid, _highestBid) to get an encrypted boolean indicating whether the new bid is higher, then FHE.select to conditionally update _highestBid and _highestBidder. The entire comparison happens on encrypted data -- the contract never sees any bid amount. Only the final winner is decrypted after the auction ends.",
        }}
      />

      <Quiz
        question={{
          id: "3.5-q2",
          question:
            "Why does private voting with FHEVM prevent vote buying?",
          options: [
            "Because the blockchain is anonymous and voters cannot be identified",
            "Because votes are encrypted, so nobody -- including the voter -- can prove how they voted after the fact",
            "Because the contract requires a minimum deposit to vote",
            "Because vote buying is illegal and the contract enforces the law",
          ],
          correctIndex: 1,
          explanation:
            "With FHE-based private voting, votes are encrypted on-chain. After voting, there is no way for a voter to prove to a third party how they voted -- the encrypted vote cannot be selectively revealed. Without proof of compliance, vote buying becomes economically irrational because the bribe-giver cannot verify the voter followed through.",
        }}
      />

      <Quiz
        question={{
          id: "3.5-q3",
          question:
            "In the sealed-bid auction contract, what happens to losing bids after the auction ends?",
          options: [
            "They are decrypted and returned to the bidders",
            "They are deleted from the blockchain",
            "They remain encrypted on-chain permanently -- only the winner's bid is decrypted",
            "They are sent to the contract owner for review",
          ],
          correctIndex: 2,
          explanation:
            "When endAuction() is called, only _highestBid and _highestBidder are marked with FHE.makePubliclyDecryptable. All other bids in the _bids mapping remain encrypted forever. Each bidder can still verify their own bid (they have ACL permission), but nobody else can see losing bid amounts.",
        }}
      />

      <InstructorNotes>
        <p>
          These two patterns demonstrate the real power of FHE over ZKP.
          Key teaching points:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>Key insight:</strong> Both patterns are IMPOSSIBLE with ZKP
            alone. ZKP proves you did something correctly, but the actual
            computation must happen somewhere. FHE lets the computation happen
            on-chain, on encrypted data, with no trusted party.
          </li>
          <li>
            The sealed-bid auction is the Week 3 homework -- students should
            understand this pattern thoroughly before starting the assignment.
          </li>
          <li>
            The voting contract from{" "}
            <code className="text-sm">fhevm-api-reference.tsx</code> is the
            canonical reference. Walk through it line by line: the FHE.select for
            vote routing, the FHE.add for tallying, and the decryption flow for
            revealing totals.
          </li>
          <li>
            Discuss the philosophical difference: in a transparent blockchain,
            all data is public but computation is trustless. In FHE, both data
            and computation can be private AND trustless. This is a
            paradigm shift.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
