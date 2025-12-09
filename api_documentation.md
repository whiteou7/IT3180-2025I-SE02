# API Documentation

This document provides comprehensive documentation for all API endpoints in the Introse SE02 application.

## Base URL

All API endpoints are prefixed with `/api`

## Response Format

All API responses follow a consistent format:

```typescript
{
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
```

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Authentication

### POST /api/auth/login

Authenticate a user and return user information.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "userId": "string",
    "role": "admin" | "tenant" | "police" | "accountant",
    "fullName": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing email or password
- `401` - Invalid credentials
- `405` - Method not allowed

---

### POST /api/auth/reset-password

Reset a user's password using email and phone number verification.

**Request Body:**
```json
{
  "email": "string",
  "phoneNumber": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": {
    "success": true
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing required fields
- `401` - Email and phone number do not match
- `404` - User not found
- `405` - Method not allowed

---

## Users

### POST /api/users

Create a new user account.

**Request Body:**
```json
{
  "email": "string (required)",
  "fullName": "string (required)",
  "password": "string (required)",
  "role": "admin" | "tenant" | "police" | "accountant" (optional, default: "tenant"),
  "yearOfBirth": "number (optional)",
  "gender": "male" | "female" | "other" (optional),
  "phoneNumber": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "userId": "string"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing required fields
- `409` - Email already registered
- `405` - Method not allowed

---

### GET /api/users

Retrieve all users (admin only).

**Response:**
```json
{
  "success": true,
  "message": "User list fetched successfully.",
  "data": [
    {
      "userId": "string",
      "email": "string",
      "fullName": "string",
      "role": "string",
      "yearOfBirth": "number | null",
      "gender": "string | null",
      "phoneNumber": "string | null",
      "apartmentId": "number | null"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### GET /api/users/[id]

Get user information by ID.

**Path Parameters:**
- `id` - User ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Fetched user info",
  "data": {
    "userId": "string",
    "email": "string",
    "fullName": "string",
    "role": "string",
    "yearOfBirth": "number | null",
    "gender": "string | null",
    "phoneNumber": "string | null",
    "apartmentId": "number | null"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - User ID is required
- `404` - User not found
- `405` - Method not allowed

---

### PUT /api/users/[id]

Update user information.

**Path Parameters:**
- `id` - User ID (string)

**Request Body:**
```json
{
  "email": "string",
  "fullName": "string",
  "role": "admin" | "tenant" | "police" | "accountant",
  "yearOfBirth": "number | null",
  "gender": "male" | "female" | "other" | null,
  "phoneNumber": "string | null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Updated user info",
  "data": {
    "userId": "string",
    "email": "string",
    "fullName": "string",
    "role": "string",
    "yearOfBirth": "number | null",
    "gender": "string | null",
    "phoneNumber": "string | null",
    "apartmentId": "number | null"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - User ID is required
- `404` - User not found
- `405` - Method not allowed

---

### GET /api/users/search

Search users by name.

**Query Parameters:**
- `q` - Search query (string, required)
- `userId` - Current user ID (string, required)

**Response:**
```json
{
  "success": true,
  "message": "Users found",
  "data": [
    {
      "userId": "string",
      "email": "string",
      "fullName": "string",
      "role": "string",
      "yearOfBirth": "number | null",
      "gender": "string | null",
      "phoneNumber": "string | null",
      "apartmentId": "number | null"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing query parameters
- `405` - Method not allowed

---

### GET /api/users/[id]/apartments

Get user's apartment information.

**Path Parameters:**
- `id` - User ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Apartment fetched successfully",
  "data": {
    "apartmentId": "number",
    "buildingId": "number",
    "floor": "number",
    "apartmentNumber": "number",
    "monthlyFee": "number",
    "members": [
      {
        "userId": "string",
        "fullName": "string",
        "email": "string"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - User not found or not assigned to apartment
- `405` - Method not allowed

---

### PUT /api/users/[id]/apartments

Assign user to an apartment.

**Path Parameters:**
- `id` - User ID (string)

**Request Body:**
```json
{
  "apartmentId": "number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User added to apartment successfully",
  "data": {
    "apartmentId": "number"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing apartmentId
- `404` - User not found
- `405` - Method not allowed

---

### DELETE /api/users/[id]/apartments

Remove user from apartment.

**Path Parameters:**
- `id` - User ID (string)

**Response:**
```json
{
  "success": true,
  "message": "User removed from apartment successfully",
  "data": null
}
```

**Status Codes:**
- `200` - Success
- `404` - User not found
- `405` - Method not allowed

---

### GET /api/users/[id]/billings

Get all billings for a user.

**Path Parameters:**
- `id` - User ID (string)

**Response:**
```json
{
  "success": true,
  "message": "User billings fetched successfully.",
  "data": [
    {
      "billingId": "string",
      "userId": "string",
      "fullName": "string",
      "totalPrice": "number",
      "billingStatus": "paid" | "unpaid",
      "dueDate": "string",
      "periodStart": "string",
      "periodEnd": "string",
      "paidAt": "string | null",
      "services": [
        {
          "serviceId": "number",
          "serviceName": "string",
          "price": "number",
          "tax": "number",
          "description": "string | null"
        }
      ]
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### GET /api/users/[id]/documents

List all documents for a user.

**Path Parameters:**
- `id` - User ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Documents fetched successfully",
  "data": [
    {
      "name": "string",
      "path": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - User ID is required
- `405` - Method not allowed

---

### POST /api/users/[id]/documents/upload

Upload a document for a user (PDF only, max 10MB).

**Path Parameters:**
- `id` - User ID (string)

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing PDF file

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "path": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid file or missing file
- `405` - Method not allowed

---

### GET /api/users/[id]/documents/[filename]

Download/view a document.

**Path Parameters:**
- `id` - User ID (string)
- `filename` - Document filename (string)

**Response:**
- Content-Type: `application/pdf`
- Body: PDF file buffer

**Status Codes:**
- `200` - Success
- `400` - Missing parameters
- `404` - Document not found
- `405` - Method not allowed

---

### GET /api/users/[id]/properties

Get all properties for a user.

**Path Parameters:**
- `id` - User ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [
    {
      "propertyId": "number",
      "propertyName": "string",
      "userId": "string",
      "isPublic": "boolean",
      "propertyType": "string",
      "status": "string",
      "createdAt": "string",
      "licensePlate": "string | null"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - User ID is required
- `405` - Method not allowed

---

### POST /api/users/[id]/properties

Create a new property for a user.

**Path Parameters:**
- `id` - User ID (string)

**Request Body:**
```json
{
  "propertyName": "string (required)",
  "propertyType": "string (optional, default: 'general')",
  "isPublic": "boolean (optional, default: false)",
  "licensePlate": "string (required if propertyType is 'vehicle')"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "propertyId": "number"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing required fields or invalid data
- `403` - Only administrators can register public properties
- `404` - User not found
- `409` - User already has a vehicle (for vehicle type)
- `405` - Method not allowed

---

### GET /api/users/[id]/properties/[propertyId]

Get a property by ID.

**Path Parameters:**
- `id` - User ID (string)
- `propertyId` - Property ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Property fetched successfully",
  "data": {
    "propertyId": "number",
    "propertyName": "string",
    "userId": "string",
    "isPublic": "boolean",
    "propertyType": "string",
    "status": "string",
    "createdAt": "string",
    "licensePlate": "string | null"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing parameters
- `404` - Property not found
- `405` - Method not allowed

---

### PUT /api/users/[id]/properties/[propertyId]

Update a property.

**Path Parameters:**
- `id` - User ID (string)
- `propertyId` - Property ID (string)

**Request Body:**
```json
{
  "propertyName": "string (optional)",
  "status": "string (optional)",
  "isPublic": "boolean (optional)",
  "licensePlate": "string (optional, for vehicle type)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "propertyId": "number",
    "propertyName": "string",
    "userId": "string",
    "isPublic": "boolean",
    "propertyType": "string",
    "status": "string",
    "createdAt": "string",
    "licensePlate": "string | null"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid data
- `403` - Only administrators can mark properties as public
- `404` - Property not found
- `405` - Method not allowed

---

### DELETE /api/users/[id]/properties/[propertyId]

Delete a property.

**Path Parameters:**
- `id` - User ID (string)
- `propertyId` - Property ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Property deleted successfully",
  "data": {
    "propertyId": "number",
    "propertyName": "string",
    "userId": "string",
    "isPublic": "boolean",
    "propertyType": "string",
    "status": "string",
    "createdAt": "string",
    "licensePlate": "string | null"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing parameters
- `404` - Property not found
- `405` - Method not allowed

---

### GET /api/users/[id]/vehicles

Get vehicle info for a user.

**Path Parameters:**
- `id` - User ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Vehicle info fetched successfully",
  "data": {
    "vehicleId": "number",
    "propertyId": "number",
    "licensePlate": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Vehicle not found for this user
- `405` - Method not allowed

---

### POST /api/users/[id]/vehicle

Create a new vehicle for the user.

**Path Parameters:**
- `id` - User ID (string)

**Request Body:**
```json
{
  "licensePlate": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property and vehicle created successfully",
  "data": {
    "vehicleId": "number",
    "propertyId": "number",
    "licensePlate": "string"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing license plate
- `404` - User not found
- `409` - License plate already registered or user already has a vehicle
- `405` - Method not allowed

---

### PUT /api/users/[id]/vehicle/[vehicleId]

Update vehicle license plate.

**Path Parameters:**
- `id` - User ID (string)
- `vehicleId` - Vehicle ID (string)

**Request Body:**
```json
{
  "licensePlate": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "License plate updated successfully",
  "data": {
    "vehicleId": "number",
    "propertyId": "number",
    "licensePlate": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing license plate
- `404` - Vehicle not found
- `405` - Method not allowed

---

### POST /api/users/[id]/vehicle/checkin

Toggle vehicle entry/exit status.

**Path Parameters:**
- `id` - User ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Vehicle entered" | "Vehicle exited",
  "data": {
    "time": "string (ISO timestamp)"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - User ID is required
- `404` - User or vehicle not found
- `405` - Method not allowed

---

### GET /api/users/[id]/vehicle-logs

Get vehicle logs for a user's vehicle.

**Path Parameters:**
- `id` - User ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Vehicle logs fetched successfully",
  "data": [
    {
      "vehicleLogId": "string",
      "entranceTime": "string",
      "exitTime": "string | null"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - User ID is required
- `405` - Method not allowed

---

## Apartments

### GET /api/apartments

Get all apartments with their members.

**Response:**
```json
{
  "success": true,
  "message": "Apartments fetched successfully.",
  "data": [
    {
      "apartmentId": "number",
      "buildingId": "number",
      "floor": "number",
      "apartmentNumber": "number",
      "monthlyFee": "number",
      "members": [
        {
          "userId": "string",
          "fullName": "string",
          "email": "string"
        }
      ]
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### POST /api/apartments

Create a new apartment.

**Request Body:**
```json
{
  "buildingId": "number (required)",
  "floor": "number (required)",
  "apartmentNumber": "number (required)",
  "monthlyFee": "number (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Apartment created successfully.",
  "data": {
    "apartmentId": "number"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing required fields
- `405` - Method not allowed

---

### GET /api/apartments/[id]

Get apartment information by ID.

**Path Parameters:**
- `id` - Apartment ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Fetched apartment",
  "data": {
    "apartmentId": "number",
    "buildingId": "number",
    "floor": "number",
    "apartmentNumber": "number",
    "monthlyFee": "number",
    "members": [
      {
        "userId": "string",
        "fullName": "string",
        "email": "string"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Apartment not found
- `405` - Method not allowed

---

### PUT /api/apartments/[id]

Update apartment information.

**Path Parameters:**
- `id` - Apartment ID (string)

**Request Body:**
```json
{
  "buildingId": "number (required)",
  "floor": "number (required)",
  "apartmentNumber": "number (required)",
  "monthlyFee": "number (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Apartment updated successfully.",
  "data": {
    "apartmentId": "number",
    "buildingId": "number",
    "floor": "number",
    "apartmentNumber": "number",
    "monthlyFee": "number"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing required fields
- `404` - Apartment not found
- `405` - Method not allowed

---

### DELETE /api/apartments/[id]

Delete an apartment.

**Path Parameters:**
- `id` - Apartment ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Apartment deleted successfully.",
  "data": null
}
```

**Status Codes:**
- `200` - Success
- `404` - Apartment not found
- `405` - Method not allowed

---

## Properties

### GET /api/properties

Get all properties with summary information.

**Response:**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [
    {
      "propertyId": "number",
      "propertyName": "string",
      "userId": "string",
      "isPublic": "boolean",
      "propertyType": "string",
      "status": "string",
      "createdAt": "string",
      "licensePlate": "string | null",
      "ownerName": "string",
      "totalReports": "number",
      "lastReportedAt": "string | null"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### GET /api/properties/available

Get properties available for reporting (found status or never reported).

**Query Parameters:**
- `userId` - User ID (string, required)

**Response:**
```json
{
  "success": true,
  "message": "Available properties fetched successfully",
  "data": [
    {
      "propertyId": "number",
      "propertyName": "string",
      "userId": "string",
      "isPublic": "boolean",
      "propertyType": "string",
      "status": "string",
      "createdAt": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - User ID is required
- `405` - Method not allowed

---

## Services

### GET /api/services

List services with optional filtering.

**Query Parameters:**
- `category` - Filter by category (optional)
- `search` - Search term (optional)
- `availability` - Filter by availability: "available" or "unavailable" (optional)

**Response:**
```json
{
  "success": true,
  "message": "Services fetched successfully.",
  "data": [
    {
      "serviceId": "number",
      "serviceName": "string",
      "price": "number",
      "description": "string | null",
      "tax": "number",
      "category": "cleaning" | "maintenance" | "utilities" | "amenities" | "other",
      "isAvailable": "boolean",
      "updatedAt": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### POST /api/services

Create a new service.

**Request Body:**
```json
{
  "serviceName": "string (required)",
  "price": "number (required, >= 0)",
  "description": "string (optional)",
  "tax": "number (required)",
  "category": "cleaning" | "maintenance" | "utilities" | "amenities" | "other" (optional, default: "other"),
  "isAvailable": "boolean (optional, default: true)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service created successfully.",
  "data": {
    "serviceId": "number"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing required fields or invalid data
- `405` - Method not allowed

---

### GET /api/services/[id]

Get a service by ID.

**Path Parameters:**
- `id` - Service ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Service fetched successfully.",
  "data": {
    "serviceId": "number",
    "serviceName": "string",
    "price": "number",
    "description": "string | null",
    "tax": "number",
    "category": "string",
    "isAvailable": "boolean",
    "updatedAt": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid service ID
- `404` - Service not found
- `405` - Method not allowed

---

### PUT /api/services/[id]

Update a service.

**Path Parameters:**
- `id` - Service ID (string)

**Request Body:**
```json
{
  "serviceName": "string (required)",
  "price": "number (required, >= 0)",
  "description": "string (optional)",
  "tax": "number (required)",
  "category": "cleaning" | "maintenance" | "utilities" | "amenities" | "other" (optional),
  "isAvailable": "boolean (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service updated successfully.",
  "data": {
    "serviceId": "number",
    "serviceName": "string",
    "price": "number",
    "description": "string | null",
    "tax": "number",
    "category": "string",
    "isAvailable": "boolean",
    "updatedAt": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid service ID or missing required fields
- `404` - Service not found
- `405` - Method not allowed

---

### DELETE /api/services/[id]

Delete a service.

**Path Parameters:**
- `id` - Service ID (string)

**Request Body:**
```json
{
  "serviceId": "number (required, must match path parameter)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully.",
  "data": null
}
```

**Status Codes:**
- `200` - Success
- `400` - Service ID mismatch or invalid ID
- `404` - Service not found
- `405` - Method not allowed

---

## Billings

### GET /api/billings

Get billing summaries with optional filtering.

**Query Parameters:**
- `userId` - Filter by user ID (optional)
- `status` - Filter by status: "paid" or "unpaid" (optional)
- `limit` - Limit results (optional, default: 25, max: 200)

**Response:**
```json
{
  "success": true,
  "message": "Billings fetched successfully.",
  "data": [
    {
      "billingId": "string",
      "userId": "string",
      "fullName": "string",
      "billingStatus": "paid" | "unpaid",
      "dueDate": "string",
      "periodStart": "string",
      "periodEnd": "string",
      "paidAt": "string | null",
      "serviceCount": "number",
      "totalAmount": "number",
      "services": [
        {
          "serviceId": "number",
          "serviceName": "string",
          "price": "number",
          "description": "string | null",
          "tax": "number"
        }
      ]
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### POST /api/billings

Create a new billing.

**Request Body:**
```json
{
  "userId": "string (required)",
  "serviceIds": "number[] (required, non-empty)",
  "dueDate": "string (optional, ISO date)",
  "periodStart": "string (optional, ISO date)",
  "periodEnd": "string (optional, ISO date)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Billing created successfully.",
  "data": {
    "billingId": "string"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing required fields or invalid service IDs
- `405` - Method not allowed

---

### GET /api/billings/[id]

Get billing details by ID.

**Path Parameters:**
- `id` - Billing ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Billing details fetched successfully.",
  "data": {
    "billingId": "string",
    "userId": "string",
    "fullName": "string",
    "totalPrice": "number",
    "billingStatus": "paid" | "unpaid",
    "dueDate": "string",
    "periodStart": "string",
    "periodEnd": "string",
    "paidAt": "string | null",
    "services": [
      {
        "serviceId": "number",
        "serviceName": "string",
        "price": "number",
        "tax": "number",
        "description": "string | null"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Billing ID is required
- `404` - Billing not found
- `405` - Method not allowed

---

### PUT /api/billings/[id]

Mark a billing as paid.

**Path Parameters:**
- `id` - Billing ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Billing paid successfully.",
  "data": null
}
```

**Status Codes:**
- `200` - Success
- `400` - Billing ID is required
- `404` - Billing not found
- `405` - Method not allowed

---

### GET /api/billings/[id]/file

Generate a PDF invoice for a billing.

**Path Parameters:**
- `id` - Billing ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Billing PDF generated",
  "data": {
    "billingId": "string",
    "userId": "string",
    "fullName": "string",
    "totalPrice": "number",
    "billingStatus": "paid" | "unpaid",
    "dueDate": "string",
    "periodStart": "string",
    "periodEnd": "string",
    "paidAt": "string | null",
    "services": [
      {
        "serviceId": "number",
        "serviceName": "string",
        "price": "number",
        "tax": "number",
        "description": "string | null"
      }
    ],
    "file": "string (base64 encoded PDF)"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Billing ID is required
- `404` - Billing not found
- `405` - Method not allowed

---

## Posts

### GET /api/posts

Retrieve all posts with optional category filter.

**Query Parameters:**
- `category` - Filter by category (optional, use "all" for all categories)

**Response:**
```json
{
  "success": true,
  "message": "Posts fetched successfully",
  "data": [
    {
      "postId": "string",
      "userId": "string",
      "content": "string",
      "createdAt": "string",
      "fullName": "string",
      "category": "string",
      "title": "string | null"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### POST /api/posts

Create a new post.

**Request Body:**
```json
{
  "content": "string (required)",
  "userId": "string (required)",
  "category": "string (optional)",
  "title": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post created",
  "data": {
    "postId": "string",
    "userId": "string",
    "content": "string",
    "createdAt": "string",
    "fullName": "string",
    "category": "string",
    "title": "string | null"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing required fields
- `405` - Method not allowed

---

### GET /api/posts/[id]

Get a specific post.

**Path Parameters:**
- `id` - Post ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Post fetched successfully",
  "data": {
    "postId": "string",
    "userId": "string",
    "content": "string",
    "createdAt": "string",
    "fullName": "string",
    "category": "string",
    "title": "string | null"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Post ID is required
- `404` - Post not found
- `405` - Method not allowed

---

### PATCH /api/posts/[id]

Update a post (only by owner).

**Path Parameters:**
- `id` - Post ID (string)

**Request Body:**
```json
{
  "userId": "string (required)",
  "title": "string (optional)",
  "content": "string (optional)",
  "category": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "postId": "string",
    "userId": "string",
    "content": "string",
    "createdAt": "string",
    "fullName": "string",
    "category": "string",
    "title": "string | null"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Post ID or User ID is required
- `403` - You can only edit your own posts
- `404` - Post not found
- `405` - Method not allowed

---

### DELETE /api/posts/[id]

Delete a post (only by owner).

**Path Parameters:**
- `id` - Post ID (string)

**Request Body:**
```json
{
  "userId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": null
}
```

**Status Codes:**
- `200` - Success
- `400` - Post ID or User ID is required
- `403` - You can only delete your own posts
- `404` - Post not found
- `405` - Method not allowed

---

## Feedbacks

### GET /api/feedbacks

Retrieve feedbacks (all for admin, own for residents).

**Query Parameters:**
- `userId` - User ID (optional)
- `role` - User role (optional)
- `status` - Filter by status (optional, use "all" for all statuses)

**Response:**
```json
{
  "success": true,
  "message": "Feedbacks fetched successfully",
  "data": [
    {
      "feedbackId": "string",
      "userId": "string",
      "content": "string",
      "tags": "string[]",
      "status": "pending" | "in_progress" | "resolved" | "rejected",
      "createdAt": "string",
      "updatedAt": "string",
      "fullName": "string"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### POST /api/feedbacks

Create a new feedback.

**Request Body:**
```json
{
  "content": "string (required)",
  "userId": "string (required)",
  "tags": "string[] (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback created",
  "data": {
    "feedbackId": "string",
    "userId": "string",
    "content": "string",
    "tags": "string[]",
    "status": "pending",
    "createdAt": "string",
    "updatedAt": "string",
    "fullName": "string"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing required fields
- `405` - Method not allowed

---

### GET /api/feedbacks/[id]

Get a specific feedback.

**Path Parameters:**
- `id` - Feedback ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Feedback fetched successfully",
  "data": {
    "feedbackId": "string",
    "userId": "string",
    "content": "string",
    "tags": "string[]",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "fullName": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Feedback ID is required
- `404` - Feedback not found
- `405` - Method not allowed

---

### PATCH /api/feedbacks/[id]

Update feedback status or tags (admin only for status).

**Path Parameters:**
- `id` - Feedback ID (string)

**Request Body:**
```json
{
  "status": "pending" | "in_progress" | "resolved" | "rejected" (optional),
  "tags": "string[] (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback updated successfully",
  "data": {
    "feedbackId": "string",
    "userId": "string",
    "content": "string",
    "tags": "string[]",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "fullName": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Feedback ID is required or no fields provided
- `404` - Feedback not found
- `405` - Method not allowed

---

### DELETE /api/feedbacks/[id]

Delete a feedback (only by owner).

**Path Parameters:**
- `id` - Feedback ID (string)

**Request Body:**
```json
{
  "userId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback deleted successfully",
  "data": null
}
```

**Status Codes:**
- `200` - Success
- `400` - Feedback ID or User ID is required
- `403` - You can only delete your own feedbacks
- `404` - Feedback not found
- `405` - Method not allowed

---

## Chats

### GET /api/chats

Get all chats for the current user.

**Query Parameters:**
- `userId` - User ID (string, required)

**Response:**
```json
{
  "success": true,
  "message": "Chats fetched successfully",
  "data": [
    {
      "chatId": "string",
      "user1Id": "string",
      "user2Id": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "otherUser": {
        "userId": "string",
        "email": "string",
        "fullName": "string",
        "role": "string",
        "yearOfBirth": "number | null",
        "gender": "string | null",
        "phoneNumber": "string | null",
        "apartmentId": "number | null"
      },
      "lastMessage": {
        "messageId": "string",
        "chatId": "string",
        "senderId": "string",
        "content": "string",
        "createdAt": "string",
        "readAt": "string | null"
      },
      "unreadCount": "number"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - User ID is required
- `405` - Method not allowed

---

### POST /api/chats

Create a new chat conversation.

**Request Body:**
```json
{
  "userId": "string (required)",
  "otherUserId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat created successfully",
  "data": {
    "chatId": "string",
    "user1Id": "string",
    "user2Id": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "otherUser": {
      "userId": "string",
      "email": "string",
      "fullName": "string",
      "role": "string",
      "yearOfBirth": "number | null",
      "gender": "string | null",
      "phoneNumber": "string | null",
      "apartmentId": "number | null"
    }
  }
}
```

**Status Codes:**
- `200` - Chat already exists
- `201` - Created
- `400` - Missing required fields or cannot create chat with yourself
- `403` - Non-admin users can only chat with admin
- `404` - One or both users not found
- `405` - Method not allowed

---

### GET /api/chats/[chatId]/messages

Get all messages for a chat.

**Path Parameters:**
- `chatId` - Chat ID (string)

**Query Parameters:**
- `userId` - User ID (string, required)

**Response:**
```json
{
  "success": true,
  "message": "Messages fetched successfully",
  "data": [
    {
      "messageId": "string",
      "chatId": "string",
      "senderId": "string",
      "content": "string",
      "createdAt": "string",
      "readAt": "string | null",
      "sender": {
        "userId": "string",
        "email": "string",
        "fullName": "string",
        "role": "string",
        "yearOfBirth": "number | null",
        "gender": "string | null",
        "phoneNumber": "string | null",
        "apartmentId": "number | null"
      }
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Chat ID or User ID is required
- `403` - You do not have access to this chat
- `404` - Chat not found
- `405` - Method not allowed

---

### POST /api/chats/[chatId]/messages

Send a new message in a chat.

**Path Parameters:**
- `chatId` - Chat ID (string)

**Request Body:**
```json
{
  "userId": "string (required)",
  "content": "string (required, non-empty)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "string",
    "chatId": "string",
    "senderId": "string",
    "content": "string",
    "createdAt": "string",
    "readAt": "string | null",
    "sender": {
      "userId": "string",
      "email": "string",
      "fullName": "string",
      "role": "string",
      "yearOfBirth": "number | null",
      "gender": "string | null",
      "phoneNumber": "string | null",
      "apartmentId": "number | null"
    }
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing required fields or empty content
- `403` - You do not have access to this chat
- `404` - Chat not found
- `405` - Method not allowed

---

## Property Reports

### GET /api/property-reports

Retrieve all property reports with user and issuer information.

**Response:**
```json
{
  "success": true,
  "message": "Property reports fetched successfully",
  "data": [
    {
      "propertyReportId": "string",
      "ownerId": "string",
      "propertyId": "number",
      "status": "string",
      "createdAt": "string",
      "issuerId": "string | null",
      "ownerFullName": "string",
      "issuerFullName": "string | null",
      "updatedAt": "string",
      "propertyName": "string",
      "content": "string",
      "issuedStatus": "string | null",
      "approved": "boolean"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### POST /api/property-reports

Create a new property report.

**Request Body:**
```json
{
  "userId": "string (required)",
  "propertyId": "number (required)",
  "content": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property report created successfully",
  "data": {
    "propertyReportId": "string",
    "ownerId": "string",
    "propertyId": "number",
    "status": "not found",
    "createdAt": "string",
    "issuerId": "string | null",
    "updatedAt": "string",
    "content": "string",
    "issuedStatus": "string | null",
    "approved": "boolean"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Missing required fields
- `405` - Method not allowed

---

### PATCH /api/property-reports/[id]

Update property report status.

**Path Parameters:**
- `id` - Property Report ID (string)

**Request Body:**
```json
{
  "approved": "boolean (optional)",
  "issuedStatus": "string | null (optional)",
  "status": "string | null (optional)",
  "issuerId": "string | null (optional, required if approving)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report updated",
  "data": {
    "propertyReportId": "string",
    "ownerId": "string",
    "propertyId": "number",
    "status": "string",
    "createdAt": "string",
    "issuerId": "string | null",
    "updatedAt": "string",
    "content": "string",
    "issuedStatus": "string | null",
    "approved": "boolean"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - No updatable fields provided or missing issuerId for approval
- `403` - You are not allowed to approve this report
- `404` - Property report or approver not found
- `405` - Method not allowed

---

### DELETE /api/property-reports/[id]

Delete a property report.

**Path Parameters:**
- `id` - Property Report ID (string)

**Response:**
```json
{
  "success": true,
  "message": "Report deleted",
  "data": null
}
```

**Status Codes:**
- `200` - Success
- `404` - Report not found
- `405` - Method not allowed

---

## Vehicles

### GET /api/vehicles/checkin

Retrieve vehicle logs with filtering options.

**Query Parameters:**
- `userId` - Filter by user ID (optional)
- `filter` - Time filter: "week", "month", or "year" (optional)

**Response:**
```json
{
  "success": true,
  "message": "Fetched vehicle logs successfully.",
  "data": {
    "logs": [
      {
        "vehicleLogId": "string",
        "entranceTime": "string",
        "exitTime": "string | null",
        "vehicleId": "number",
        "licensePlate": "string",
        "userId": "string",
        "fullName": "string",
        "apartmentId": "number | null",
        "apartmentNumber": "number | null",
        "buildingId": "number | null",
        "floor": "number | null"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

## System

### GET /api/system/settings

Get system settings (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "System settings fetched successfully",
  "data": {
    "previewMode": "boolean",
    "databaseUrl": "string",
    "storageUrl": "string",
    "storageKey": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `405` - Method not allowed

---

### POST /api/system/dump

Generate database dump bash command (Admin only).

**Request Body:**
```json
{
  "format": "sql" | "csv" | "json",
  "includeSchema": "boolean",
  "includeData": "boolean",
  "tables": "string[] (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Database dump command generated successfully",
  "data": {
    "command": "string (bash command)",
    "filename": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid options or database URL not configured
- `405` - Method not allowed

---

## Taxes

### GET /api/taxes

Generate monthly tax report.

**Query Parameters:**
- `month` - Month number (1-12) or "current" (optional, default: current month)

**Response:**
```json
{
  "success": true,
  "message": "Monthly tax report generated",
  "data": {
    "billingIds": "string[]",
    "totalIncome": "number",
    "totalTax": "number"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid month (must be 1-12 or "current")
- `405` - Method not allowed

---

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `405` - Method Not Allowed (HTTP method not supported)
- `409` - Conflict (resource already exists or constraint violation)
- `500` - Internal Server Error

---

## Notes

1. All date/time fields are returned as ISO 8601 strings.
2. User roles: `admin`, `tenant`, `police`, `accountant`
3. Property types: `general`, `vehicle`, etc.
4. Service categories: `cleaning`, `maintenance`, `utilities`, `amenities`, `other`
5. Feedback statuses: `pending`, `in_progress`, `resolved`, `rejected`
6. Post categories vary by implementation
7. Billing statuses: `paid`, `unpaid`
8. Property statuses: `found`, `not found`, `deleted`
9. Non-admin users (tenant, police, accountant) can only chat with admin users
10. Each user can only register one vehicle
11. Document uploads are limited to PDF files with a maximum size of 10MB
12. Tax calculation uses an 8% rate on the base income

