export interface Lesson {
  id: string
  slug: string
  title: string
  type: "conceptual" | "hands-on"
}

export interface Homework {
  slug: string
  title: string
}

export interface Week {
  id: number
  title: string
  goal: string
  lessons: Lesson[]
  homework: Homework
}

export const curriculum: Week[] = [
  {
    id: 1,
    title: "From Solidity to Confidential Solidity",
    goal: "Bridge from familiar Solidity to FHEVM. Set up the development environment and write the first encrypted contract.",
    lessons: [
      {
        id: "1.1",
        slug: "why-privacy-matters",
        title: "Why Privacy Matters On-Chain",
        type: "conceptual",
      },
      {
        id: "1.2",
        slug: "zama-ecosystem-overview",
        title: "Zama Ecosystem Overview",
        type: "conceptual",
      },
      {
        id: "1.3",
        slug: "development-environment-setup",
        title: "Development Environment Setup",
        type: "hands-on",
      },
      {
        id: "1.4",
        slug: "your-first-fhevm-contract",
        title: "Your First FHEVM Contract: Counter Migration",
        type: "hands-on",
      },
      {
        id: "1.5",
        slug: "testing-encrypted-contracts",
        title: "Testing Encrypted Contracts",
        type: "hands-on",
      },
    ],
    homework: {
      slug: "temperature-converter-migration",
      title: "Temperature Converter Migration",
    },
  },
  {
    id: 2,
    title: "Mastering Encrypted Types and Access Control",
    goal: "Deep dive into FHEVM's type system, all operations, and the ACL mechanism. Build a real confidential token.",
    lessons: [
      {
        id: "2.1",
        slug: "encrypted-types-deep-dive",
        title: "Encrypted Types Deep Dive",
        type: "hands-on",
      },
      {
        id: "2.2",
        slug: "operations-on-encrypted-data",
        title: "Operations on Encrypted Data",
        type: "hands-on",
      },
      {
        id: "2.3",
        slug: "encrypted-inputs-and-zkpok",
        title: "Encrypted Inputs and ZKPoK",
        type: "hands-on",
      },
      {
        id: "2.4",
        slug: "access-control-list-system",
        title: "Access Control List (ACL) System",
        type: "hands-on",
      },
      {
        id: "2.5",
        slug: "patterns-and-best-practices",
        title: "Patterns and Best Practices",
        type: "conceptual",
      },
    ],
    homework: {
      slug: "confidential-erc20-token",
      title: "Confidential ERC-20 Token",
    },
  },
  {
    id: 3,
    title: "Building Real-World Confidential dApps",
    goal: "Move from contracts to full dApps. Decryption, frontend integration, and real design patterns.",
    lessons: [
      {
        id: "3.1",
        slug: "the-decryption-mechanism",
        title: "The Decryption Mechanism",
        type: "hands-on",
      },
      {
        id: "3.2",
        slug: "encrypted-control-flow",
        title: "Conditional Logic with FHE.select",
        type: "hands-on",
      },
      {
        id: "3.3",
        slug: "on-chain-randomness",
        title: "On-Chain Randomness",
        type: "hands-on",
      },
      {
        id: "3.4",
        slug: "frontend-integration",
        title: "Frontend Integration",
        type: "hands-on",
      },
      {
        id: "3.5",
        slug: "auction-and-voting-patterns",
        title: "Design Patterns: Auction and Voting",
        type: "hands-on",
      },
    ],
    homework: {
      slug: "sealed-bid-auction-dapp",
      title: "Sealed-Bid Auction dApp",
    },
  },
  {
    id: 4,
    title: "Advanced Patterns and Capstone Project",
    goal: "Production readiness. Gas optimization, security hardening, and a capstone project.",
    lessons: [
      {
        id: "4.1",
        slug: "gas-optimization",
        title: "Gas Optimization for FHE",
        type: "conceptual",
      },
      {
        id: "4.2",
        slug: "security-best-practices",
        title: "Security Best Practices",
        type: "conceptual",
      },
      {
        id: "4.3",
        slug: "confidential-defi-concepts",
        title: "Confidential DeFi Concepts",
        type: "conceptual",
      },
      {
        id: "4.4",
        slug: "testing-strategies",
        title: "Testing Strategies",
        type: "hands-on",
      },
      {
        id: "4.5",
        slug: "testnet-deployment",
        title: "Testnet Deployment",
        type: "hands-on",
      },
    ],
    homework: {
      slug: "capstone-confidential-dapp",
      title: "Capstone: Student-Chosen Confidential dApp",
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
