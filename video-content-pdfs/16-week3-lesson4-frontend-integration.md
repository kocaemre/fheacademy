# Week 3 - Lesson 3.4: Frontend Integration

## Learning Objective
Build a complete frontend that connects to FHEVM contracts, encrypts user inputs, and decrypts results.

---

## The Full-Stack FHEVM Flow

A complete FHEVM dApp has five stages:

```
1. Connect Wallet  →  2. Encrypt Input  →  3. Send Transaction  →  4. Decrypt Result  →  5. Display
```

Each stage requires specific tools and patterns.

---

## Stage 1: Connect Wallet

Standard Web3 wallet connection, identical to any Ethereum dApp:

```javascript
import { ethers } from "ethers";

async function connectWallet() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
}
```

---

## Stage 2: Create FHEVM Instance and Encrypt Inputs

The Relayer SDK handles client-side encryption:

```javascript
import { createInstance } from "@zama-fhe/relayer-sdk";

// Create FHEVM instance (once per session)
const fhevmInstance = await createInstance({
    chainId: 11155111,  // Sepolia
});

// Encrypt a value for a specific contract
async function encryptValue(contractAddress, userAddress, value) {
    const input = fhevmInstance.createEncryptedInput(
        contractAddress,
        userAddress
    );
    input.addUint32(value);  // or addUint64, addUint8, etc.
    const encrypted = await input.encrypt();

    return {
        handle: encrypted.handles[0],
        proof: encrypted.inputProof
    };
}
```

**Key points:**
- Create the FHEVM instance once per session, not per transaction
- The instance manages the FHE public key internally
- `createEncryptedInput` binds the encryption to a specific contract and user
- The encrypted value and proof are sent together in the transaction

---

## Stage 3: Send Transaction

Send the encrypted value to the smart contract:

```javascript
import { ethers } from "ethers";

async function sendEncryptedTransaction(signer, contractAddress, abi) {
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Encrypt the value
    const userAddress = await signer.getAddress();
    const { handle, proof } = await encryptValue(
        contractAddress,
        userAddress,
        42  // The secret value
    );

    // Send transaction with encrypted input
    const tx = await contract.add(handle, proof);
    await tx.wait();

    console.log("Transaction confirmed!");
}
```

This looks almost identical to a regular Ethereum transaction. The only difference is encrypting the value before sending.

---

## Stage 4: Read and Decrypt Results

Reading encrypted values requires two steps: get the handle, then decrypt:

```javascript
async function readAndDecrypt(contract, userAddress) {
    // Step 1: Get the encrypted handle from the contract
    const encryptedHandle = await contract.getCount();

    // Step 2: Request decryption via the relayer SDK
    const cleartext = await fhevmInstance.decrypt(
        contractAddress,
        encryptedHandle
    );

    return cleartext;
}
```

**Note:** The user must have ACL permission (set by FHE.allow in the contract) to decrypt. Without permission, decryption will fail.

---

## Stage 5: Display to User

Once decrypted, display the value in your UI:

```javascript
async function updateUI() {
    try {
        const balance = await readAndDecrypt(contract, userAddress);
        document.getElementById("balance").innerText = `Balance: ${balance}`;
    } catch (error) {
        if (error.message.includes("ACL")) {
            console.error("No permission to decrypt this value");
        } else {
            console.error("Decryption failed:", error);
        }
    }
}
```

---

## Complete React Component Example

```jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { createInstance } from "@zama-fhe/relayer-sdk";

function EncryptedCounter({ contractAddress, abi }) {
    const [count, setCount] = useState("Encrypted");
    const [loading, setLoading] = useState(false);
    const [fhevm, setFhevm] = useState(null);
    const [signer, setSigner] = useState(null);

    // Initialize FHEVM instance
    useEffect(() => {
        async function init() {
            const instance = await createInstance({ chainId: 11155111 });
            setFhevm(instance);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const s = await provider.getSigner();
            setSigner(s);
        }
        init();
    }, []);

    // Increment the counter
    async function handleIncrement() {
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, abi, signer);
            const tx = await contract.increment();
            await tx.wait();
            await refreshCount();
        } finally {
            setLoading(false);
        }
    }

    // Add an encrypted value
    async function handleAdd(value) {
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, abi, signer);
            const address = await signer.getAddress();

            const input = fhevm.createEncryptedInput(contractAddress, address);
            input.addUint32(value);
            const encrypted = await input.encrypt();

            const tx = await contract.add(
                encrypted.handles[0],
                encrypted.inputProof
            );
            await tx.wait();
            await refreshCount();
        } finally {
            setLoading(false);
        }
    }

    // Refresh the displayed count
    async function refreshCount() {
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const handle = await contract.getCount();
        const address = await signer.getAddress();

        try {
            const cleartext = await fhevm.decrypt(contractAddress, handle);
            setCount(cleartext.toString());
        } catch {
            setCount("No permission to view");
        }
    }

    return (
        <div>
            <h2>Encrypted Counter: {count}</h2>
            <button onClick={handleIncrement} disabled={loading}>
                {loading ? "Processing..." : "Increment"}
            </button>
            <button onClick={() => handleAdd(10)} disabled={loading}>
                {loading ? "Processing..." : "Add 10"}
            </button>
        </div>
    );
}
```

---

## Error Handling

### ACL Permission Errors

```javascript
try {
    const cleartext = await fhevm.decrypt(contractAddress, handle);
} catch (error) {
    // User does not have ACL permission to decrypt this value
    console.log("Access denied - you cannot view this value");
}
```

### Encryption Errors

```javascript
try {
    const input = fhevm.createEncryptedInput(contractAddress, userAddress);
    input.addUint32(value);
    const encrypted = await input.encrypt();
} catch (error) {
    console.log("Encryption failed - check contract address and chain ID");
}
```

---

## Key Takeaways

1. The full-stack flow: connect → encrypt → send → decrypt → display
2. Create the FHEVM instance once per session using the Relayer SDK
3. Use createEncryptedInput() bound to specific contract and user addresses
4. Encrypted values and proofs are sent in standard Ethereum transactions
5. Decryption requires ACL permission - handle errors gracefully
6. The frontend code is very similar to standard Web3 development with added encryption/decryption steps

---

## Quiz Questions

**Q1:** Why must the FHEVM instance's createEncryptedInput be bound to a specific contract address and user address?
**A:** Binding to a contract address prevents replay attacks where encrypted values are submitted to different contracts. Binding to the user address prevents other users from reusing the encrypted value. Together, these bindings ensure the zero-knowledge proof is valid only for the intended contract and sender.

**Q2:** What happens when a frontend tries to decrypt a value for which the user does not have ACL permission?
**A:** The decryption request will fail with an error. The KMS will refuse to provide partial decryptions because the user's address is not in the ciphertext's ACL. The frontend should handle this error gracefully by showing an appropriate message like "Access denied" rather than crashing.
