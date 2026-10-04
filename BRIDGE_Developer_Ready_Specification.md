# BRIDGE — Developer-Ready Specification

## 1. Overview

**BRIDGE (Blockchain-based Reliable and Intelligent Donation Governance Engine)** is a web-based donation governance and tracking platform using React.js, Node.js, MongoDB, Ethereum/Solidity, and Ganache.

The MVP connects three primary stakeholders:

- **Donor** — makes and tracks donations.
- **Beneficiary** — submits funding requests and tracks approved support.
- **Administrator** — verifies beneficiaries, governs allocations, monitors transactions, and generates reports.

Core flow:

**Beneficiary verification → Funding request → Donor donation → Blockchain transaction → Confirmation → Admin governance → Beneficiary status → Donor tracking**

---

## 2. Repository Structure

```text
bridge/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   └── routes/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── config/
│   │   └── utils/
│   └── package.json
│
├── blockchain/
│   ├── contracts/
│   │   └── BridgeDonation.sol
│   ├── scripts/
│   ├── test/
│   └── migrations/
│
├── docs/
│   ├── api.md
│   ├── architecture.md
│   └── smart-contract.md
│
├── .env.example
└── README.md
```

---

## 3. Architecture

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

### Responsibility split

**MongoDB**
- Users
- Beneficiary profiles
- Funding requests
- Donation metadata
- Application status
- Audit logs

**Blockchain**
- On-chain donation transactions
- Transaction identity
- Blockchain timestamp
- Relevant transaction/address information
- Smart-contract events

Do not store passwords, email addresses, phone numbers, identity documents, or other sensitive personal information on-chain.

---

# 4. Roles and Authorization

| Feature | Donor | Beneficiary | Admin |
|---|---:|---:|---:|
| Register/Login | ✓ | ✓ | ✓ |
| View requests | ✓ | ✓ | ✓ |
| Donate | ✓ | — | — |
| View own donations | ✓ | — | ✓ |
| Submit funding request | — | ✓ | — |
| View own requests | — | ✓ | ✓ |
| Verify beneficiary | — | — | ✓ |
| Approve allocation | — | — | ✓ |
| Monitor transactions | Own | Related | All |
| View blockchain record | Own | Related | All |
| Generate reports | — | — | ✓ |

Backend authorization must always be enforced independently of frontend route protection.

---

# 5. API Specification

Base URL:

```text
/api/v1
```

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

---

## 5.1 Authentication APIs

### POST `/auth/register`

Creates a user account.

Request:

```json
{
  "name": "Hemanth",
  "email": "hemanth@example.com",
  "password": "StrongPassword123",
  "role": "DONOR"
}
```

Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "67abc123",
    "role": "DONOR"
  }
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "hemanth@example.com",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "67abc123",
      "name": "Hemanth",
      "role": "DONOR"
    }
  }
}
```

### GET `/auth/me`

Returns the authenticated user.

### POST `/auth/logout`

Invalidates the current session/token strategy.

---

# 6. Beneficiary APIs

## POST `/beneficiaries`

Creates a beneficiary profile.

```json
{
  "name": "ABC Foundation",
  "description": "Education support organization",
  "contactEmail": "abc@example.com",
  "contactPhone": "9876543210"
}
```

Initial status:

```text
PENDING_VERIFICATION
```

## GET `/beneficiaries/me`

Returns the current beneficiary profile.

## GET `/beneficiaries`

Admin-only.

Query parameters:

```text
?status=PENDING_VERIFICATION
&page=1
&limit=20
```

## GET `/beneficiaries/:id`

Returns beneficiary details.

## PATCH `/beneficiaries/:id/verify`

Admin-only.

```json
{
  "status": "VERIFIED",
  "remarks": "Documents verified"
}
```

Possible statuses:

```text
PENDING_VERIFICATION
VERIFIED
REJECTED
SUSPENDED
```

---

# 7. Funding Request APIs

## POST `/requests`

Beneficiary creates a funding request.

```json
{
  "title": "Education Support",
  "description": "Scholarship support for students",
  "requestedAmount": 50000,
  "purpose": "Educational expenses"
}
```

## GET `/requests`

Role-dependent:

- Beneficiary → own requests
- Donor → eligible/visible requests
- Admin → all requests

## GET `/requests/:id`

Returns request details.

## PATCH `/requests/:id/status`

Admin-only.

```json
{
  "status": "APPROVED",
  "remarks": "Request verified"
}
```

Possible states:

```text
PENDING
UNDER_REVIEW
APPROVED
REJECTED
COMPLETED
```

---

# 8. Donation APIs

## POST `/donations`

Creates a donation intent.

```json
{
  "requestId": "req_123",
  "amount": 1000
}
```

Response:

```json
{
  "success": true,
  "data": {
    "donationId": "don_123",
    "status": "CREATED",
    "amount": 1000
  }
}
```

The backend must not mark the donation as blockchain-confirmed at this stage.

## POST `/donations/:id/submit`

Submits the transaction to the blockchain.

```json
{
  "walletAddress": "0x123..."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "donationId": "don_123",
    "status": "SUBMITTED",
    "transactionHash": "0xabc..."
  }
}
```

## GET `/donations/:id`

Returns complete donation information.

## GET `/donations/me`

Returns the donor's donation history.

Query parameters:

```text
?page=1
&limit=20
&status=CONFIRMED
```

## GET `/donations/:id/track`

Returns the donation lifecycle.

Example:

```json
{
  "donationId": "don_123",
  "status": "CONFIRMED",
  "timeline": [
    {
      "event": "CREATED",
      "timestamp": "2026-10-03T10:00:00Z"
    },
    {
      "event": "BLOCKCHAIN_SUBMITTED",
      "timestamp": "2026-10-03T10:01:00Z"
    },
    {
      "event": "BLOCKCHAIN_CONFIRMED",
      "timestamp": "2026-10-03T10:01:12Z"
    }
  ]
}
```

---

# 9. Transaction APIs

## GET `/transactions/:id`

Returns transaction details.

## GET `/transactions`

Admin-only.

Filters:

```text
?status=CONFIRMED
&from=2026-10-01
&to=2026-10-31
&page=1
&limit=50
```

## GET `/transactions/:id/blockchain`

Returns blockchain information.

```json
{
  "transactionHash": "0xabc...",
  "blockNumber": 123,
  "contractAddress": "0x456...",
  "network": "ganache",
  "status": "CONFIRMED"
}
```

---

# 10. Admin APIs

## GET `/admin/dashboard`

Example response:

```json
{
  "users": 120,
  "donors": 100,
  "beneficiaries": 20,
  "pendingBeneficiaryVerifications": 4,
  "pendingRequests": 8,
  "totalDonations": 250,
  "successfulDonations": 235
}
```

## GET `/admin/reports/donations`

Generates donation reporting data.

## GET `/admin/reports/transactions`

Generates transaction reporting data.

## GET `/admin/reports/beneficiaries`

Generates beneficiary reporting data.

## GET `/admin/audit-logs`

Returns administrative activity.

---

# 11. API Error Format

All APIs should use a consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "BENEFICIARY_NOT_VERIFIED",
    "message": "The beneficiary has not been verified."
  }
}
```

Recommended HTTP status codes:

| Code | Meaning |
|---|---|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

---

# 12. MongoDB Schemas

## 12.1 `users`

```javascript
{
  _id: ObjectId,

  name: String,

  email: {
    type: String,
    unique: true,
    index: true
  },

  passwordHash: String,

  role: {
    type: String,
    enum: ["DONOR", "BENEFICIARY", "ADMIN"]
  },

  walletAddress: String,

  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED"]
  },

  createdAt: Date,
  updatedAt: Date
}
```

---

## 12.2 `beneficiaries`

```javascript
{
  _id: ObjectId,

  userId: ObjectId,

  name: String,

  description: String,

  contactEmail: String,

  contactPhone: String,

  verificationStatus: {
    type: String,
    enum: [
      "PENDING_VERIFICATION",
      "VERIFIED",
      "REJECTED",
      "SUSPENDED"
    ]
  },

  verificationRemarks: String,

  verifiedBy: ObjectId,

  verifiedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

```text
userId
verificationStatus
```

---

## 12.3 `fund_requests`

```javascript
{
  _id: ObjectId,

  beneficiaryId: ObjectId,

  title: String,

  description: String,

  purpose: String,

  requestedAmount: Number,

  approvedAmount: Number,

  status: {
    type: String,
    enum: [
      "PENDING",
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
      "COMPLETED"
    ]
  },

  reviewedBy: ObjectId,

  reviewRemarks: String,

  reviewedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

---

## 12.4 `donations`

```javascript
{
  _id: ObjectId,

  donorId: ObjectId,

  requestId: ObjectId,

  beneficiaryId: ObjectId,

  amount: Number,

  currency: String,

  status: {
    type: String,
    enum: [
      "CREATED",
      "SUBMITTED",
      "PENDING_CONFIRMATION",
      "CONFIRMED",
      "FAILED",
      "CANCELLED"
    ]
  },

  walletAddress: String,

  blockchainTxHash: {
    type: String,
    index: true
  },

  blockchainNetwork: String,

  blockNumber: Number,

  contractAddress: String,

  createdAt: Date,

  confirmedAt: Date,

  updatedAt: Date
}
```

---

## 12.5 `transactions`

```javascript
{
  _id: ObjectId,

  donationId: ObjectId,

  txHash: {
    type: String,
    unique: true,
    sparse: true
  },

  fromAddress: String,

  toAddress: String,

  amount: Number,

  blockNumber: Number,

  status: {
    type: String,
    enum: [
      "SUBMITTED",
      "CONFIRMED",
      "FAILED"
    ]
  },

  gasUsed: String,

  network: String,

  timestamp: Date,

  createdAt: Date
}
```

---

## 12.6 `audit_logs`

```javascript
{
  _id: ObjectId,

  actorId: ObjectId,

  actorRole: String,

  action: String,

  entityType: String,

  entityId: ObjectId,

  metadata: Object,

  ipAddress: String,

  timestamp: Date
}
```

Example actions:

```text
BENEFICIARY_VERIFIED
REQUEST_APPROVED
REQUEST_REJECTED
DONATION_CREATED
DONATION_SUBMITTED
TRANSACTION_CONFIRMED
```

---

# 13. Data Relationships

```text
User
 │
 ├──────────────► Donations
 │
 ├──────────────► Beneficiary
 │
 └──────────────► AuditLogs

Beneficiary
 │
 └──────────────► FundRequests
                       │
                       └──────► Donations
                                    │
                                    └──────► Transactions
```

---

# 14. Solidity Smart Contract

Keep the MVP smart contract intentionally small.

## Contract responsibilities

- Record valid donation transactions.
- Associate donations with funding requests.
- Emit donation events.
- Maintain immutable donation records.
- Provide donation lookup.

Suggested contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BridgeDonation {

    struct Donation {
        uint256 donationId;
        address donor;
        address beneficiary;
        uint256 requestId;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }

    uint256 private donationCounter;

    mapping(uint256 => Donation) public donations;

    event DonationCreated(
        uint256 indexed donationId,
        address indexed donor,
        address indexed beneficiary,
        uint256 requestId,
        uint256 amount,
        uint256 timestamp
    );

    function donate(
        address beneficiary,
        uint256 requestId
    ) external payable {
        require(msg.value > 0, "Donation amount must be greater than zero");
        require(
            beneficiary != address(0),
            "Invalid beneficiary address"
        );

        donationCounter++;

        donations[donationCounter] = Donation({
            donationId: donationCounter,
            donor: msg.sender,
            beneficiary: beneficiary,
            requestId: requestId,
            amount: msg.value,
            timestamp: block.timestamp,
            exists: true
        });

        emit DonationCreated(
            donationCounter,
            msg.sender,
            beneficiary,
            requestId,
            msg.value,
            block.timestamp
        );
    }

    function getDonation(uint256 donationId)
        external
        view
        returns (
            address donor,
            address beneficiary,
            uint256 requestId,
            uint256 amount,
            uint256 timestamp
        )
    {
        Donation memory donation = donations[donationId];

        require(donation.exists, "Donation does not exist");

        return (
            donation.donor,
            donation.beneficiary,
            donation.requestId,
            donation.amount,
            donation.timestamp
        );
    }

    function getDonationCount()
        external
        view
        returns (uint256)
    {
        return donationCounter;
    }
}
```

### Important design note

The example contract above records the donation and emits an event, but **fund custody/allocation must be finalized as an explicit product decision before production deployment**. The MVP should not assume that transferring funds directly to a beneficiary is equivalent to administrator-governed allocation.

---

# 15. Blockchain Event Handling

The backend should listen for:

```solidity
DonationCreated(...)
```

Flow:

```text
Smart Contract
      │
      ▼
DonationCreated Event
      │
      ▼
Node.js Blockchain Listener
      │
      ▼
Find donation by ID / txHash
      │
      ▼
Update MongoDB
      │
      ▼
status = CONFIRMED
```

Do not rely solely on the frontend to determine blockchain confirmation.

---

# 16. React Pages

## Public

```text
/
├── Landing Page
├── Login
├── Register
└── About
```

## Donor

```text
/donor/dashboard
/donor/requests
/donor/requests/:id
/donor/donate/:requestId
/donor/donations
/donor/donations/:id
/profile
```

## Beneficiary

```text
/beneficiary/dashboard
/beneficiary/profile
/beneficiary/requests
/beneficiary/requests/new
/beneficiary/requests/:id
```

## Admin

```text
/admin/dashboard
/admin/users
/admin/beneficiaries
/admin/beneficiaries/:id
/admin/requests
/admin/requests/:id
/admin/donations
/admin/transactions
/admin/blockchain
/admin/reports
/admin/audit-logs
```

---

# 17. React Component Structure

```text
components/
├── common/
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Table.jsx
│   ├── Badge.jsx
│   └── Loading.jsx
│
├── auth/
│   ├── LoginForm.jsx
│   └── RegisterForm.jsx
│
├── donations/
│   ├── DonationForm.jsx
│   ├── DonationCard.jsx
│   ├── DonationTable.jsx
│   └── DonationTimeline.jsx
│
├── beneficiaries/
│   ├── BeneficiaryCard.jsx
│   └── VerificationPanel.jsx
│
├── requests/
│   ├── RequestForm.jsx
│   ├── RequestCard.jsx
│   └── RequestStatus.jsx
│
└── admin/
    ├── DashboardStats.jsx
    ├── TransactionTable.jsx
    └── Reports.jsx
```

---

# 18. Frontend State

```text
AuthContext
    ├── currentUser
    ├── token
    ├── role
    └── authentication status

Donation state
    ├── donations
    ├── currentDonation
    └── transactionStatus

Beneficiary state
    ├── profile
    └── verificationStatus

Request state
    ├── requests
    └── selectedRequest

Admin state
    ├── dashboard
    ├── transactions
    └── reports
```

---

# 19. Protected Routes

Example:

```jsx
<ProtectedRoute roles={["DONOR"]}>
    <DonorDashboard />
</ProtectedRoute>
```

Admin:

```jsx
<ProtectedRoute roles={["ADMIN"]}>
    <AdminDashboard />
</ProtectedRoute>
```

Beneficiary:

```jsx
<ProtectedRoute roles={["BENEFICIARY"]}>
    <BeneficiaryDashboard />
</ProtectedRoute>
```

Frontend protection is only for UX. Backend authorization remains mandatory.

---

# 20. Donation State Machine

Use explicit states:

```text
CREATED
   │
   ▼
SUBMITTED
   │
   ▼
PENDING_CONFIRMATION
   │
   ├──────────────► FAILED
   │
   ▼
CONFIRMED
   │
   ▼
ALLOCATED
   │
   ▼
COMPLETED
```

Creating a donation, submitting a blockchain transaction, confirming it, and allocating funds are separate events.

---

# 21. Backend Service Architecture

```text
Controller
    │
    ▼
Service
    │
    ├── MongoDB Repository
    │
    └── Blockchain Service
             │
             ▼
        Smart Contract
```

Example:

```text
donation.controller.js
        ↓
donation.service.js
        ↓
blockchain.service.js
        ↓
BridgeDonation.sol
```

Controllers should remain thin; business logic belongs in services.

---

# 22. Blockchain Service

Suggested interface:

```javascript
class BlockchainService {

  async createDonation(
    beneficiaryAddress,
    requestId,
    amount
  ) {}

  async getDonation(donationId) {}

  async getTransaction(txHash) {}

  async waitForConfirmation(txHash) {}
}
```

Environment variables:

```env
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=
BLOCKCHAIN_PRIVATE_KEY=
CHAIN_ID=
```

Never commit private keys to Git.

---

# 23. Donation API → Blockchain Flow

```text
POST /donations
       │
       ▼
Create MongoDB donation
       │
       ▼
POST /donations/:id/submit
       │
       ▼
Validate donor
       │
       ▼
BlockchainService
       │
       ▼
Smart Contract
       │
       ▼
Transaction Hash
       │
       ▼
MongoDB status = SUBMITTED
       │
       ▼
Blockchain Event
       │
       ▼
MongoDB status = CONFIRMED
```

---

# 24. Sprint Plan

Assumption: **8 two-week sprints**.

## Sprint 1 — Project Foundation

### Deliverables

- Git repository
- React project
- Node.js/Express project
- MongoDB connection
- Environment configuration
- Base folder structure
- ESLint/formatting
- Basic CI/build setup

### Definition of Done

- Frontend runs.
- Backend runs.
- MongoDB connects.
- `/health` endpoint works.
- Frontend can call backend.

---

## Sprint 2 — Authentication & Authorization

### Backend

- User schema
- Registration
- Login
- JWT authentication
- Password hashing
- Role middleware

### Frontend

- Login page
- Registration page
- Auth context
- Protected routes
- Role-based navigation

### Deliverable

```text
Register → Login → Dashboard
```

---

## Sprint 3 — Beneficiary & Request Management

### Backend

- Beneficiary schema
- Request schema
- Beneficiary APIs
- Request APIs
- Verification APIs

### Frontend

- Beneficiary dashboard
- Profile
- Create request
- Request list
- Request status

### Admin

- Verification screen
- Request review screen

### Deliverable

```text
Beneficiary Request
       ↓
Admin Review
       ↓
Approved / Rejected
```

---

## Sprint 4 — Blockchain Foundation

### Blockchain

- Ganache setup
- Solidity contract
- Contract deployment
- Donation struct
- `donate()`
- `getDonation()`
- Events

### Backend

- ethers integration
- Blockchain service
- Contract ABI
- Transaction submission

### Deliverable

A test transaction successfully executes against the local blockchain.

---

## Sprint 5 — Donation System

### Backend

- Donation schema
- Donation creation
- Blockchain submission
- Transaction tracking
- Blockchain event listener

### Frontend

- Donation page
- Donation confirmation
- Transaction status
- Donation history

### Deliverable

```text
Donor
 ↓
Select Request
 ↓
Enter Amount
 ↓
Create Donation
 ↓
Blockchain
 ↓
Confirmation
 ↓
History
```

---

## Sprint 6 — Governance & Admin Dashboard

### Admin

- Dashboard
- Beneficiary verification
- Request approval
- Donation monitoring
- Transaction monitoring
- Blockchain record viewer

### Backend

- Admin APIs
- Audit logs
- Authorization checks

### Deliverable

Administrator can monitor the complete donation lifecycle.

---

## Sprint 7 — Reporting, Security & Testing

### Reporting

- Donation report
- Transaction report
- Beneficiary report
- Audit report

### Security

- API validation
- Authorization testing
- Input sanitization
- Rate limiting
- Secure environment configuration
- Blockchain credential protection

### Testing

```text
Unit tests
Integration tests
API tests
Smart-contract tests
Authentication tests
End-to-end tests
```

---

## Sprint 8 — Integration, Deployment & Final Demo

### Tasks

- End-to-end testing
- Bug fixing
- UI polishing
- Database indexes
- Performance checks
- Deployment preparation
- Documentation
- Demo dataset
- Final project presentation

### Final demonstration

```text
Beneficiary Registration
        ↓
Admin Verification
        ↓
Request Creation
        ↓
Donor Donation
        ↓
Smart Contract
        ↓
Blockchain Record
        ↓
Admin Governance
        ↓
Beneficiary Funding
        ↓
Donor Tracking
```

---

# 25. Team Ownership

For a three-person team:

| Area | Primary | Secondary |
|---|---|---|
| React/UI | Developer 1 | Developer 3 |
| Node/API | Developer 2 | Developer 1 |
| MongoDB | Developer 2 | Developer 3 |
| Solidity | Developer 3 | Developer 2 |
| Integration | All | — |
| Testing | All | — |
| Documentation | All | — |

Each sprint should include shared code review and integration testing.

---

# 26. Testing Matrix

| Component | Test |
|---|---|
| Auth | Registration |
| Auth | Login |
| Auth | Invalid credentials |
| Auth | Role authorization |
| Beneficiary | Create profile |
| Beneficiary | Verification |
| Request | Create request |
| Request | Approve/reject |
| Donation | Create donation |
| Donation | Invalid amount |
| Blockchain | Contract deployment |
| Blockchain | Donation transaction |
| Blockchain | Event emission |
| Blockchain | Transaction lookup |
| Database | CRUD operations |
| API | Authorization |
| API | Validation |
| UI | Protected routes |
| E2E | Complete donation lifecycle |

---

# 27. Critical Integration Rules

## Rule 1 — MongoDB is not the blockchain

MongoDB stores:

```text
Users
Profiles
Requests
Metadata
Application status
Audit logs
```

Blockchain stores:

```text
Verified on-chain donation transaction
Transaction identity
Blockchain timestamp
Relevant donation/address information
```

## Rule 2 — Never claim blockchain confirmation prematurely

Incorrect:

```text
POST /donations
→ status = COMPLETED
```

Correct:

```text
CREATED
→ SUBMITTED
→ PENDING_CONFIRMATION
→ CONFIRMED
```

## Rule 3 — Backend is authoritative for authorization

Even if React hides an Admin button, a malicious user could still call:

```text
PATCH /beneficiaries/:id/verify
```

The Node.js API must independently verify:

```text
JWT
+
role
+
resource permissions
```

## Rule 4 — Blockchain transactions must be idempotently tracked

Use:

```text
blockchainTxHash
```

as a unique identifier where appropriate so that duplicate events cannot create duplicate application transactions.

---

# 28. MVP Backlog

## Epic A — Authentication

- [ ] Registration
- [ ] Login
- [ ] JWT
- [ ] Logout
- [ ] Role middleware

## Epic B — Beneficiaries

- [ ] Profile
- [ ] Verification
- [ ] Status management

## Epic C — Requests

- [ ] Create request
- [ ] List requests
- [ ] Request details
- [ ] Approve/reject

## Epic D — Donations

- [ ] Donation creation
- [ ] Donation submission
- [ ] Donation history
- [ ] Donation tracking

## Epic E — Blockchain

- [ ] Ganache
- [ ] Solidity contract
- [ ] Deployment
- [ ] Donation transaction
- [ ] Event listener
- [ ] Confirmation

## Epic F — Admin

- [ ] Dashboard
- [ ] Transaction monitoring
- [ ] Beneficiary management
- [ ] Request management
- [ ] Reports
- [ ] Audit logs

## Epic G — Quality

- [ ] Unit tests
- [ ] API tests
- [ ] Contract tests
- [ ] Integration tests
- [ ] Security tests
- [ ] E2E testing

---

# 29. Final MVP Architecture

```text
                         BRIDGE
                           │
             ┌─────────────┴─────────────┐
             │                           │
        React Frontend               REST API
             │                           │
     ┌───────┼────────┐          ┌───────┼─────────┐
     │       │        │          │       │         │
   Donor  Beneficiary Admin    Auth   Business  Reports
                                  │       │
                                  │       │
                              ┌───┴───────┴───┐
                              │   Node.js     │
                              └──────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                                 │
                MongoDB                          Blockchain
                    │                                 │
             Application data                   Ethereum/EVM
             Users                              Solidity
             Requests                           Smart Contract
             Metadata                           Immutable Tx
             Audit Logs                         Events
```

---

# 30. MVP Critical Path

The first end-to-end path to implement and demonstrate is:

**Beneficiary verification → Funding request → Donor donation → Blockchain transaction → Confirmation → Admin governance → Beneficiary status → Donor tracking**

Secondary features such as AI fraud detection, mobile applications, advanced analytics, multi-currency support, cloud deployment, government integrations, and digital identity should remain outside the MVP until the core transaction lifecycle is stable.
