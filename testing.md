# API Testing Documentation

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [Test Data Reference](#test-data-reference)
3. [Authentication Tests](#authentication-tests)
4. [User Management Tests](#user-management-tests)
5. [Apartment Tests](#apartment-tests)
6. [Service Tests](#service-tests)
7. [Billing Tests](#billing-tests)
8. [Property Tests](#property-tests)
9. [Vehicle Tests](#vehicle-tests)
10. [Post Tests](#post-tests)
11. [Feedback Tests](#feedback-tests)
12. [Chat Tests](#chat-tests)
13. [Property Report Tests](#property-report-tests)
14. [System Tests](#system-tests)

---

## Test Environment Setup

### Base URL
```
http://localhost:3000/api
```

### Test Users (from dataset)

| User ID | Full Name | Email | Role | Password Hash | Apartment ID |
|---------|-----------|-------|------|---------------|--------------|
| `7ade6518-e951-417d-ab39-72868530ab44` | Vu Ngoc Tung | admin@gmail.com | admin | `$2a$12$0jwCtRjbbJ1AxRJK0Cb0F.5hVoms.iemFASy/h92uzz27G0C1v4Zu` | 27 |
| `f87566fa-d527-43aa-9bdc-4bf83b64d3c8` | Le Hai Anh | tenant@gmail.com | tenant | `$2a$12$hGuJAmTEgxPlwfJE9.FY0u0Ypi63lPCZEag0gYL4AFEnVoEpDfEey` | 43 |
| `5a57996d-62cd-4f66-9b43-063626152bf6` | Luong Huong Giang | police@gmail.com | police | `$2b$10$5cSklNvQR2ibxOWKG.PSUu0yhX/j.2AIybXF0b6c0q/QuJR8vq4.y` | 50 |
| `ca410831-786d-488e-aa80-a22aec09b4ba` | Le Phan Anh | accountant@gmail.com | accountant | `$2b$10$CMI6N6yd/NS.lvVH5Ajp.OD6R7gJFamEjDHmcWrtrBGtFw6dMvV7.` | 43 |

---

## Test Data Reference

### Sample Apartments
- Apartment ID: `3` - Building 1, Floor 1, Apt 101, Monthly Fee: 1000
- Apartment ID: `27` - Building 1, Floor 5, Apt 501, Monthly Fee: 1400
- Apartment ID: `43` - Building 2, Floor 4, Apt 401, Monthly Fee: 1300
- Apartment ID: `50` - Building 2, Floor 5, Apt 502, Monthly Fee: 1900

### Sample Services
- Service ID: `1` - Basic Cleaning, Price: 50.00, Tax: 3, Category: other
- Service ID: `2` - Deep Cleaning, Price: 50.00, Tax: 5
- Service ID: `3` - AC Maintenance, Price: 30.00, Tax: 3
- Service ID: `9` - Painting Service, Price: 100.00, Tax: 3

### Sample Properties
- Property ID: `1` - Laptop (electronics, found)
- Property ID: `2` - Vehicle (vehicle, found)
- Property ID: `4` - Honda JSX (vehicle, found)

### Sample Vehicles
- Vehicle ID: `1`, License Plate: `29A 99371`
- Vehicle ID: `4`, License Plate: `29A 00001`
- Vehicle ID: `5`, License Plate: `29A 56345`

---

## Authentication Tests

### Test Case: AUTH-001 - Successful Login (Admin)

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "userId": "7ade6518-e951-417d-ab39-72868530ab44",
    "role": "admin",
    "fullName": "Vu Ngoc Tung"
  }
}
```

**Status Code:** `200`

---

### Test Case: AUTH-002 - Successful Login (Tenant)

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "tenant@gmail.com",
  "password": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "role": "tenant",
    "fullName": "Le Hai Anh"
  }
}
```

**Status Code:** `200`

---

### Test Case: AUTH-003 - Invalid Credentials

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "wrongpassword"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Status Code:** `401`

---

### Test Case: AUTH-004 - Missing Email

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**Status Code:** `400`

---

### Test Case: AUTH-005 - Reset Password

**Request:**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "tenant@gmail.com",
  "phoneNumber": "",
  "newPassword": "newpassword123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": {
    "success": true
  }
}
```

**Status Code:** `200`

---

## User Management Tests

### Test Case: USER-001 - Create New User

**Request:**
```http
POST /api/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "fullName": "John Doe",
  "password": "password123",
  "role": "tenant",
  "yearOfBirth": 1990,
  "gender": "male",
  "phoneNumber": "1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "userId": "ca410831-786d-488e-aa80-a22aec09b4ba"
  }
}
```

**Status Code:** `201`

---

### Test Case: USER-002 - Get All Users (Admin)

**Request:**
```http
GET /api/users
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User list fetched successfully.",
  "data": [
    {
      "userId": "7ade6518-e951-417d-ab39-72868530ab44",
      "email": "admin@gmail.com",
      "fullName": "Vu Ngoc Tung",
      "role": "admin",
      "yearOfBirth": 2004,
      "gender": "male",
      "phoneNumber": null,
      "apartmentId": 27
    },
    {
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "email": "tenant@gmail.com",
      "fullName": "Le Hai Anh",
      "role": "tenant",
      "yearOfBirth": 2005,
      "gender": "male",
      "phoneNumber": null,
      "apartmentId": 43
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: USER-003 - Get User by ID

**Request:**
```http
GET /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Fetched user info",
  "data": {
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "email": "tenant@gmail.com",
    "fullName": "Le Hai Anh",
    "role": "tenant",
    "yearOfBirth": 2005,
    "gender": "male",
    "phoneNumber": null,
    "apartmentId": 43
  }
}
```

**Status Code:** `200`

---

### Test Case: USER-004 - Update User

**Request:**
```http
PUT /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8
Content-Type: application/json

{
  "fullName": "Le Hai Anh Updated",
  "phoneNumber": "0987654321",
  "yearOfBirth": 2005
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Updated user info",
  "data": {
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "email": "tenant@gmail.com",
    "fullName": "Le Hai Anh Updated",
    "role": "tenant",
    "yearOfBirth": 2005,
    "gender": "male",
    "phoneNumber": "0987654321",
    "apartmentId": 43
  }
}
```

**Status Code:** `200`

---

### Test Case: USER-005 - Search Users

**Request:**
```http
GET /api/users/search?q=Le Hai&userId=7ade6518-e951-417d-ab39-72868530ab44
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Users found",
  "data": [
    {
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "email": "tenant@gmail.com",
      "fullName": "Le Hai Anh",
      "role": "tenant",
      "yearOfBirth": 2005,
      "gender": "male",
      "phoneNumber": null,
      "apartmentId": 43
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: USER-006 - Get User Apartment

**Request:**
```http
GET /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/apartments
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Apartment fetched successfully",
  "data": {
    "apartmentId": 43,
    "buildingId": 2,
    "floor": 4,
    "apartmentNumber": 401,
    "monthlyFee": 1300,
    "members": [
      {
        "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
        "fullName": "Le Hai Anh",
        "email": "tenant@gmail.com"
      }
    ]
  }
}
```

**Status Code:** `200`

---

### Test Case: USER-007 - Assign User to Apartment

**Request:**
```http
PUT /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/apartments
Content-Type: application/json

{
  "apartmentId": 3
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User added to apartment successfully",
  "data": {
    "apartmentId": 3
  }
}
```

**Status Code:** `200`

---

### Test Case: USER-008 - Get User Billings

**Request:**
```http
GET /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/billings
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User billings fetched successfully.",
  "data": [
    {
      "billingId": "0e00399d-adb1-44fd-a3a9-eb46d40871c0",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "fullName": "Le Hai Anh",
      "totalPrice": 64.0,
      "billingStatus": "paid",
      "dueDate": "2025-12-11T12:50:24.993Z",
      "periodStart": "2025-11-26T12:50:24.993Z",
      "periodEnd": "2025-12-26T12:50:24.993Z",
      "paidAt": "2025-11-26T12:50:46.680396Z",
      "services": [
        {
          "serviceId": 1,
          "serviceName": "Basic Cleaning",
          "price": 50.00,
          "tax": 3,
          "description": "Standard apartment cleaning service including vacuuming, dusting, and bathroom sanitization"
        },
        {
          "serviceId": 2,
          "serviceName": "Deep Cleaning",
          "price": 50.00,
          "tax": 5,
          "description": "Comprehensive cleaning service including inside cabinets, windows, and detailed sanitization"
        }
      ]
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: USER-009 - Get User Properties

**Request:**
```http
GET /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/properties
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [
    {
      "propertyId": 1,
      "propertyName": "Laptop",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "isPublic": false,
      "propertyType": "electronics",
      "status": "found",
      "createdAt": "2025-11-26T10:25:24.971672Z",
      "licensePlate": null
    },
    {
      "propertyId": 2,
      "propertyName": "Vehicle",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "isPublic": false,
      "propertyType": "vehicle",
      "status": "found",
      "createdAt": "2025-11-26T10:32:19.176389Z",
      "licensePlate": "29A 00001"
    }
  ]
}
```

**Status Code:** `200`

---

## Apartment Tests

### Test Case: APT-001 - Get All Apartments

**Request:**
```http
GET /api/apartments
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Apartments fetched successfully.",
  "data": [
    {
      "apartmentId": 3,
      "buildingId": 1,
      "floor": 1,
      "apartmentNumber": 101,
      "monthlyFee": 1000,
      "members": [
        {
          "userId": "5deb0d61-0786-4136-823e-e5c61cb7add3",
          "fullName": "Velvet Dericot",
          "email": "vdericot2@newsvine.com"
        }
      ]
    },
    {
      "apartmentId": 27,
      "buildingId": 1,
      "floor": 5,
      "apartmentNumber": 501,
      "monthlyFee": 1400,
      "members": [
        {
          "userId": "7ade6518-e951-417d-ab39-72868530ab44",
          "fullName": "Vu Ngoc Tung",
          "email": "admin@gmail.com"
        }
      ]
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: APT-002 - Create Apartment

**Request:**
```http
POST /api/apartments
Content-Type: application/json

{
  "buildingId": 1,
  "floor": 6,
  "apartmentNumber": 601,
  "monthlyFee": 1500
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Apartment created successfully.",
  "data": {
    "apartmentId": 58
  }
}
```

**Status Code:** `201`

---

### Test Case: APT-003 - Get Apartment by ID

**Request:**
```http
GET /api/apartments/27
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Fetched apartment",
  "data": {
    "apartmentId": 27,
    "buildingId": 1,
    "floor": 5,
    "apartmentNumber": 501,
    "monthlyFee": 1400,
    "members": [
      {
        "userId": "7ade6518-e951-417d-ab39-72868530ab44",
        "fullName": "Vu Ngoc Tung",
        "email": "admin@gmail.com"
      }
    ]
  }
}
```

**Status Code:** `200`

---

### Test Case: APT-004 - Update Apartment

**Request:**
```http
PUT /api/apartments/27
Content-Type: application/json

{
  "buildingId": 1,
  "floor": 5,
  "apartmentNumber": 501,
  "monthlyFee": 1600
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Apartment updated successfully.",
  "data": {
    "apartmentId": 27,
    "buildingId": 1,
    "floor": 5,
    "apartmentNumber": 501,
    "monthlyFee": 1600
  }
}
```

**Status Code:** `200`

---

### Test Case: APT-005 - Delete Apartment

**Request:**
```http
DELETE /api/apartments/27
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Apartment deleted successfully.",
  "data": null
}
```

**Status Code:** `200`

---

## Service Tests

### Test Case: SVC-001 - Get All Services

**Request:**
```http
GET /api/services
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Services fetched successfully.",
  "data": [
    {
      "serviceId": 1,
      "serviceName": "Basic Cleaning",
      "price": 50.00,
      "description": "Standard apartment cleaning service including vacuuming, dusting, and bathroom sanitization",
      "tax": 3,
      "category": "other",
      "isAvailable": true,
      "updatedAt": "2025-12-24T10:42:24.172432Z"
    },
    {
      "serviceId": 2,
      "serviceName": "Deep Cleaning",
      "price": 50.00,
      "description": "Comprehensive cleaning service including inside cabinets, windows, and detailed sanitization",
      "tax": 5,
      "category": null,
      "isAvailable": true,
      "updatedAt": "2025-11-26T12:48:09.331717Z"
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: SVC-002 - Get Services with Filters

**Request:**
```http
GET /api/services?category=cleaning&availability=available&search=cleaning
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Services fetched successfully.",
  "data": [
    {
      "serviceId": 1,
      "serviceName": "Basic Cleaning",
      "price": 50.00,
      "description": "Standard apartment cleaning service including vacuuming, dusting, and bathroom sanitization",
      "tax": 3,
      "category": "other",
      "isAvailable": true,
      "updatedAt": "2025-12-24T10:42:24.172432Z"
    },
    {
      "serviceId": 18,
      "serviceName": "ve sinh",
      "price": 10.00,
      "description": "123",
      "tax": 5,
      "category": "cleaning",
      "isAvailable": true,
      "updatedAt": "2025-12-17T00:56:45.803795Z"
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: SVC-003 - Create Service

**Request:**
```http
POST /api/services
Content-Type: application/json

{
  "serviceName": "Window Cleaning",
  "price": 25.00,
  "description": "Professional window cleaning service",
  "tax": 3,
  "category": "cleaning",
  "isAvailable": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Service created successfully.",
  "data": {
    "serviceId": 20
  }
}
```

**Status Code:** `201`

---

### Test Case: SVC-004 - Get Service by ID

**Request:**
```http
GET /api/services/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Service fetched successfully.",
  "data": {
    "serviceId": 1,
    "serviceName": "Basic Cleaning",
    "price": 50.00,
    "description": "Standard apartment cleaning service including vacuuming, dusting, and bathroom sanitization",
    "tax": 3,
    "category": "other",
    "isAvailable": true,
    "updatedAt": "2025-12-24T10:42:24.172432Z"
  }
}
```

**Status Code:** `200`

---

### Test Case: SVC-005 - Update Service

**Request:**
```http
PUT /api/services/1
Content-Type: application/json

{
  "serviceName": "Basic Cleaning Updated",
  "price": 55.00,
  "description": "Updated description",
  "tax": 3,
  "category": "cleaning",
  "isAvailable": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Service updated successfully.",
  "data": {
    "serviceId": 1,
    "serviceName": "Basic Cleaning Updated",
    "price": 55.00,
    "description": "Updated description",
    "tax": 3,
    "category": "cleaning",
    "isAvailable": true,
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Status Code:** `200`

---

### Test Case: SVC-006 - Delete Service

**Request:**
```http
DELETE /api/services/1
Content-Type: application/json

{
  "serviceId": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully.",
  "data": null
}
```

**Status Code:** `200`

---

## Billing Tests

### Test Case: BILL-001 - Get All Billings

**Request:**
```http
GET /api/billings
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Billings fetched successfully.",
  "data": [
    {
      "billingId": "0e00399d-adb1-44fd-a3a9-eb46d40871c0",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "fullName": "Le Hai Anh",
      "billingStatus": "paid",
      "dueDate": "2025-12-11T12:50:24.993Z",
      "periodStart": "2025-11-26T12:50:24.993Z",
      "periodEnd": "2025-12-26T12:50:24.993Z",
      "paidAt": "2025-11-26T12:50:46.680396Z",
      "serviceCount": 2,
      "totalAmount": 108.0,
      "services": [
        {
          "serviceId": 1,
          "serviceName": "Basic Cleaning",
          "price": 50.00,
          "description": "Standard apartment cleaning service including vacuuming, dusting, and bathroom sanitization",
          "tax": 3
        },
        {
          "serviceId": 2,
          "serviceName": "Deep Cleaning",
          "price": 50.00,
          "description": "Comprehensive cleaning service including inside cabinets, windows, and detailed sanitization",
          "tax": 5
        }
      ]
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: BILL-002 - Get Billings with Filters

**Request:**
```http
GET /api/billings?userId=f87566fa-d527-43aa-9bdc-4bf83b64d3c8&status=paid&limit=10
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Billings fetched successfully.",
  "data": [
    {
      "billingId": "0e00399d-adb1-44fd-a3a9-eb46d40871c0",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "fullName": "Le Hai Anh",
      "billingStatus": "paid",
      "dueDate": "2025-12-11T12:50:24.993Z",
      "periodStart": "2025-11-26T12:50:24.993Z",
      "periodEnd": "2025-12-26T12:50:24.993Z",
      "paidAt": "2025-11-26T12:50:46.680396Z",
      "serviceCount": 2,
      "totalAmount": 108.0,
      "services": [
        {
          "serviceId": 1,
          "serviceName": "Basic Cleaning",
          "price": 50.00,
          "description": "Standard apartment cleaning service including vacuuming, dusting, and bathroom sanitization",
          "tax": 3
        },
        {
          "serviceId": 2,
          "serviceName": "Deep Cleaning",
          "price": 50.00,
          "description": "Comprehensive cleaning service including inside cabinets, windows, and detailed sanitization",
          "tax": 5
        }
      ]
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: BILL-003 - Create Billing

**Request:**
```http
POST /api/billings
Content-Type: application/json

{
  "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
  "serviceIds": [1, 3],
  "dueDate": "2026-01-15",
  "periodStart": "2025-12-26",
  "periodEnd": "2026-01-25"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Billing created successfully.",
  "data": {
    "billingId": "ca410831-786d-488e-aa80-a22aec09b4ba"
  }
}
```

**Status Code:** `201`

---

### Test Case: BILL-004 - Get Billing by ID

**Request:**
```http
GET /api/billings/0e00399d-adb1-44fd-a3a9-eb46d40871c0
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Billing details fetched successfully.",
  "data": {
    "billingId": "0e00399d-adb1-44fd-a3a9-eb46d40871c0",
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "fullName": "Le Hai Anh",
    "totalPrice": 108.0,
    "billingStatus": "paid",
    "dueDate": "2025-12-11T12:50:24.993Z",
    "periodStart": "2025-11-26T12:50:24.993Z",
    "periodEnd": "2025-12-26T12:50:24.993Z",
    "paidAt": "2025-11-26T12:50:46.680396Z",
    "services": [
      {
        "serviceId": 1,
        "serviceName": "Basic Cleaning",
        "price": 50.00,
        "tax": 3,
        "description": "Standard apartment cleaning service including vacuuming, dusting, and bathroom sanitization"
      },
      {
        "serviceId": 2,
        "serviceName": "Deep Cleaning",
        "price": 50.00,
        "tax": 5,
        "description": "Comprehensive cleaning service including inside cabinets, windows, and detailed sanitization"
      }
    ]
  }
}
```

**Status Code:** `200`

---

### Test Case: BILL-005 - Mark Billing as Paid

**Request:**
```http
PUT /api/billings/0e00399d-adb1-44fd-a3a9-eb46d40871c0
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Billing paid successfully.",
  "data": null
}
```

**Status Code:** `200`

---

### Test Case: BILL-006 - Get Billing PDF

**Request:**
```http
GET /api/billings/0e00399d-adb1-44fd-a3a9-eb46d40871c0/file
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Billing PDF generated",
  "data": {
    "billingId": "0e00399d-adb1-44fd-a3a9-eb46d40871c0",
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "fullName": "Le Hai Anh",
    "totalPrice": 108.0,
    "billingStatus": "paid",
    "dueDate": "2025-12-11T12:50:24.993Z",
    "periodStart": "2025-11-26T12:50:24.993Z",
    "periodEnd": "2025-12-26T12:50:24.993Z",
    "paidAt": "2025-11-26T12:50:46.680396Z",
    "services": [
      {
        "serviceId": 1,
        "serviceName": "Basic Cleaning",
        "price": 50.00,
        "tax": 3,
        "description": "Standard apartment cleaning service including vacuuming, dusting, and bathroom sanitization"
      },
      {
        "serviceId": 2,
        "serviceName": "Deep Cleaning",
        "price": 50.00,
        "tax": 5,
        "description": "Comprehensive cleaning service including inside cabinets, windows, and detailed sanitization"
      }
    ],
    "file": "<base64-encoded-pdf>"
  }
}
```

**Status Code:** `200`

---

### Test Case: BILL-007 - Bulk Collect Rent

**Request:**
```http
POST /api/billings/bulk-collect
Content-Type: application/json

{
  "type": "rent"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bulk rent collection completed. Created 55 billings.",
  "data": {
    "billingCount": 55,
    "serviceId": 1400
  }
}
```

**Status Code:** `201`

---

### Test Case: BILL-008 - Bulk Collect Other Fees

**Request:**
```http
POST /api/billings/bulk-collect
Content-Type: application/json

{
  "type": "other",
  "name": "Phí ủng hộ",
  "price": 5.00
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bulk fee collection completed. Created 55 billings.",
  "data": {
    "billingCount": 55,
    "serviceId": 999047
  }
}
```

**Status Code:** `201`

---

### Test Case: BILL-009 - Rollback Latest Billings

**Request:**
```http
POST /api/billings/rollback
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Rollback completed. Deleted 55 billings.",
  "data": {
    "deletedCount": 55
  }
}
```

**Status Code:** `200`

---

## Property Tests

### Test Case: PROP-001 - Get All Properties

**Request:**
```http
GET /api/properties
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [
    {
      "propertyId": 1,
      "propertyName": "Laptop",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "isPublic": false,
      "propertyType": "electronics",
      "status": "found",
      "createdAt": "2025-11-26T10:25:24.971672Z",
      "licensePlate": null,
      "ownerName": "Le Hai Anh",
      "totalReports": 0,
      "lastReportedAt": null
    },
    {
      "propertyId": 2,
      "propertyName": "Vehicle",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "isPublic": false,
      "propertyType": "vehicle",
      "status": "found",
      "createdAt": "2025-11-26T10:32:19.176389Z",
      "licensePlate": "29A 00001",
      "ownerName": "Le Hai Anh",
      "totalReports": 0,
      "lastReportedAt": null
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: PROP-002 - Get Available Properties

**Request:**
```http
GET /api/properties/available?userId=f87566fa-d527-43aa-9bdc-4bf83b64d3c8
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Available properties fetched successfully",
  "data": [
    {
      "propertyId": 1,
      "propertyName": "Laptop",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "isPublic": false,
      "propertyType": "electronics",
      "status": "found",
      "createdAt": "2025-11-26T10:25:24.971672Z"
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: PROP-003 - Create Property

**Request:**
```http
POST /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/properties
Content-Type: application/json

{
  "propertyName": "iPhone 15 Pro",
  "propertyType": "electronics",
  "isPublic": false
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "propertyId": 310
  }
}
```

**Status Code:** `201`

---

### Test Case: PROP-004 - Create Vehicle Property

**Request:**
```http
POST /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/properties
Content-Type: application/json

{
  "propertyName": "Honda Civic",
  "propertyType": "vehicle",
  "isPublic": false,
  "licensePlate": "29A 12345"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "propertyId": 311
  }
}
```

**Status Code:** `201`

---

### Test Case: PROP-005 - Get User Property by ID

**Request:**
```http
GET /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/properties/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property fetched successfully",
  "data": {
    "propertyId": 1,
    "propertyName": "Laptop",
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "isPublic": false,
    "propertyType": "electronics",
    "status": "found",
    "createdAt": "2025-11-26T10:25:24.971672Z",
    "licensePlate": null
  }
}
```

**Status Code:** `200`

---

### Test Case: PROP-006 - Update Property

**Request:**
```http
PUT /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/properties/1
Content-Type: application/json

{
  "propertyName": "MacBook Pro",
  "status": "found"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "propertyId": 1,
    "propertyName": "MacBook Pro",
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "isPublic": false,
    "propertyType": "electronics",
    "status": "found",
    "createdAt": "2025-11-26T10:25:24.971672Z",
    "licensePlate": null
  }
}
```

**Status Code:** `200`

---

### Test Case: PROP-007 - Delete Property

**Request:**
```http
DELETE /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/properties/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property deleted successfully",
  "data": {
    "propertyId": 1,
    "propertyName": "Laptop",
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "isPublic": false,
    "propertyType": "electronics",
    "status": "deleted",
    "createdAt": "2025-11-26T10:25:24.971672Z",
    "licensePlate": null
  }
}
```

**Status Code:** `200`

---

## Vehicle Tests

### Test Case: VEH-001 - Get Vehicle Info

**Request:**
```http
GET /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/vehicles
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Vehicle info fetched successfully",
  "data": {
    "vehicleId": 4,
    "propertyId": 2,
    "licensePlate": "29A 00001"
  }
}
```

**Status Code:** `200`

---

### Test Case: VEH-002 - Create Vehicle

**Request:**
```http
POST /api/users/fae21f36-1490-40e5-b919-32a2a8edc350/vehicle
Content-Type: application/json

{
  "licensePlate": "29A 99999"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property and vehicle created successfully",
  "data": {
    "vehicleId": 7,
    "propertyId": 312,
    "licensePlate": "29A 99999"
  }
}
```

**Status Code:** `201`

---

### Test Case: VEH-003 - Update Vehicle License Plate

**Request:**
```http
PUT /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/vehicle/4
Content-Type: application/json

{
  "licensePlate": "29A 88888"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "License plate updated successfully",
  "data": {
    "vehicleId": 4,
    "propertyId": 2,
    "licensePlate": "29A 88888"
  }
}
```

**Status Code:** `200`

---

### Test Case: VEH-004 - Vehicle Check-in

**Request:**
```http
POST /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/vehicle/checkin
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Vehicle entered",
  "data": {
    "time": "2025-12-26T10:00:00.000Z"
  }
}
```

**Status Code:** `200`

---

### Test Case: VEH-005 - Get Vehicle Logs

**Request:**
```http
GET /api/users/f87566fa-d527-43aa-9bdc-4bf83b64d3c8/vehicle-logs
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Vehicle logs fetched successfully",
  "data": [
    {
      "vehicleLogId": "077978d7-255a-41a2-a88d-61513912687e",
      "entranceTime": "2025-10-27T12:24:36.624Z",
      "exitTime": "2025-10-27T12:24:41.45Z"
    },
    {
      "vehicleLogId": "146a9ce2-3f4e-43ca-b70b-e6bed94f328d",
      "entranceTime": "2025-10-27T14:26:18.000Z",
      "exitTime": "2025-10-27T14:27:58.000Z"
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: VEH-006 - Get All Vehicle Logs (Admin)

**Request:**
```http
GET /api/vehicles/checkin
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Fetched vehicle logs successfully.",
  "data": {
    "logs": [
      {
        "vehicleLogId": "077978d7-255a-41a2-a88d-61513912687e",
        "entranceTime": "2025-10-27T12:24:36.624Z",
        "exitTime": "2025-10-27T12:24:41.45Z",
        "vehicleId": 1,
        "licensePlate": "29A 99371",
        "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
        "fullName": "Le Hai Anh",
        "apartmentId": 43,
        "apartmentNumber": 401,
        "buildingId": 2,
        "floor": 4
      }
    ]
  }
}
```

**Status Code:** `200`

---

### Test Case: VEH-007 - Get Vehicle Logs with Filter

**Request:**
```http
GET /api/vehicles/checkin?userId=f87566fa-d527-43aa-9bdc-4bf83b64d3c8&filter=month
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Fetched vehicle logs successfully.",
  "data": {
    "logs": [
      {
        "vehicleLogId": "077978d7-255a-41a2-a88d-61513912687e",
        "entranceTime": "2025-10-27T12:24:36.624Z",
        "exitTime": "2025-10-27T12:24:41.45Z",
        "vehicleId": 1,
        "licensePlate": "29A 99371",
        "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
        "fullName": "Le Hai Anh",
        "apartmentId": 43,
        "apartmentNumber": 401,
        "buildingId": 2,
        "floor": 4
      }
    ]
  }
}
```

**Status Code:** `200`

---

## Post Tests

### Test Case: POST-001 - Get All Posts

**Request:**
```http
GET /api/posts
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Posts fetched successfully",
  "data": [
    {
      "postId": "0e06012d-7384-4abc-a0a0-3d845941717c",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "content": "Test",
      "createdAt": "2025-10-29T02:48:04.649692Z",
      "fullName": "Le Hai Anh",
      "category": "general",
      "title": null
    },
    {
      "postId": "5ab3f6aa-9de4-4e45-aed8-06230c9a20de",
      "userId": "7ade6518-e951-417d-ab39-72868530ab44",
      "content": "### Traffic congestion notice\n\nTo avoid congestion during rush hours, please respect the queue when you checkin in the parking lot. Thank you for your cooperation.",
      "createdAt": "2025-10-23T12:42:56.896655Z",
      "fullName": "Vu Ngoc Tung",
      "category": "general",
      "title": "Traffic congestion notice\n"
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: POST-002 - Get Posts by Category

**Request:**
```http
GET /api/posts?category=building_issues
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Posts fetched successfully",
  "data": [
    {
      "postId": "60472ddf-4d4f-4601-8d0c-6f5dfc25464e",
      "userId": "5a57996d-62cd-4f66-9b43-063626152bf6",
      "content": "The elevator has been damaged",
      "createdAt": "2025-12-14T13:42:47.197329Z",
      "fullName": "Luong Huong Giang",
      "category": "building_issues",
      "title": "Repairing Elevator"
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: POST-003 - Create Post

**Request:**
```http
POST /api/posts
Content-Type: application/json

{
  "content": "New announcement for all residents",
  "userId": "7ade6518-e951-417d-ab39-72868530ab44",
  "category": "general",
  "title": "Important Announcement"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Post created",
  "data": {
    "postId": "5245abb0-c3ba-477f-acee-7906f68544f9",
    "userId": "7ade6518-e951-417d-ab39-72868530ab44",
    "content": "New announcement for all residents",
    "createdAt": "2025-12-26T10:00:00.000Z",
    "fullName": "Vu Ngoc Tung",
    "category": "general",
    "title": "Important Announcement"
  }
}
```

**Status Code:** `201`

---

### Test Case: POST-004 - Get Post by ID

**Request:**
```http
GET /api/posts/5ab3f6aa-9de4-4e45-aed8-06230c9a20de
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Post fetched successfully",
  "data": {
    "postId": "5ab3f6aa-9de4-4e45-aed8-06230c9a20de",
    "userId": "7ade6518-e951-417d-ab39-72868530ab44",
    "content": "### Traffic congestion notice\n\nTo avoid congestion during rush hours, please respect the queue when you checkin in the parking lot. Thank you for your cooperation.",
    "createdAt": "2025-10-23T12:42:56.896655Z",
    "fullName": "Vu Ngoc Tung",
    "category": "general",
    "title": "Traffic congestion notice\n"
  }
}
```

**Status Code:** `200`

---

### Test Case: POST-005 - Update Post

**Request:**
```http
PATCH /api/posts/5ab3f6aa-9de4-4e45-aed8-06230c9a20de
Content-Type: application/json

{
  "userId": "7ade6518-e951-417d-ab39-72868530ab44",
  "content": "Updated content",
  "title": "Updated Title"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "postId": "5ab3f6aa-9de4-4e45-aed8-06230c9a20de",
    "userId": "7ade6518-e951-417d-ab39-72868530ab44",
    "content": "Updated content",
    "createdAt": "2025-10-23T12:42:56.896655Z",
    "fullName": "Vu Ngoc Tung",
    "category": "general",
    "title": "Updated Title"
  }
}
```

**Status Code:** `200`

---

### Test Case: POST-006 - Delete Post

**Request:**
```http
DELETE /api/posts/5ab3f6aa-9de4-4e45-aed8-06230c9a20de
Content-Type: application/json

{
  "userId": "7ade6518-e951-417d-ab39-72868530ab44"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": null
}
```

**Status Code:** `200`

---

## Feedback Tests

### Test Case: FB-001 - Get All Feedbacks

**Request:**
```http
GET /api/feedbacks
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feedbacks fetched successfully",
  "data": [
    {
      "feedbackId": "13ebbd9d-2e21-4dee-aae9-51fbed6ae534",
      "userId": "09cc29a7-5c59-4ca6-b708-edf14a6143bd",
      "content": "The building is extremely loud at midnight",
      "tags": ["security", "complain"],
      "status": "resolved",
      "createdAt": "2025-12-09T16:39:48.390905Z",
      "updatedAt": "2025-12-14T10:06:23.467544Z",
      "fullName": "Hersch Walch"
    },
    {
      "feedbackId": "c6f54617-8941-4dc6-8f55-7c31f6a3f517",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "content": "My apartment is having trouble with the fridge, please assign someone to fix it soon.",
      "tags": ["maintenance"],
      "status": "in_progress",
      "createdAt": "2025-11-26T16:11:01.335414Z",
      "updatedAt": "2025-11-27T11:42:12.675751Z",
      "fullName": "Le Hai Anh"
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: FB-002 - Get Feedbacks with Filters

**Request:**
```http
GET /api/feedbacks?userId=f87566fa-d527-43aa-9bdc-4bf83b64d3c8&status=in_progress
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feedbacks fetched successfully",
  "data": [
    {
      "feedbackId": "c6f54617-8941-4dc6-8f55-7c31f6a3f517",
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "content": "My apartment is having trouble with the fridge, please assign someone to fix it soon.",
      "tags": ["maintenance"],
      "status": "in_progress",
      "createdAt": "2025-11-26T16:11:01.335414Z",
      "updatedAt": "2025-11-27T11:42:12.675751Z",
      "fullName": "Le Hai Anh"
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: FB-003 - Create Feedback

**Request:**
```http
POST /api/feedbacks
Content-Type: application/json

{
  "content": "The water pressure in my apartment is very low",
  "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
  "tags": ["maintenance", "utilities"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feedback created",
  "data": {
    "feedbackId": "5245abb0-c3ba-477f-acee-7906f68544f9",
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "content": "The water pressure in my apartment is very low",
    "tags": ["maintenance", "utilities"],
    "status": "pending",
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z",
    "fullName": "Le Hai Anh"
  }
}
```

**Status Code:** `201`

---

### Test Case: FB-004 - Get Feedback by ID

**Request:**
```http
GET /api/feedbacks/c6f54617-8941-4dc6-8f55-7c31f6a3f517
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feedback fetched successfully",
  "data": {
    "feedbackId": "c6f54617-8941-4dc6-8f55-7c31f6a3f517",
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "content": "My apartment is having trouble with the fridge, please assign someone to fix it soon.",
    "tags": ["maintenance"],
    "status": "in_progress",
    "createdAt": "2025-11-26T16:11:01.335414Z",
    "updatedAt": "2025-11-27T11:42:12.675751Z",
    "fullName": "Le Hai Anh"
  }
}
```

**Status Code:** `200`

---

### Test Case: FB-005 - Update Feedback Status (Admin)

**Request:**
```http
PATCH /api/feedbacks/c6f54617-8941-4dc6-8f55-7c31f6a3f517
Content-Type: application/json

{
  "status": "resolved",
  "tags": ["maintenance", "resolved"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feedback updated successfully",
  "data": {
    "feedbackId": "c6f54617-8941-4dc6-8f55-7c31f6a3f517",
    "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "content": "My apartment is having trouble with the fridge, please assign someone to fix it soon.",
    "tags": ["maintenance", "resolved"],
    "status": "resolved",
    "createdAt": "2025-11-26T16:11:01.335414Z",
    "updatedAt": "2025-12-26T10:00:00.000Z",
    "fullName": "Le Hai Anh"
  }
}
```

**Status Code:** `200`

---

### Test Case: FB-006 - Delete Feedback

**Request:**
```http
DELETE /api/feedbacks/c6f54617-8941-4dc6-8f55-7c31f6a3f517
Content-Type: application/json

{
  "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feedback deleted successfully",
  "data": null
}
```

**Status Code:** `200`

---

## Chat Tests

### Test Case: CHAT-001 - Get All Chats

**Request:**
```http
GET /api/chats?userId=f87566fa-d527-43aa-9bdc-4bf83b64d3c8
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Chats fetched successfully",
  "data": [
    {
      "chatId": "e972615d-146e-4e63-82ba-838b7dda1996",
      "user1Id": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "user2Id": "7ade6518-e951-417d-ab39-72868530ab44",
      "createdAt": "2025-12-20T10:00:00.000Z",
      "updatedAt": "2025-12-26T09:30:00.000Z",
      "otherUser": {
        "userId": "7ade6518-e951-417d-ab39-72868530ab44",
        "email": "admin@gmail.com",
        "fullName": "Vu Ngoc Tung",
        "role": "admin",
        "yearOfBirth": 2004,
        "gender": "male",
        "phoneNumber": null,
        "apartmentId": 27
      },
      "lastMessage": {
        "messageId": "e70c2665-96f8-4450-9965-810cc48ba907",
        "chatId": "e972615d-146e-4e63-82ba-838b7dda1996",
        "senderId": "7ade6518-e951-417d-ab39-72868530ab44",
        "content": "Hello, how can I help you?",
        "createdAt": "2025-12-26T09:30:00.000Z",
        "readAt": null
      },
      "unreadCount": 1
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: CHAT-002 - Create Chat

**Request:**
```http
POST /api/chats
Content-Type: application/json

{
  "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
  "otherUserId": "7ade6518-e951-417d-ab39-72868530ab44"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Chat created successfully",
  "data": {
    "chatId": "5245abb0-c3ba-477f-acee-7906f68544f9",
    "user1Id": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "user2Id": "7ade6518-e951-417d-ab39-72868530ab44",
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z",
    "otherUser": {
      "userId": "7ade6518-e951-417d-ab39-72868530ab44",
      "email": "admin@gmail.com",
      "fullName": "Vu Ngoc Tung",
      "role": "admin",
      "yearOfBirth": 2004,
      "gender": "male",
      "phoneNumber": null,
      "apartmentId": 27
    }
  }
}
```

**Status Code:** `201`

---

### Test Case: CHAT-003 - Get Chat Messages

**Request:**
```http
GET /api/chats/e972615d-146e-4e63-82ba-838b7dda1996/messages?userId=f87566fa-d527-43aa-9bdc-4bf83b64d3c8
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Messages fetched successfully",
  "data": [
    {
      "messageId": "fbd1b994-d56e-4e10-ad76-0f1e757e746b",
      "chatId": "7ade6518-e951-417d-ab39-72868530ab44",
      "senderId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "content": "Hello, I need help with my billing",
      "createdAt": "2025-12-26T09:00:00.000Z",
      "readAt": null,
      "sender": {
        "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
        "email": "tenant@gmail.com",
        "fullName": "Le Hai Anh",
        "role": "tenant",
        "yearOfBirth": 2005,
        "gender": "male",
        "phoneNumber": null,
        "apartmentId": 43
      }
    },
    {
      "messageId": "7ade6518-e951-417d-ab39-72868530ab44",
      "chatId": "b9be5378-3fbb-44b5-b1b0-618c72d34d7b",
      "senderId": "7ade6518-e951-417d-ab39-72868530ab44",
      "content": "Hello, how can I help you?",
      "createdAt": "2025-12-26T09:30:00.000Z",
      "readAt": null,
      "sender": {
        "userId": "7ade6518-e951-417d-ab39-72868530ab44",
        "email": "admin@gmail.com",
        "fullName": "Vu Ngoc Tung",
        "role": "admin",
        "yearOfBirth": 2004,
        "gender": "male",
        "phoneNumber": null,
        "apartmentId": 27
      }
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: CHAT-004 - Send Message

**Request:**
```http
POST /api/chats/b9be5378-3fbb-44b5-b1b0-618c72d34d7b/messages
Content-Type: application/json

{
  "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
  "content": "Thank you for your help!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "5245abb0-c3ba-477f-acee-7906f68544f9",
    "chatId": "b9be5378-3fbb-44b5-b1b0-618c72d34d7b",
    "senderId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "content": "Thank you for your help!",
    "createdAt": "2025-12-26T10:00:00.000Z",
    "readAt": null,
    "sender": {
      "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "email": "tenant@gmail.com",
      "fullName": "Le Hai Anh",
      "role": "tenant",
      "yearOfBirth": 2005,
      "gender": "male",
      "phoneNumber": null,
      "apartmentId": 43
    }
  }
}
```

**Status Code:** `201`

---

## Property Report Tests

### Test Case: PR-001 - Get All Property Reports

**Request:**
```http
GET /api/property-reports
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property reports fetched successfully",
  "data": [
    {
      "propertyReportId": "b9be5378-3fbb-44b5-b1b0-618c72d34d7b",
      "ownerId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
      "propertyId": 1,
      "status": "not found",
      "createdAt": "2025-12-20T10:00:00.000Z",
      "issuerId": null,
      "ownerFullName": "Le Hai Anh",
      "issuerFullName": null,
      "updatedAt": "2025-12-20T10:00:00.000Z",
      "propertyName": "Laptop",
      "content": "I lost my laptop in the lobby",
      "issuedStatus": null,
      "approved": false
    }
  ]
}
```

**Status Code:** `200`

---

### Test Case: PR-002 - Create Property Report

**Request:**
```http
POST /api/property-reports
Content-Type: application/json

{
  "userId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
  "propertyId": 1,
  "content": "I found this laptop in the parking lot"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Property report created successfully",
  "data": {
    "propertyReportId": "5245abb0-c3ba-477f-acee-7906f68544f9",
    "ownerId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "propertyId": 1,
    "status": "not found",
    "createdAt": "2025-12-26T10:00:00.000Z",
    "issuerId": null,
    "updatedAt": "2025-12-26T10:00:00.000Z",
    "content": "I found this laptop in the parking lot",
    "issuedStatus": null,
    "approved": false
  }
}
```

**Status Code:** `201`

---

### Test Case: PR-003 - Update Property Report (Approve)

**Request:**
```http
PATCH /api/property-reports/7ade6518-e951-417d-ab39-72868530ab44
Content-Type: application/json

{
  "approved": true,
  "issuedStatus": "found",
  "status": "found",
  "issuerId": "7ade6518-e951-417d-ab39-72868530ab44"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report updated",
  "data": {
    "propertyReportId": "7ade6518-e951-417d-ab39-72868530ab44",
    "ownerId": "f87566fa-d527-43aa-9bdc-4bf83b64d3c8",
    "propertyId": 1,
    "status": "found",
    "createdAt": "2025-12-20T10:00:00.000Z",
    "issuerId": "7ade6518-e951-417d-ab39-72868530ab44",
    "updatedAt": "2025-12-26T10:00:00.000Z",
    "content": "I lost my laptop in the lobby",
    "issuedStatus": "found",
    "approved": true
  }
}
```

**Status Code:** `200`

---

### Test Case: PR-004 - Delete Property Report

**Request:**
```http
DELETE /api/property-reports/7ade6518-e951-417d-ab39-72868530ab44
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report deleted",
  "data": null
}
```

**Status Code:** `200`

---

## System Tests

### Test Case: SYS-001 - Get System Settings

**Request:**
```http
GET /api/system/settings
```

**Expected Response:**
```json
{
  "success": true,
  "message": "System settings fetched successfully",
  "data": {
    "previewMode": false,
    "databaseUrl": "postgresql://...",
    "storageUrl": "https://...",
    "storageKey": "..."
  }
}
```

**Status Code:** `200`

---

### Test Case: SYS-002 - Generate Database Dump Command

**Request:**
```http
POST /api/system/dump
Content-Type: application/json

{
  "format": "sql",
  "includeSchema": true,
  "includeData": true,
  "tables": ["users", "apartments"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database dump command generated successfully",
  "data": {
    "command": "pg_dump -h localhost -U user -d database -t users -t apartments -f dump_20251226.sql",
    "filename": "dump_20251226.sql"
  }
}
```

**Status Code:** `200`

---

### Test Case: SYS-003 - Generate Tax Report

**Request:**
```http
GET /api/taxes?month=12
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Monthly tax report generated",
  "data": {
    "billingIds": [
      "0e00399d-adb1-44fd-a3a9-eb46d40871c0",
      "01b822e6-752d-4257-a4f2-c88c2df88d69"
    ],
    "totalIncome": 5000.00,
    "totalTax": 250.00
  }
}
```

**Status Code:** `200`

---

## Error Test Cases

### Test Case: ERR-001 - Invalid User ID

**Request:**
```http
GET /api/users/invalid-id
```

**Expected Response:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Status Code:** `404`

---

### Test Case: ERR-002 - Missing Required Fields

**Request:**
```http
POST /api/users
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**Status Code:** `400`

---

### Test Case: ERR-003 - Duplicate Email

**Request:**
```http
POST /api/users
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "fullName": "Test User",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Status Code:** `409`

---

### Test Case: ERR-004 - Unauthorized Access

**Request:**
```http
GET /api/users
```

**Expected Response:** (If authentication is required)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Status Code:** `401`

---

### Test Case: ERR-005 - Method Not Allowed

**Request:**
```http
PATCH /api/users
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

**Status Code:** `405`

---
