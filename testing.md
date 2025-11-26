# Testing Documentation - Apartment Management System

**Version:** 1.0  
**Date:** 2024  
**Project:** Intro to SE - SE02

---

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [UI Testing](#ui-testing)
3. [API Testing](#api-testing)
4. [Quick Reference](#quick-reference)

---

## Test Environment Setup

### Prerequisites

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Access the Application**
   - URL: http://localhost:3000
   - Login Page: http://localhost:3000/login

3. **Test Accounts** (Click demo buttons on login page)
   - **Admin:** Full system access
   - **Tenant 1:** Resident features only
   - **Tenant 2:** Resident features only

---

## UI Testing

### Login & Authentication ✓

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| UI-001 | Login as Admin | Click "Sign In as Demo Admin Account" | Redirected to feed, header shows "Sign Out" |
| UI-002 | Login as Tenant | Click "Sign In as Demo Tenant 1 Account" | Redirected to feed |
| UI-003 | Sign Out | Click "Sign Out" button | Redirected to index page |
| UI-004 | Profile Access | Click "Profile", view form | Profile dialog opens with user data |

### Admin Dashboard ✓

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| UI-005 | View All Users | Go to Admin Dashboard → Users | Table shows all users |
| UI-006 | Add User | Click "Add User", fill form, submit | User created, appears in list |
| UI-007 | Edit User | Click user row, modify data, save | Changes persist |
| UI-008 | View All Apartments | Go to Admin Dashboard → Apartments | Table shows all apartments |
| UI-009 | Add Apartment | Click "Add Apartment", fill form, submit | Apartment created |

### Apartment Management ✓

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| UI-010 | View Own Apartment | Click "View Apartment" | Apartment details and members shown |
| UI-011 | Assign User to Apartment | Admin → Edit User → Assign | User linked to apartment |
| UI-012 | Remove User from Apartment | Admin → Edit User → Remove | Assignment cleared |

### Vehicle Management ✓

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| UI-013 | Register Vehicle | Go to Properties → Vehicle → Register | Vehicle registered |
| UI-014 | Check In Vehicle | Click "Check In" | Entry logged with timestamp |
| UI-015 | Check Out Vehicle | Click "Check Out" | Exit logged with timestamp |
| UI-016 | View Vehicle Logs | Check "Logs" section | Entry/exit history displayed |

### Document Management ✓

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| UI-017 | Upload PDF | Click "Upload Document", select PDF | Document appears in list |
| UI-018 | View Document | Click document card | PDF opens in viewer |
| UI-019 | Delete Document | Click "Delete", confirm | Document removed |
| UI-020 | Reject Non-PDF | Upload .txt file | Error message shown |

### Property Management ✓

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| UI-021 | Add Property | Go to Properties → Add | Property added to list |
| UI-022 | Edit Property Name | Click edit, change name | Property name updated |
| UI-023 | Delete Property | Click delete, confirm | Property removed |
| UI-024 | Report Missing Property | Click "Report Missing Property", select, submit | Report created in feed |

### Feed & Posts ✓

| ID | Test Case | Steps | Expected Result |
|---|---|---|---|
| UI-025 | Create Post | Click "Create Post", type message, submit | Post appears in feed |
| UI-026 | View Feed | Check main feed | Posts and reports sorted chronologically |
| UI-027 | View Property Reports | Scroll feed | Reports show status and details |

---

## API Testing

### Users API

#### POST /api/users
**Create New User**

**Request:**
```json
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "Vu Ngoc Tung",
  "password": "password123"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "userId": "generated-uuid"
  }
}
```

**Validation:**
- ✅ Duplicate email returns `409 Conflict`
- ✅ Missing fields return `400 Bad Request`

---

#### GET /api/users
**Get All Users**

**Request:**
```
GET http://localhost:3000/api/users
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "User list fetched successfully.",
  "data": [
    {
      "userId": "uuid",
      "email": "user@example.com",
      "fullName": "Vu Ngoc Tung",
      "role": "tenant",
      "yearOfBirth": 2005,
      "gender": "male"
    }
  ]
}
```

---

#### GET /api/users/[id]
**Get User by ID**

**Request:**
```
GET http://localhost:3000/api/users/7ade6518-e951-417d-ab39-72868530ab44
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User fetched successfully.",
  "data": [
    {
      "userId": "7ade6518-e951-417d-ab39-72868530ab44",
      "email": "user@example.com",
      "fullName": "Vu Ngoc Tung",
      "role": "tenant",
      "yearOfBirth": 2005,
      "gender": "male"
    }
  ]
}
```

**Validation:**
- ✅ Invalid ID returns `404 Not Found`

---

#### PUT /api/users/[id]
**Update User**

**Request:**
```json
PUT http://localhost:3000/api/users/[id]
Content-Type: application/json

{
  "email": "updated@example.com",
  "fullName": "Vu Ngoc Tung",
  "role": "tenant",
  "yearOfBirth": 2005,
  "gender": "male"
}
```

**Expected Response:** `200 OK`

---

### Apartments API

#### GET /api/apartments
**Get All Apartments**

**Request:**
```
GET http://localhost:3000/api/apartments
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Apartment list fetched successfully.",
  "data": [{
    "apartmentId": 1,
    "buildingId": 1,
    "floor": 3,
    "apartmentNumber": 301,
    "monthlyFee": 1200
  }]
}
```

---

#### POST /api/apartments
**Create Apartment**

**Request:**
```json
POST http://localhost:3000/api/apartments
Content-Type: application/json

{
  "buildingId": 1,
  "floor": 3,
  "apartmentNumber": 301,
  "monthlyFee": 1200
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "message": "Apartment created successfully.",
  "data": {
    "apartmentId": 1
  }
}
```

---

#### GET /api/apartments/[id]
**Get Apartment by ID**

**Request:**
```
GET http://localhost:3000/api/apartments/1
```

**Expected Response:** 
```json
{
  "success": true,
  "message": "Apartment fetched successfully.",
  "data": {
    "apartmentId": 1,
    "buildingId": 1,
    "floor": 3,
    "apartmentNumber": 301,
    "monthlyFee": 1200
  }
}
```

---

#### PUT /api/apartments/[id]
**Update Apartment**

**Request:**
```json
PUT http://localhost:3000/api/apartments/1
Content-Type: application/json

{
  "buildingId": 1,
  "floor": 3,
  "apartmentNumber": 301,
  "monthlyFee": 1300
}
```

**Expected Response:** `200 OK`

---

#### PUT /api/users/[id]/apartments
**Assign User to Apartment**

**Request:**
```json
PUT http://localhost:3000/api/users/[userId]/apartments
Content-Type: application/json

{
  "apartmentId": 1
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "User added to apartment successfully",
  "data": {
    "apartmentId": 1
  }
}
```

---

#### DELETE /api/users/[id]/apartments
**Remove User from Apartment**

**Request:**
```
DELETE http://localhost:3000/api/users/[userId]/apartments
```

**Expected Response:** `200 OK`

---

### Vehicle API

#### POST /api/users/[id]/vehicle
**Register Vehicle**

**Request:**
```json
POST http://localhost:3000/api/users/[userId]/vehicle
Content-Type: application/json

{
  "licensePlate": "29A 99370"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "message": "Property and vehicle created successfully",
  "data": {
    "vehicleId": 1,
    "propertyId": 10,
    "licensePlate": "29A 99370"
  }
}
```

**Validation:**
- ✅ Duplicate license plate returns `409 Conflict`
- ✅ User already has vehicle returns `409 Conflict`

---

#### POST /api/users/[id]/vehicle/checkin
**Vehicle Check In**

**Request:**
```
POST http://localhost:3000/api/users/[userId]/vehicle/checkin
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Vehicle entered",
  "data": {
    "time": "2024-01-15T10:30:00.000Z"
  }
}
```

**Logic:** If vehicle is outside or has exit_time set, creates new log entry. If vehicle is inside, updates existing entry with exit_time.

---

#### GET /api/users/[id]/vehicles
**Get Vehicle Information**

**Request:**
```
GET http://localhost:3000/api/users/[userId]/vehicles
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Vehicle fetched successfully",
  "data": {
    "vehicleId": 1,
    "propertyId": 10,
    "licensePlate": "29A 99370"
  }
}
```

---

#### GET /api/users/[id]/vehicle-logs
**Get Vehicle Logs**

**Request:**
```
GET http://localhost:3000/api/users/[userId]/vehicle-logs
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "vehicleLogId": "uuid",
      "entranceTime": "2024-01-15T10:30:00.000Z",
      "exitTime": "2024-01-15T18:45:00.000Z"
    }
  ]
}
```

---

#### GET /api/vehicles/checkin
**Get All Vehicle Logs with Filtering**

**Request:**
```
GET http://localhost:3000/api/vehicles/checkin?userId=xxx&filter=week
```

**Query Parameters:**
- `userId` (optional): Filter by user
- `filter` (optional): `week` | `month` | `year`

**Expected Response:** `200 OK` with filtered logs

---

### Property API

#### GET /api/users/[id]/properties
**Get User Properties**

**Request:**
```
GET http://localhost:3000/api/users/[userId]/properties
```

**Expected Response:** `200 OK` with property array

---

#### POST /api/users/[id]/properties
**Create Property**

**Request:**
```json
POST http://localhost:3000/api/users/[userId]/properties
Content-Type: application/json

{
  "propertyName": "iPhone 15"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "propertyId": 5
  }
}
```

---

#### GET /api/properties/available
**Get Available Properties for Reporting**

**Request:**
```
GET http://localhost:3000/api/properties/available?userId=[userId]
```

**Expected Response:** `200 OK` with properties that can be reported (not currently lost)

---

#### PUT /api/users/[id]/properties/[propertyId]
**Update Property**

**Request:**
```json
PUT http://localhost:3000/api/users/[userId]/properties/5
Content-Type: application/json

{
  "propertyName": "iPhone 15 Pro"
}
```

**Expected Response:** `200 OK`

---

#### DELETE /api/users/[id]/properties/[propertyId]
**Delete Property**

**Request:**
```
DELETE http://localhost:3000/api/users/[userId]/properties/5
```

**Expected Response:** `200 OK`

---

### Property Reports API

#### GET /api/property-reports
**Get All Property Reports**

**Request:**
```
GET http://localhost:3000/api/property-reports
```

**Expected Response:** `200 OK` with reports array including owner and issuer names

---

#### POST /api/property-reports
**Create Property Report**

**Request:**
```json
POST http://localhost:3000/api/property-reports
Content-Type: application/json

{
  "userId": "user-uuid",
  "propertyId": 5,
  "content": "Lost my iPhone. Last seen in parking garage."
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "message": "Property report created successfully",
  "data": {
    "propertyReportId": "uuid",
    "userId": "user-uuid",
    "propertyId": 5,
    "status": "not found",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "content": "Lost my iPhone. Last seen in parking garage."
  }
}
```

**Validation:**
- ✅ Missing fields return `400 Bad Request`

---

#### PATCH /api/property-reports/[id]
**Update Property Report**

**Request:**
```json
PATCH http://localhost:3000/api/property-reports/[reportId]
Content-Type: application/json

{
  "status": "found",
  "issuerId": "admin-uuid"
}
```

**Expected Response:** `200 OK` with updated report

**Available Fields:**
- `approved` (boolean)
- `issuedStatus` (string)
- `status` (string: "found" | "not found")
- `issuerId` (string)

---

#### DELETE /api/property-reports/[id]
**Delete Property Report**

**Request:**
```
DELETE http://localhost:3000/api/property-reports/[reportId]
```

**Expected Response:** `200 OK`

---

### Posts API

#### GET /api/posts
**Get All Posts**

**Request:**
```
GET http://localhost:3000/api/posts
```

**Expected Response:** `200 OK` with posts array including user full names

---

#### POST /api/posts
**Create Post**

**Request:**
```json
POST http://localhost:3000/api/posts
Content-Type: application/json

{
  "content": "Welcome to our community! 🎉",
  "userId": "user-uuid"
}
```

**Expected Response:** `201 Created` with created post

**Validation:**
- ✅ Content required, returns `400 Bad Request` if missing

---

### Documents API

#### GET /api/users/[id]/documents
**List User Documents**

**Request:**
```
GET http://localhost:3000/api/users/[userId]/documents
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "name": "lease-agreement.pdf",
      "path": "user-uuid/lease-agreement.pdf"
    }
  ]
}
```

**Note:** Document upload handled directly via Supabase SDK

---

## Quick Reference

### Test Tools

**Recommended:**
- Browser DevTools (Network tab)
- Postman / Insomnia for API testing
- Browser Extensions (React DevTools)

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Common Test Scenarios

1. **Happy Path:** Valid inputs, expected success
2. **Negative Testing:** Invalid inputs, error handling
3. **Boundary Testing:** Edge cases, limits
4. **Security Testing:** XSS, SQL injection attempts

---

**End of Testing Documentation**