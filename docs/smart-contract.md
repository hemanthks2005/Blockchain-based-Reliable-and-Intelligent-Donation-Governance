# BRIDGE Smart Contract Specification

Contract Name: `BridgeDonation`  
Solidity Version: `^0.8.20`  
Target Network: Ethereum EVM (Ganache / Sepolia / Mainnet)

## Core Capabilities
1. `donate(address beneficiary, uint256 requestId)`: Payable function recording donor address, target beneficiary, request ID, amount, and timestamp.
2. `getDonation(uint256 donationId)`: View donation record by ID.
3. `getDonationCount()`: Returns total number of donations registered.
4. `DonationCreated`: Indexed event emitted on successful donation transaction for backend reconciliation.
