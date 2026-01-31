# Loyalty Management System - API Documentation

This document provides details about the available API routes, request payloads, and response formats for the Loyalty Management System.

## Base URL
`http://localhost:5000/api` (Replace with your actual server URL)

---

## 🔐 Authentication

### Business/System Login
- **Route**: `POST /auth/login`
- **Description**: Authenticate using credentials.
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { ... },
    "businessId": "...",
    "branchId": "..."
  }
}
```

### Refresh Token
- **Route**: `POST /auth/refresh-token`
- **Description**: Get a new access token using the refresh token from cookies.

### Forgot Password
- **Route**: `POST /auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`

### Google Login
- **Route**: `GET /auth/google?redirect=/dashboard`
- **Description**: Standard Google OAuth flow.

---

## 👤 Customer Module

### Customer Login
- **Route**: `POST /customer/auth/login`
- **Description**: Separate login for customers.
- **Body**: `{ "email": "...", "password": "..." }`

### Claim Reward
- **Route**: `POST /customer/claim-reward/claim/:rewardId`
- **Description**: Customer claims a specific reward.
- **Header**: `Authorization: Bearer <access_token>`

---

## 🏢 System Owner (Admin)

### Create Tenant (Business)
- **Route**: `POST /system-owner/tenants`
- **Description**: Register a new business with an owner and a main branch.
- **Body**:
```json
{
  "owner": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword",
    "phone": "1234567890",
    "address": "123 Main St"
  },
  "business": {
    "name": "Jane's Coffee",
    "industry": "Food & Beverage",
    "country": "USA"
  },
  "branch": {
    "address": "123 Main St"
  }
}
```

### Get Tenant List
- **Route**: `GET /system-owner/tenants`
- **Query Params**: `page`, `limit`, `status` (active/inactive)

---

## 💼 Business Owner

### Create Staff
- **Route**: `POST /business-owner/manage-staff/create`
- **Body**:
```json
{
  "name": "Staff Name",
  "email": "staff@example.com",
  "password": "staffpassword",
  "branchId": "branch_id_here"
}
```

### Create Branch
- **Route**: `POST /business-owner/branchs/create`
- **Body**:
```json
{
  "branchName": "Downtown Branch",
  "branchLocation": "456 Side St",
  "managerName": "Manager Name",
  "city": "New York",
  "country": "USA"
}
```

### Create Subscription (Billing)
- **Route**: `POST /business-owner/buy-subscription/create`
- **Body**:
```json
{
  "status": "PAID"
}
```

### Reward Management (Earn)
- **Route**: `POST /business-owner/earn-reward/create`
- **Description**: Create a reward that customers can "earn" (multipart/form-data for image).
- **Body**:
```json
{
  "rewardName": "Loyalty Point Pack",
  "earnPoint": 100,
  "rewardType": "EARN",
  "earningRule": "Purchase above $10",
  "expiryDays": 30,
  "reward": "100 Points",
  "branchId": "branch_id_here",
  "image": "file_binary_here"
}
```

### Reward Management (Redeem)
- **Route**: `POST /business-owner/redeem-reward/create`
- **Description**: Create a reward that customers can "redeem" using points.
- **Body**:
```json
{
  "rewardName": "Free Coffee",
  "rewardPoints": 50,
  "rewardType": "FREE_ITEM",
  "earningRule": "Redeem 50 points",
  "expiryDays": 7,
  "reward": "1 Cup of Coffee",
  "branchId": "branch_id_here"
}
```

### Staff Permissions
- **Route**: `POST /business-owner/staff-permission/manage`
- **Description**: Set permissions for all staff members across the business.
- **Body**:
```json
{
  "allowAddingPoints": true,
  "allowRedeeming": true,
  "allowVoids": false,
  "viewCustomerList": true,
  "allowViewingActiveOffers": true,
  "editLoyaltyRulesOrOffers": false,
  "addRemoveOtherStaff": false
}
```

### Business Reviews
- **Route**: `GET /business-owner/reviews/all`
- **Description**: Get all reviews for the business across all branches.

- **Route**: `PATCH /business-owner/reviews/toggle-hide/:reviewId`
- **Description**: Toggle visibility of a review on the public profile.

---

## 🛠 Staff Module

### Customer Search
- **Route**: `GET /staff/customers/search?query=...`
- **Description**: Search customers by phone or email.

### Add Points to Customer (Staff)
- **Route**: `POST /staff/transactions/add-points`
- **Body**:
```json
{
  "customerId": "...",
  "points": 10
}
```

### Send Notification (Broadcasting)
- **Route**: `POST /staff/notifications`
- **Description**: Broadcast a message to all customers of the business (real-time via Socket.io).
- **Body**:
```json
{
  "message": "Special discount today only! Get 20% off all lattes."
}
```

---

> [!NOTE]
> All protected routes require a valid JWT token in the `Authorization` header: `Bearer <token>`.
> Some routes may also set cookies for secure session management.
