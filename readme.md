# Razorpay Payment Platform & Dual Frontend Ecosystem

A high-performance, enterprise-grade payment infrastructure platform built with **Spring Boot 3.3.4 + Java 21**, featuring a dual Next.js frontend ecosystem (`customer-frontend` and `merchant-frontend`), multi-provider abstraction (Razorpay Java SDK, ZXing UPI QR Provider, Mock Provider), state-machine driven payment lifecycle, and real-time Server-Sent Events (SSE).

---

## 🏗️ Architecture Overview

```
                               ┌────────────────────────────────┐
                               │       Customer Frontend        │
                               │      (Next.js - Port 3000)     │
                               └───────────────┬────────────────┘
                                               │
                                       REST / SSE Stream
                                               │
                                               ▼
┌────────────────────────────────┐   ┌────────────────────────────────┐
│       Merchant Frontend        │──▶│      Spring Boot Backend       │
│      (Next.js - Port 3001)     │   │      (Java 21 - Port 8080)    │
└────────────────────────────────┘   └───────────────┬────────────────┘
                                                     │
                                             PaymentService
                                                     │
                      ┌──────────────────────────────┼──────────────────────────────┐
                      ▼                              ▼                              ▼
             RazorpayProvider               UpiPaymentProvider                MockProvider
             (Razorpay Java SDK)          (ZXing QR & Intent URI)         (Testing Sandbox)
                      │                              │
                      ▼                              ▼
              Razorpay Gateway                Base64 QR Code
                      │
                      ▼
               Payment Webhook
                      │
                      ▼
             PaymentStateMachine (CREATED -> PENDING -> PROCESSING -> SUCCESS / FAILED -> SETTLED)
                      │
      ┌───────────────┼───────────────┬───────────────┐
      ▼               ▼               ▼               ▼
  PostgreSQL        Redis          RabbitMQ         MySQL
  (Primary)        (Cache)         (Events)       (Historian)
```

---

## 🚀 Projects & Directory Structure

- [`customer-frontend/`](customer-frontend/): Customer checkout web app running on **Port 3000**.
  - **Features**: Razorpay-style checkout UI, 1st-page UPI QR & `upiQrData` session initialization, 12 UPI intent options (GPay, PhonePe, Paytm, CRED, BHIM, etc.), direct app launcher, card form, netbanking chooser, and real-time SSE payment listener.
- [`merchant-frontend/`](merchant-frontend/): Merchant operations console running on **Port 3001**.
  - **Features**: Merchant authentication & API key manager, real-time analytics dashboard, transaction search & status filter table, and idempotent full/partial refund modal.
- [`src/`](src/): Spring Boot backend application running on **Port 8080**.
  - **Features**: `UpiPaymentProvider` (ZXing QR generation), `RazorpayProvider` (SDK integration), `PaymentStateMachine`, `IdempotencyFilter`, `WebhookController`, `ReconciliationJob`.

---

## 🛠️ Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_db
DB_USERNAME=postgres
DB_PASSWORD=postgrespassword

# Redis & Server Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
SERVER_PORT=8080

# Razorpay Provider Settings
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
PAYMENT_PROVIDER=upi # Options: upi, razorpay, mock
```

---

## 🧪 Testing & Verification

### 1. Customer Frontend Tests
```bash
cd customer-frontend
npm run test -- --watchAll=false
```
*Executes unit and integration tests for UPI QR launcher, screen components, and SSE disconnect fallbacks.*

### 2. Merchant Frontend Tests
```bash
cd merchant-frontend
npm run test -- --watchAll=false
```
*Executes unit and integration tests for payments table filtering and refund idempotency key generation.*

### 3. Backend Test Suite
```bash
mvn test
```
*Runs Spring Boot unit tests for payment state machine transitions, ZXing QR generation, idempotency headers, and refund gating.*

---

## 🏃 Running Locally

1. **Start Infrastructure Services**:
   ```bash
   docker-compose up -d
   ```

2. **Run Spring Boot Backend**:
   ```bash
   mvn spring-boot:run
   ```

3. **Run Customer Frontend**:
   ```bash
   cd customer-frontend
   npm run dev
   # Access at http://localhost:3000/checkout/demo
   ```

4. **Run Merchant Frontend**:
   ```bash
   cd merchant-frontend
   npm run dev
   # Access at http://localhost:3001/dashboard
   ```
