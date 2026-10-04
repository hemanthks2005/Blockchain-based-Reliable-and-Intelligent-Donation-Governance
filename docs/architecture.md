# BRIDGE Architecture Documentation

## 1. System Overview

BRIDGE (Blockchain-based Reliable and Intelligent Donation Governance Engine) is designed with a tiered architecture separating fast metadata management from tamper-proof transaction immutability.

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │    Web Frontend     │
                    └──────────┬──────────┘
                               │ HTTPS/REST
                               ▼
                    ┌─────────────────────┐
                    │     Node.js API     │
                    │    Express Server   │
                    └──────┬──────┬───────┘
                           │      │
                 ┌─────────┘      └──────────┐
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │    MongoDB      │         │ Ethereum/EVM   │
        │ Metadata/Users  │         │ Smart Contract │
        │ Requests/Logs   │         └─────────────────┘
        └─────────────────┘
```

## 2. Component Split

- **MongoDB**: Users, Beneficiary profiles, Funding requests, Donation metadata, Application status, Audit logs.
- **Ethereum/EVM Smart Contract**: On-chain donation transactions, Transaction identity, Blockchain timestamp, Smart contract events.
- **Node.js Express Backend**: Thin controllers, service-oriented business logic, database abstraction, blockchain event listeners.
- **React Frontend**: Clean component hierarchy, authenticated routing, state contexts, responsive glassmorphism UI.
