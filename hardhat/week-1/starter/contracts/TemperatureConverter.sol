// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Temperature Converter (Plaintext Version)
/// @notice This is the starting contract for Week 1 homework.
/// @dev Students will migrate this to use FHEVM encrypted types.
///
/// HOMEWORK INSTRUCTIONS:
/// Migrate this contract to use FHEVM encrypted computation.
/// See the TODO comments below for guidance on each change needed.
///
/// Your migrated contract should:
/// 1. Store temperatures as encrypted euint32 values
/// 2. Accept encrypted input via einput + bytes inputProof
/// 3. Perform arithmetic using TFHE.mul, TFHE.div, TFHE.add
/// 4. Set ACL permissions with TFHE.allowThis() and TFHE.allow()

contract TemperatureConverter {
    // TODO: Replace uint32 with euint32 for encrypted state variables
    // Hint: import "fhevm/lib/TFHE.sol" and use euint32 type
    uint32 public lastCelsius;
    uint32 public lastFahrenheit;

    /// @notice Convert Celsius to Fahrenheit: F = (C * 9 / 5) + 32
    /// @param celsius The temperature in Celsius
    // TODO: Accept einput + bytes calldata inputProof instead of plain uint32
    // Hint: function convert(einput encryptedCelsius, bytes calldata inputProof) public
    function convert(uint32 celsius) public {
        // TODO: Replace arithmetic with FHE operations:
        //   euint32 c = TFHE.asEuint32(encryptedCelsius, inputProof);
        //   euint32 step1 = TFHE.mul(c, 9);
        //   euint32 step2 = TFHE.div(step1, 5);
        //   euint32 fahrenheit = TFHE.add(step2, TFHE.asEuint32(32));
        uint32 fahrenheit = (celsius * 9 / 5) + 32;

        lastCelsius = celsius;
        lastFahrenheit = fahrenheit;

        // TODO: Add ACL permissions so the contract and caller can access the values:
        //   TFHE.allowThis(lastCelsius);
        //   TFHE.allowThis(lastFahrenheit);
        //   TFHE.allow(lastCelsius, msg.sender);
        //   TFHE.allow(lastFahrenheit, msg.sender);
    }

    /// @notice Get the last conversion result
    /// @return celsius The last Celsius value
    /// @return fahrenheit The last Fahrenheit value
    // TODO: This function will need reencryption in the FHEVM version
    // Hint: Remove the return values and use TFHE.allow() for the caller to decrypt off-chain
    function getLastConversion() public view returns (uint32 celsius, uint32 fahrenheit) {
        return (lastCelsius, lastFahrenheit);
    }
}
