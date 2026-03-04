import { CodeDiff } from "@/components/content/code-diff"
import { CodeBlock } from "@/components/content/code-block"
import { Quiz } from "@/components/content/quiz"
import { QuizProvider, QuizScore } from "@/components/content/quiz-score"
import { CalloutBox } from "@/components/content/callout-box"
import { InstructorNotes } from "@/components/content/instructor-notes"

export const lesson3_3Meta = {
  learningObjective:
    "Generate encrypted random numbers on-chain using FHE and understand why FHE randomness is superior to existing solutions.",
}

export function Lesson3_3Content() {
  return (
    <QuizProvider>
      <p className="text-text-secondary leading-relaxed">
        On-chain randomness has been one of blockchain&apos;s hardest problems.
        Existing solutions (blockhash, Chainlink VRF) either produce predictable
        results or reveal the random number to everyone. FHEVM solves both
        problems: it generates random numbers that are encrypted on-chain --
        nobody can see or predict them, not even validators.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        The Problem with Current Randomness
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Standard Solidity randomness based on{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          blockhash
        </code>{" "}
        or{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-sm font-mono text-primary">
          block.prevrandao
        </code>{" "}
        is predictable -- miners/validators can manipulate it. Chainlink VRF
        provides verifiable randomness, but the random number is public once
        delivered. For games, lotteries, and any scenario where the random value
        itself must remain secret, neither solution works.
      </p>

      <CodeDiff
        solidity={`// Standard Solidity: Predictable Randomness
contract UnsafeRandom {
    function roll() external view
        returns (uint8)
    {
        // INSECURE: miners can predict
        return uint8(
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.prevrandao,
                        block.timestamp
                    )
                )
            ) % 6
        ) + 1;
    }
}`}
        fhevm={`// FHEVM: Encrypted Randomness
contract EncryptedRandom
    is ZamaEthereumConfig
{
    function roll() external
        returns (euint8)
    {
        // SECURE: encrypted, unpredictable
        euint8 randomValue =
            FHE.randEuint8();

        // Bound to 1-6 (dice)
        euint8 die = FHE.add(
            FHE.rem(randomValue, 6),
            FHE.asEuint8(1)
        );
        FHE.allowThis(die);
        FHE.allow(die, msg.sender);
        return die;
    }
}`}
        solidityFilename="UnsafeRandom.sol"
        fhevmFilename="EncryptedRandom.sol"
        highlightLines={[9, 10, 13, 14, 15, 17, 18]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        FHE Randomness vs Chainlink VRF
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Chainlink VRF delivers verifiable random numbers, but there is a
        critical difference: the random value is public. Everyone on-chain can
        see it. FHEVM randomness keeps the value encrypted -- it is verifiably
        random AND private.
      </p>

      <CodeDiff
        solidity={`// Chainlink VRF: Public Random
// 1. Request random number
requestId = COORDINATOR
    .requestRandomWords(...);

// 2. Callback with PUBLIC result
function fulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
) internal override {
    // randomWords[0] is visible
    // to EVERYONE on-chain
    publicResult = randomWords[0];
}`}
        fhevm={`// FHEVM: Encrypted Random
// Single call, immediate result
euint32 secretRandom =
    FHE.randEuint32();

// The value is encrypted --
// NOBODY can see it, not even
// validators or the contract owner

// Use in computation directly
euint32 secretScore = FHE.add(
    secretRandom,
    FHE.asEuint32(baseScore)
);
FHE.allowThis(secretScore);`}
        solidityFilename="ChainlinkVRF.sol"
        fhevmFilename="FHERandom.sol"
        highlightLines={[3, 4, 11, 12, 13, 15]}
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        FHE Random Number Functions
      </h2>

      <p className="text-text-secondary leading-relaxed">
        FHEVM provides random number generation for all major encrypted types.
        Each call generates a fresh encrypted random value within the full range
        of the type:
      </p>

      <CodeBlock
        code={`// Random number generation functions
FHE.randEuint8()    // random encrypted 8-bit  (0 to 255)
FHE.randEuint16()   // random encrypted 16-bit (0 to 65535)
FHE.randEuint32()   // random encrypted 32-bit (0 to 4294967295)
FHE.randEuint64()   // random encrypted 64-bit (0 to 2^64-1)

// Bounded randomness using FHE.rem (modulo)
euint8 diceRoll = FHE.rem(FHE.randEuint8(), 6);     // 0-5
euint8 die = FHE.add(diceRoll, FHE.asEuint8(1));     // 1-6

euint32 card = FHE.rem(FHE.randEuint32(), 52);       // 0-51 (deck of cards)
euint16 percent = FHE.rem(FHE.randEuint16(), 100);   // 0-99 (percentage)`}
        lang="solidity"
        filename="FHERandomFunctions.sol"
      />

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">
        Example: Encrypted Dice Game
      </h2>

      <p className="text-text-secondary leading-relaxed">
        Here is a simple dice game where rolls are encrypted. Neither the
        contract owner nor validators can see or predict the result until the
        player chooses to reveal it:
      </p>

      <CodeBlock
        code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptedDiceGame is ZamaEthereumConfig {
    mapping(address => euint8) private _lastRoll;
    mapping(address => euint8) private _score;

    /// @notice Roll two encrypted dice and store the sum
    function rollDice() external {
        euint8 die1 = FHE.add(FHE.rem(FHE.randEuint8(), 6), FHE.asEuint8(1));
        euint8 die2 = FHE.add(FHE.rem(FHE.randEuint8(), 6), FHE.asEuint8(1));
        euint8 total = FHE.add(die1, die2);

        _lastRoll[msg.sender] = total;
        _score[msg.sender] = FHE.add(_score[msg.sender], total);

        FHE.allowThis(_lastRoll[msg.sender]);
        FHE.allow(_lastRoll[msg.sender], msg.sender);
        FHE.allowThis(_score[msg.sender]);
        FHE.allow(_score[msg.sender], msg.sender);
    }

    /// @notice Reveal the last roll (marks for off-chain decryption)
    function revealLastRoll() external {
        FHE.makePubliclyDecryptable(_lastRoll[msg.sender]);
    }
}`}
        lang="solidity"
        filename="EncryptedDiceGame.sol"
      />

      <CalloutBox type="tip" title="Quantum-Resistant Randomness">
        FHE randomness is generated inside the encrypted domain. No amount of
        computational power -- including quantum computers -- can predict or
        observe the random value before it is decrypted. This makes it
        inherently resistant to both classical and quantum attacks on
        randomness.
      </CalloutBox>

      <Quiz
        question={{
          id: "3.3-q1",
          question:
            "Why is FHE randomness better than blockhash-based randomness?",
          options: [
            "FHE randomness is cheaper in gas",
            "FHE randomness is unpredictable AND encrypted -- miners cannot see or manipulate it",
            "FHE randomness uses a more complex hash function",
            "FHE randomness is faster to generate",
          ],
          correctIndex: 1,
          explanation:
            "Blockhash-based randomness can be predicted and manipulated by miners/validators. FHE randomness is generated inside the encrypted domain -- the value is both unpredictable and invisible to everyone on-chain, including validators. Nobody can see or influence the result.",
        }}
      />

      <Quiz
        question={{
          id: "3.3-q2",
          question:
            "How do you generate a random number between 1 and 6 using FHEVM?",
          options: [
            "FHE.randEuint8(1, 6)",
            "FHE.add(FHE.rem(FHE.randEuint8(), 6), FHE.asEuint8(1))",
            "FHE.randEuint8() % 6 + 1",
            "FHE.randomRange(1, 6)",
          ],
          correctIndex: 1,
          explanation:
            "FHE.randEuint8() generates a random value 0-255. FHE.rem(..., 6) reduces it to 0-5. FHE.add(..., FHE.asEuint8(1)) shifts to 1-6. Standard Solidity operators (%, +) cannot be used with encrypted types -- you must use FHE library functions.",
        }}
      />

      <Quiz
        question={{
          id: "3.3-q3",
          question:
            "What does Chainlink VRF reveal that FHE randomness does not?",
          options: [
            "The request ID",
            "The random number itself -- everyone on-chain can see it",
            "The seed used to generate the number",
            "The gas cost of the random generation",
          ],
          correctIndex: 1,
          explanation:
            "Chainlink VRF delivers a verifiable random number, but that number is stored as plaintext on-chain -- everyone can see it. FHE randomness keeps the random value encrypted. Only the permitted address can decrypt it via the relayer SDK. The value remains secret until explicitly decrypted.",
        }}
      />

      <InstructorNotes>
        <p>
          Students love this lesson -- encrypted randomness is immediately
          compelling. Key teaching points:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li>
            <strong>Interactive demo:</strong> Have students deploy the dice game
            in mock mode and observe that the roll result is an encrypted handle,
            not a number. Then call revealLastRoll to see the decryption flow.
          </li>
          <li>
            Compare the three approaches side by side: blockhash (predictable +
            public), Chainlink VRF (unpredictable but public), FHE (unpredictable
            + private). FHE is strictly superior for use cases where the random
            value must stay secret.
          </li>
          <li>
            <strong>Real-world applications:</strong> Card dealing (no one sees
            the deck), lottery (no one sees the winning number until reveal),
            private game state (hidden dice rolls, secret positions).
          </li>
          <li>
            Note on FHE.rem: the modulo creates a slight bias for non-power-of-2
            ranges (same as regular modulo). For most applications this is
            negligible.
          </li>
        </ul>
      </InstructorNotes>

      <QuizScore />
    </QuizProvider>
  )
}
