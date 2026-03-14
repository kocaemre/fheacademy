// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/// @title FHE Temperature Converter (FHEVM Solution)
/// @notice Converts Celsius to Fahrenheit using fully homomorphic encryption.
/// @dev This is the completed Week 1 homework solution demonstrating:
///   - Encrypted state variables (euint32)
///   - Encrypted input handling (einput + inputProof)
///   - FHE arithmetic (TFHE.mul, TFHE.div, TFHE.add)
///   - ACL permissions (TFHE.allowThis, TFHE.allow)
contract FHETemperatureConverter is SepoliaZamaFHEVMConfig {
    euint32 private lastCelsius;
    euint32 private lastFahrenheit;

    /// @notice Convert an encrypted Celsius value to Fahrenheit: F = (C * 9 / 5) + 32
    /// @param encryptedCelsius The encrypted Celsius temperature (einput handle)
    /// @param inputProof The zero-knowledge proof of knowledge for the input
    function convert(einput encryptedCelsius, bytes calldata inputProof) public {
        // Convert the encrypted input to a euint32
        euint32 celsius = TFHE.asEuint32(encryptedCelsius, inputProof);

        // Perform FHE arithmetic: F = (C * 9 / 5) + 32
        euint32 step1 = TFHE.mul(celsius, 9); // C * 9 (encrypted * plaintext)
        euint32 step2 = TFHE.div(step1, 5); // (C * 9) / 5 (encrypted / plaintext)
        euint32 fahrenheit = TFHE.add(step2, TFHE.asEuint32(32)); // + 32

        // Store the encrypted results
        lastCelsius = celsius;
        lastFahrenheit = fahrenheit;

        // Set ACL permissions so the contract itself can access the values
        TFHE.allowThis(lastCelsius);
        TFHE.allowThis(lastFahrenheit);

        // Allow the caller to access (for later reencryption/decryption)
        TFHE.allow(lastCelsius, msg.sender);
        TFHE.allow(lastFahrenheit, msg.sender);
    }

    /// @notice Get the encrypted last Celsius value (caller must have ACL permission)
    /// @return The encrypted last Celsius value handle
    function getLastCelsius() public view returns (euint32) {
        return lastCelsius;
    }

    /// @notice Get the encrypted last Fahrenheit value (caller must have ACL permission)
    /// @return The encrypted last Fahrenheit value handle
    function getLastFahrenheit() public view returns (euint32) {
        return lastFahrenheit;
    }
}
