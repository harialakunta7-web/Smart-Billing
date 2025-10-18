# 🧾 Smart Billing API

A RESTful API built with **Node.js**, **Express**, and **PostgreSQL** for store registration, phone verification, and login authentication.

---

## 📘 API Endpoints

### 1️⃣ Register Store
**Endpoint:** `POST /api/auth/register`  
**Purpose:** Register a new store.

**Request:**
```json
{
  "storeName": "Smart Mart",
  "ownerName": "Ravi",
  "email": "mari02@example.com",
  "phone": "9876543210",
  "gstNumber": "29ABCDE1234F1Z9",
  "address": "Hyderabad, India",
  "logoUrl": "https://example.com/logo.png"
}
2️⃣ Verify Phone Number

Endpoint: POST /api/auth/verify-phone
Purpose: Check if phone number is registered and send OTP.

Request:

{
  "phone": "9876543210"
}
3️⃣ Login

Endpoint: POST /api/auth/login
Purpose: Log in with phone number and OTP to receive JWT token.

Request:

{
  "phone": "9876543210",
  "otp": "123456"
}
4️⃣ Get All Stores (Admin Only)

Method: GET
Endpoint: /api/auth
Purpose: List all registered stores (Admin Only).

Headers:

Authorization: Bearer superadmin123