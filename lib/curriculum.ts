export interface Lesson {
  id: string
  slug: string
  title: string
  type: "conceptual" | "hands-on"
  duration: number // estimated minutes
}

export interface Homework {
  slug: string
  title: string
  description: string
  deliverables: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number // estimated minutes
}

export interface Week {
  id: number
  title: string
  goal: string
  learningObjectives: string[]
  lessons: Lesson[]
  homework: Homework
}

export const curriculum: Week[] = [
  {
    id: 1,
    title: "From Solidity to Confidential Solidity",
    goal: "Bridge from familiar Solidity to FHEVM. Set up the development environment and write the first encrypted contract.",
    learningObjectives: [
      "Understand why public blockchains have a privacy problem and how FHE solves it",
      "Map out Zama's technology stack and FHEVM architecture",
      "Set up a Hardhat project with FHEVM plugin and mock mode",
      "Migrate a standard Solidity contract to use FHEVM encrypted types and operations",
      "Write tests for FHEVM contracts using fhevm test helpers",
    ],
    lessons: [
      {
        id: "1.1",
        slug: "why-privacy-matters",
        title: "Why Privacy Matters On-Chain",
        type: "conceptual",
        duration: 20,
      },
      {
        id: "1.2",
        slug: "zama-ecosystem-overview",
        title: "Zama Ecosystem Overview",
        type: "conceptual",
        duration: 25,
      },
      {
        id: "1.3",
        slug: "development-environment-setup",
        title: "Development Environment Setup",
        type: "hands-on",
        duration: 30,
      },
      {
        id: "1.4",
        slug: "your-first-fhevm-contract",
        title: "Your First FHEVM Contract: Counter Migration",
        type: "hands-on",
        duration: 35,
      },
      {
        id: "1.5",
        slug: "testing-encrypted-contracts",
        title: "Testing Encrypted Contracts",
        type: "hands-on",
        duration: 30,
      },
    ],
    homework: {
      slug: "temperature-converter-migration",
      title: "Temperature Converter Migration",
      description:
        "Migrate a classical TemperatureConverter contract to FHEVM, replacing plaintext types with encrypted equivalents and implementing proper ACL permissions.",
      deliverables: [
        "Replace uint32 with euint32 for all state variables",
        "Accept encrypted input via externalEuint32 + inputProof",
        "Implement FHE arithmetic for temperature conversion",
        "Set proper ACL permissions with FHE.allowThis and FHE.allow",
      ],
      difficulty: "beginner",
      duration: 60,
    },
  },
  {
    id: 2,
    title: "Mastering Encrypted Types and Access Control",
    goal: "Deep dive into FHEVM's type system, all operations, and the ACL mechanism. Build a real confidential token.",
    learningObjectives: [
      "Know all FHEVM encrypted types and select the right type for each use case",
      "Use all arithmetic, comparison, and bitwise FHE operations",
      "Implement functions that accept encrypted inputs with ZKPoK validation",
      "Master the ACL system for multi-party permission flows",
      "Apply defensive programming patterns including overflow protection with FHE.select",
    ],
    lessons: [
      {
        id: "2.1",
        slug: "encrypted-types-deep-dive",
        title: "Encrypted Types Deep Dive",
        type: "hands-on",
        duration: 30,
      },
      {
        id: "2.2",
        slug: "operations-on-encrypted-data",
        title: "Operations on Encrypted Data",
        type: "hands-on",
        duration: 35,
      },
      {
        id: "2.3",
        slug: "encrypted-inputs-and-zkpok",
        title: "Encrypted Inputs and ZKPoK",
        type: "hands-on",
        duration: 30,
      },
      {
        id: "2.4",
        slug: "access-control-list-system",
        title: "Access Control List (ACL) System",
        type: "hands-on",
        duration: 35,
      },
      {
        id: "2.5",
        slug: "patterns-and-best-practices",
        title: "Patterns and Best Practices",
        type: "conceptual",
        duration: 25,
      },
    ],
    homework: {
      slug: "confidential-erc20-token",
      title: "Confidential ERC-20 Token",
      description:
        "Build a full confidential ERC-20 token with encrypted balances, transfers with overflow protection, and a complete allowance system.",
      deliverables: [
        "Encrypted balance mapping using euint64",
        "Transfer function with FHE.select overflow protection",
        "Approve and transferFrom with encrypted allowances",
        "Comprehensive test suite covering mint, transfer, and edge cases",
      ],
      difficulty: "intermediate",
      duration: 90,
    },
  },
  {
    id: 3,
    title: "Building Real-World Confidential dApps",
    goal: "Move from contracts to full dApps. Decryption, frontend integration, and real design patterns.",
    learningObjectives: [
      "Understand the self-relaying decryption mechanism in FHEVM v0.9",
      "Implement complex business logic using FHE.select for encrypted branching",
      "Generate and use encrypted random numbers on-chain",
      "Build a React frontend that interacts with FHEVM contracts",
      "Design and implement sealed-bid auction and private voting patterns",
    ],
    lessons: [
      {
        id: "3.1",
        slug: "the-decryption-mechanism",
        title: "The Decryption Mechanism",
        type: "hands-on",
        duration: 35,
      },
      {
        id: "3.2",
        slug: "encrypted-control-flow",
        title: "Conditional Logic with FHE.select",
        type: "hands-on",
        duration: 30,
      },
      {
        id: "3.3",
        slug: "on-chain-randomness",
        title: "On-Chain Randomness",
        type: "hands-on",
        duration: 25,
      },
      {
        id: "3.4",
        slug: "frontend-integration",
        title: "Frontend Integration",
        type: "hands-on",
        duration: 40,
      },
      {
        id: "3.5",
        slug: "auction-and-voting-patterns",
        title: "Design Patterns: Auction and Voting",
        type: "hands-on",
        duration: 35,
      },
    ],
    homework: {
      slug: "sealed-bid-auction-dapp",
      title: "Sealed-Bid Auction dApp",
      description:
        "Build a complete sealed-bid auction dApp with an FHEVM smart contract and React frontend where bids remain encrypted until the auction ends.",
      deliverables: [
        "Smart contract with placeBid, endAuction, and revealWinner functions",
        "Encrypted bid comparison using FHE.gt and FHE.select",
        "React frontend for bid submission and winner reveal",
        "At least 3 test scenarios covering the full auction lifecycle",
      ],
      difficulty: "advanced",
      duration: 120,
    },
  },
  {
    id: 4,
    title: "Advanced Patterns and Capstone Project",
    goal: "Production readiness. Gas optimization, security hardening, and a capstone project.",
    learningObjectives: [
      "Understand FHE operation costs and apply gas optimization strategies",
      "Conduct security reviews of FHEVM contracts using an audit checklist",
      "Design confidential DeFi protocols using FHEVM primitives",
      "Write comprehensive test suites for FHEVM contracts",
      "Deploy FHEVM contracts to Ethereum Sepolia testnet",
    ],
    lessons: [
      {
        id: "4.1",
        slug: "gas-optimization",
        title: "Gas Optimization for FHE",
        type: "conceptual",
        duration: 25,
      },
      {
        id: "4.2",
        slug: "security-best-practices",
        title: "Security Best Practices",
        type: "conceptual",
        duration: 25,
      },
      {
        id: "4.3",
        slug: "confidential-defi-concepts",
        title: "Confidential DeFi Concepts",
        type: "conceptual",
        duration: 20,
      },
      {
        id: "4.4",
        slug: "testing-strategies",
        title: "Testing Strategies",
        type: "hands-on",
        duration: 35,
      },
      {
        id: "4.5",
        slug: "testnet-deployment",
        title: "Testnet Deployment",
        type: "hands-on",
        duration: 40,
      },
    ],
    homework: {
      slug: "capstone-confidential-dapp",
      title: "Capstone: Student-Chosen Confidential dApp",
      description:
        "Design, build, and deploy your own confidential dApp using FHEVM. Choose from categories: voting, token swap, encrypted credentials, or privacy-preserving game.",
      deliverables: [
        "Smart contract deployed to testnet or working in mock mode",
        "Test suite with minimum 5 test cases",
        "Simple React frontend",
        "README with architecture and FHEVM features used",
      ],
      difficulty: "advanced",
      duration: 180,
    },
  },
]

export function getWeek(weekId: number): Week | undefined {
  return curriculum.find((w) => w.id === weekId)
}

export function getLesson(
  weekId: number,
  lessonSlug: string
): Lesson | undefined {
  const week = getWeek(weekId)
  if (!week) return undefined
  return week.lessons.find((l) => l.slug === lessonSlug)
}

export function getAllLessons(): Array<{ weekId: number; lesson: Lesson }> {
  const result: Array<{ weekId: number; lesson: Lesson }> = []
  for (const week of curriculum) {
    for (const lesson of week.lessons) {
      result.push({ weekId: week.id, lesson })
    }
  }
  return result
}

export function getAllHomeworks(): Array<{
  weekId: number
  homework: Homework
}> {
  return curriculum.map((week) => ({
    weekId: week.id,
    homework: week.homework,
  }))
}

export function getAdjacentLessons(
  weekId: number,
  lessonSlug: string
): {
  prev?: { weekId: number; lesson: Lesson }
  next?: { weekId: number; lesson: Lesson }
} {
  const all = getAllLessons()
  const currentIndex = all.findIndex(
    (entry) => entry.weekId === weekId && entry.lesson.slug === lessonSlug
  )

  if (currentIndex === -1) return {}

  return {
    prev: currentIndex > 0 ? all[currentIndex - 1] : undefined,
    next: currentIndex < all.length - 1 ? all[currentIndex + 1] : undefined,
  }
}
