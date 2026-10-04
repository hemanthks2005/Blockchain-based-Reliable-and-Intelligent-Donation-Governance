# BRIDGE API Documentation

Base URL: `/api/v1`

## Health & System
- `GET /health` — Check backend and database health status

## Authentication (`/auth`)
- `POST /auth/register` — Register a new account (DONOR, BENEFICIARY, ADMIN)
- `POST /auth/login` — Authenticate and receive JWT access token
- `GET /auth/me` — Retrieve current authenticated user profile
- `POST /auth/logout` — Logout session

## Beneficiaries (`/beneficiaries`)
- `POST /beneficiaries` — Create beneficiary profile (PENDING_VERIFICATION)
- `GET /beneficiaries/me` — Current beneficiary profile
- `GET /beneficiaries` — Admin list with filtering
- `GET /beneficiaries/:id` — Detail view
- `PATCH /beneficiaries/:id/verify` — Admin verification / approval / rejection

## Funding Requests (`/requests`)
- `POST /requests` — Beneficiary creates request
- `GET /requests` — List requests (role-scoped)
- `GET /requests/:id` — Request detail
- `PATCH /requests/:id/status` — Admin approval / review

## Donations (`/donations`)
- `POST /donations` — Create donation intent (CREATED)
- `POST /donations/:id/submit` — Submit transaction to blockchain
- `GET /donations/:id` — Donation details
- `GET /donations/me` — Donor history
- `GET /donations/:id/track` — Complete lifecycle timeline

## Transactions (`/transactions`)
- `GET /transactions` — Admin list
- `GET /transactions/:id` — Transaction detail
- `GET /transactions/:id/blockchain` — On-chain verification details

## Admin (`/admin`)
- `GET /admin/dashboard` — Platform aggregated metrics
- `GET /admin/reports/donations` — Reporting data
- `GET /admin/reports/transactions` — Transaction report
- `GET /admin/reports/beneficiaries` — Beneficiary report
- `GET /admin/audit-logs` — Administrative audit trail
