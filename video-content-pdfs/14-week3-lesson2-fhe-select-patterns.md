# Week 3 - Lesson 3.2: Conditional Logic with FHE.select

## Learning Objective
Master advanced FHE.select patterns including chaining, nesting, tiered pricing, and clamping.

---

## Deep Dive into Encrypted Branching

We introduced FHE.select in Week 2. Now we explore advanced patterns that enable complex business logic entirely on encrypted data.

### Recap: Basic FHE.select

```solidity
euint32 result = FHE.select(condition, valueIfTrue, valueIfFalse);
```

- `condition` is an `ebool` (encrypted boolean)
- Both branches are ALWAYS computed
- The system selects the correct result without knowing which one

---

## Pattern 1: Tiered Pricing

Implement different prices based on encrypted quantity thresholds:

```solidity
function calculatePrice(euint32 quantity) internal returns (euint32) {
    // Tier 1: quantity > 100 → price = 5
    // Tier 2: quantity > 50  → price = 8
    // Tier 3: quantity <= 50 → price = 10

    ebool isTier1 = FHE.gt(quantity, 100);
    ebool isTier2 = FHE.gt(quantity, 50);

    euint32 price = FHE.select(
        isTier1,
        FHE.asEuint32(5),     // Tier 1 price
        FHE.select(
            isTier2,
            FHE.asEuint32(8),   // Tier 2 price
            FHE.asEuint32(10)   // Tier 3 price
        )
    );

    return FHE.mul(quantity, price);
}
```

**How it works:** The outer FHE.select checks for Tier 1. If false, the inner FHE.select checks for Tier 2. All three prices are computed, but only the correct one is selected.

---

## Pattern 2: Min/Max Clamping

Ensure values stay within bounds:

```solidity
// Clamp value to [min, max] range
function clamp(euint32 value, uint32 minVal, uint32 maxVal) internal returns (euint32) {
    // If value > max, use max
    euint32 upperClamped = FHE.select(
        FHE.gt(value, maxVal),
        FHE.asEuint32(maxVal),
        value
    );

    // If result < min, use min
    euint32 fullyClamped = FHE.select(
        FHE.lt(upperClamped, minVal),
        FHE.asEuint32(minVal),
        upperClamped
    );

    return fullyClamped;
}
```

Alternatively, using FHE.min and FHE.max:

```solidity
function clampSimple(euint32 value, uint32 minVal, uint32 maxVal) internal returns (euint32) {
    return FHE.max(FHE.min(value, maxVal), minVal);
}
```

---

## Pattern 3: Nested Conditions for Complex Logic

Implement multi-condition business rules:

```solidity
function calculateBonus(euint32 sales, euint32 experience) internal returns (euint32) {
    // High sales AND high experience → 20% bonus
    // High sales OR high experience → 10% bonus
    // Neither → 5% bonus

    ebool highSales = FHE.gt(sales, 1000);
    ebool highExp = FHE.gt(experience, 5);

    ebool bothHigh = FHE.and(highSales, highExp);
    ebool eitherHigh = FHE.or(highSales, highExp);

    euint32 bonus = FHE.select(
        bothHigh,
        FHE.asEuint32(20),
        FHE.select(
            eitherHigh,
            FHE.asEuint32(10),
            FHE.asEuint32(5)
        )
    );

    return FHE.div(FHE.mul(sales, bonus), 100);
}
```

---

## Pattern 4: State Machine with FHE.select

Encrypted state transitions:

```solidity
// States: 0 = Pending, 1 = Active, 2 = Completed, 3 = Cancelled
function transitionState(euint8 currentState, ebool shouldActivate, ebool shouldComplete) internal returns (euint8) {
    // From Pending (0): if shouldActivate → Active (1)
    euint8 fromPending = FHE.select(
        shouldActivate,
        FHE.asEuint8(1),    // → Active
        FHE.asEuint8(0)     // Stay Pending
    );

    // From Active (1): if shouldComplete → Completed (2)
    euint8 fromActive = FHE.select(
        shouldComplete,
        FHE.asEuint8(2),    // → Completed
        FHE.asEuint8(1)     // Stay Active
    );

    // Select based on current state
    ebool isPending = FHE.eq(currentState, 0);
    ebool isActive = FHE.eq(currentState, 1);

    return FHE.select(
        isPending,
        fromPending,
        FHE.select(isActive, fromActive, currentState)
    );
}
```

---

## Performance Consideration

Both branches of FHE.select are always computed. This means:

```solidity
// This computes BOTH the expensive and cheap operations
euint32 result = FHE.select(
    condition,
    expensiveOperation(a, b, c),  // Always computed
    cheapOperation(a)              // Always computed
);
```

**Design tip:** Keep both branches roughly equal in computational cost. If one branch is very expensive and rarely needed, consider restructuring your logic.

---

## Key Takeaways

1. FHE.select enables complex business logic on fully encrypted data
2. Chain FHE.select for multi-tier conditions (pricing, bonuses, states)
3. Use FHE.min/FHE.max for efficient clamping
4. Combine with FHE.and/FHE.or for multi-condition logic
5. Both branches always execute - keep computational costs balanced
6. These patterns replace if/else, switch/case, and ternary operators entirely

---

## Quiz Questions

**Q1:** Why must both branches of FHE.select always be computed?
**A:** Because the condition is encrypted - the system does not know which branch to skip. If only one branch were computed, the gas usage difference would reveal which branch was taken, leaking information about the encrypted condition. Computing both branches ensures constant gas usage regardless of the condition value.

**Q2:** How would you implement a three-tier discount system where encrypted purchase amount determines the discount rate?
**A:** Use nested FHE.select: check the highest tier first with FHE.gt, then nest another FHE.select for the middle tier. For example: FHE.select(FHE.gt(amount, 1000), highDiscount, FHE.select(FHE.gt(amount, 500), mediumDiscount, lowDiscount)). All three discount calculations are computed, but only the correct one is selected based on the encrypted amount.
