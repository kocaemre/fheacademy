# Week 1 - Homework: Temperature Converter Migration

## Assignment Overview

Your task is to migrate a plaintext Temperature Converter contract to use FHEVM encrypted operations. This assignment tests your understanding of the Migration Mindset from Lesson 1.4.

---

## The Original Contract

Here is the plaintext Solidity Temperature Converter:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TemperatureConverter {
    uint32 public temperatureCelsius;

    function setTemperature(uint32 celsius) public {
        temperatureCelsius = celsius;
    }

    function getTemperatureFahrenheit() public view returns (uint32) {
        return (temperatureCelsius * 9 / 5) + 32;
    }

    function getTemperatureCelsius() public view returns (uint32) {
        return temperatureCelsius;
    }
}
```

The contract stores a temperature in Celsius and can convert it to Fahrenheit using the formula: F = (C * 9 / 5) + 32.

---

## What You Need to Do

### 1. Migrate Types (30% of grade)
- Replace `uint32` with `euint32` for the temperature state variable
- Make the state variable `private` instead of `public`
- Use `externalEuint32` for the `setTemperature` function parameter
- Add `bytes calldata inputProof` parameter

### 2. Migrate Operations
- Replace `temperatureCelsius * 9` with `FHE.mul(temperatureCelsius, 9)`
- Replace division by 5 with `FHE.div(result, 5)` (note: divisor must be plaintext - this works!)
- Replace addition of 32 with `FHE.add(result, 32)`

### 3. Add ACL Permissions (20% of grade)
- Call `FHE.allowThis()` after setting temperature
- Call `FHE.allow(value, msg.sender)` to let the caller decrypt
- Ensure both Celsius and Fahrenheit results have proper ACL

### 4. Write Tests (30% of grade)
- Test setting an encrypted temperature
- Test the Fahrenheit conversion is correct
- Test reading the Celsius value
- Use `createEncryptedInput()` and `userDecryptEuint32()` helpers

### 5. Compile Successfully (20% of grade)
- Contract must compile without errors
- All FHEVM imports must be correct

---

## Expected Migrated Contract Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

contract EncryptedTemperatureConverter is SepoliaZamaFHEVMConfig {
    euint32 private temperatureCelsius;

    function setTemperature(
        externalEuint32 encryptedCelsius,
        bytes calldata inputProof
    ) public {
        temperatureCelsius = FHE.fromExternal(encryptedCelsius, inputProof);
        FHE.allowThis(temperatureCelsius);
        FHE.allow(temperatureCelsius, msg.sender);
    }

    function getTemperatureFahrenheit() public view returns (euint32) {
        euint32 mul9 = FHE.mul(temperatureCelsius, 9);
        euint32 div5 = FHE.div(mul9, 5);
        euint32 fahrenheit = FHE.add(div5, 32);
        return fahrenheit;
    }

    function getTemperatureCelsius() public view returns (euint32) {
        return temperatureCelsius;
    }
}
```

---

## Grading Rubric

| Criteria | Weight | Description |
|----------|--------|-------------|
| Compilation | 20% | Contract compiles without errors |
| Encrypted Types | 30% | Correct use of euint32, externalEuint32, private visibility |
| ACL Permissions | 20% | FHE.allowThis() and FHE.allow() called correctly |
| Tests | 30% | Comprehensive tests using encrypted inputs and decryption |

**Passing Score:** 70%

---

## Key Concepts Tested

1. **Migration Mindset** - systematic transformation from Solidity to FHEVM
2. **Encrypted types** - euint32 for state, externalEuint32 for inputs
3. **FHE operations** - FHE.mul(), FHE.div(), FHE.add() with plaintext operands
4. **ACL management** - FHE.allowThis() and FHE.allow()
5. **Encrypted inputs** - FHE.fromExternal() with input proofs
6. **Testing** - createEncryptedInput() and userDecryptEuint32()
